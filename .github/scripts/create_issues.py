import requests
import json
import os
import sys
import difflib
import time
import re
from functools import lru_cache

# --- Configuration ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
DEFAULT_REPO_NAME = "polkadot-developers/polkadot-docs"
READ_DELAY = 0.25  # Small delay after GET requests in loops to avoid secondary rate limits

def _validate_repo_name(name: str) -> str:
    """
    Validate the repository name from GITHUB_REPOSITORY.
    Expected format: 'owner/repo' with GitHub-compatible characters.
    Falls back to DEFAULT_REPO_NAME on invalid input.
    """
    if not name:
        return DEFAULT_REPO_NAME
    # Allow alphanumeric characters plus '.', '_', and '-' in both owner and repo parts
    if re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", name):
        return name
    print(f"Warning: Invalid GITHUB_REPOSITORY value '{name}', falling back to default '{DEFAULT_REPO_NAME}'.")
    return DEFAULT_REPO_NAME

RAW_REPO_NAME = os.environ.get("GITHUB_REPOSITORY", DEFAULT_REPO_NAME)
REPO_NAME = _validate_repo_name(RAW_REPO_NAME)
REPO_API_URL = f"https://api.github.com/repos/{REPO_NAME}/issues"
REQUEST_TIMEOUT = 30  # seconds
MAX_DIFF_LINES = 100  # Limit diff output
MAX_SNIPPETS = 10     # Limit number of snippets
WRITE_DELAY = 1.5     # Increased slightly for better safety against abuse detection
IGNORE_LABEL = "ignore-dep-bot"
USER_AGENT = "polkadot-docs-dep-bot"

# Common headers for all API requests
def get_api_headers():
    return {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": USER_AGENT,
    }

@lru_cache(maxsize=1)
def get_default_branch():
    """Fetch the default branch to ensure links work on forks/renamed branches."""
    try:
        url = f"https://api.github.com/repos/{REPO_NAME}"
        response = requests.get(url, headers=get_api_headers(), timeout=REQUEST_TIMEOUT)
        if response.status_code != 200:
            handle_api_error(response, "fetching default branch")
            return "main"
        return response.json().get("default_branch", "main")
    except Exception as e:
        print(f"Warning: Could not fetch default branch, defaulting to 'main': {e}")
        return "main"

def handle_api_error(response, context="API call"):
    """Handle API errors with detailed logging."""
    status = response.status_code
    remaining = response.headers.get('X-RateLimit-Remaining', 'unknown')
    
    print(f"Error during {context}. Status: {status} | Rate Limit Remaining: {remaining}")
    try:
        print(f"Details: {json.dumps(response.json(), indent=2)}")
    except (ValueError, json.JSONDecodeError):
        print(f"Response text: {response.text}")
    
    # Return True if error is likely transient or rate-limit related
    return status in (403, 429, 502, 503)

def extract_dep_name_from_body(body):
    """Extract dependency name using the hidden marker."""
    if not body: return None
    # Match <!-- DEP: NAME --> (case-insensitive)
    match = re.search(r'<!--\s*DEP:\s*(.+?)\s*-->', body, re.IGNORECASE)
    return match.group(1).strip() if match else None

def get_existing_issues():
    """
    Retrieve all issues and index them by the Hidden Dependency Marker.
    Returns: (dict_by_dep_name, success_bool)
    
    For each dependency, prefers the newest OPEN issue. If no open issue exists,
    uses the newest closed issue.
    """
    try:
        issues = []
        page = 1
        
        print("Fetching existing issues to build cache...")
        while True:
            # sort=created direction=desc ensures we get the NEWEST issues first
            params = {'state': 'all', 'sort': 'created', 'direction': 'desc', 'per_page': 100, 'page': page}
            response = requests.get(REPO_API_URL, headers=get_api_headers(), params=params, timeout=REQUEST_TIMEOUT)
            
            if response.status_code != 200:
                handle_api_error(response, "fetching issues")
                return {}, False
            
            page_issues = response.json()
            if not page_issues: break
            
            issues.extend([i for i in page_issues if "pull_request" not in i])
            page += 1
            time.sleep(READ_DELAY)  # Small delay to avoid secondary rate limits
            
            # Safety break for massive repos to prevent infinite loops
            if page > 50: 
                print("Warning: Scanned 5000 issues, stopping to prevent timeout.")
                break
        
        # First pass: collect all issues per dependency
        issues_by_dep = {}
        for issue in issues:
            body = issue.get("body", "") or ""
            dep_name = extract_dep_name_from_body(body)
            
            if not dep_name: continue
            
            if dep_name not in issues_by_dep:
                issues_by_dep[dep_name] = []
            issues_by_dep[dep_name].append(issue)
        
        # Second pass: select best issue per dependency (prefer newest open, then newest closed)
        result = {}
        for dep_name, dep_issues in issues_by_dep.items():
            # Issues are already sorted newest-first from the API
            open_issues = [i for i in dep_issues if i["state"] == "open"]
            if open_issues:
                result[dep_name] = open_issues[0]  # Newest open
            else:
                result[dep_name] = dep_issues[0]  # Newest closed (since no open exists)
                
        return result, True
    except Exception as e:
        print(f"Error retrieving existing issues: {e}")
        return {}, False

def create_github_issue(title, body):
    """Create a GitHub issue. Returns True on success, False on failure."""
    try:
        data = {"title": title, "body": body}
        response = requests.post(REPO_API_URL, headers=get_api_headers(), json=data, timeout=REQUEST_TIMEOUT)
        time.sleep(WRITE_DELAY)  # Rate limit safety

        if response.status_code == 201:
            print(f"Successfully created issue '{title}'")
            return True
        handle_api_error(response, f"creating issue '{title}'")
        return False
    except Exception as e:
        print(f"Error creating issue: {e}")
        return False

def add_comment_to_issue(issue_number, body):
    """Add a comment to an existing issue. Returns True on success, False on failure."""
    try:
        url = f"{REPO_API_URL}/{issue_number}/comments"
        response = requests.post(url, headers=get_api_headers(), json={"body": body}, timeout=REQUEST_TIMEOUT)
        time.sleep(WRITE_DELAY)  # Rate limit safety

        if response.status_code == 201:
            print(f"Successfully added comment to #{issue_number}")
            return True
        handle_api_error(response, f"adding comment to #{issue_number}")
        return False
    except Exception as e:
        print(f"Error adding comment: {e}")
        return False

def get_issue_comments(issue_number, stop_marker=None):
    """Retrieve comments for an issue, with optional early return when marker found."""
    try:
        url = f"{REPO_API_URL}/{issue_number}/comments"
        all_comments = []
        page = 1
        
        while True:
            params = {'per_page': 100, 'page': page}
            response = requests.get(url, headers=get_api_headers(), params=params, timeout=REQUEST_TIMEOUT)
            
            if response.status_code != 200:
                handle_api_error(response, f"retrieving comments for #{issue_number}")
                return []
            
            page_comments = response.json()
            if not page_comments: break
            
            for comment in page_comments:
                body = comment.get('body', '')
                all_comments.append(body)
                if stop_marker and body and stop_marker in body:
                    return all_comments
            page += 1
            time.sleep(READ_DELAY)  # Small delay to avoid secondary rate limits
        return all_comments
    except Exception as e:
        print(f"Error retrieving comments for #{issue_number}: {e}")
        return []

def format_code_diff(current_code, latest_code):
    current_lines = (current_code or "").splitlines(keepends=True)
    latest_lines = (latest_code or "").splitlines(keepends=True)
    
    # Normalize newlines
    if current_lines and not current_lines[-1].endswith('\n'): current_lines[-1] += '\n'
    if latest_lines and not latest_lines[-1].endswith('\n'): latest_lines[-1] += '\n'
    
    diff_lines = list(difflib.unified_diff(current_lines, latest_lines, fromfile="current", tofile="latest"))
    
    truncated = len(diff_lines) > MAX_DIFF_LINES
    if truncated: diff_lines = diff_lines[:MAX_DIFF_LINES]
    
    if not diff_lines: return "```\nNo differences found.\n```\n"
    
    diff_output = "```diff\n" + "".join(diff_lines) + "```\n"
    if truncated: diff_output += f"\n*... truncated (showing {MAX_DIFF_LINES} lines).*\n"
    return diff_output

def main():
    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN not set.")
        sys.exit(1)

    try:
        with open("outdated_dependencies.json", "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}")
        sys.exit(1)

    # 1. Build Index of Existing Issues
    existing_issues, api_success = get_existing_issues()
    if not api_success:
        print("Aborting to prevent duplicates due to API failure.")
        sys.exit(1)
    
    default_branch = get_default_branch()
    errors_occurred = False
    
    # 2. Process Dependencies
    for dep in data.get("outdated_dependencies", []):
        dep_name = dep.get('name')
        if not dep_name: continue
        
        title = f"Update needed: {dep_name}"
        current_version = dep.get('current_version', 'unknown')
        latest_version = dep.get('latest_version', 'unknown')
        
        # Hidden markers for tracking (must match extract_dep_name_from_body regex)
        dep_marker = f"<!-- DEP: {dep_name} -->"
        version_marker = f"<!-- VERSION: {current_version} -> {latest_version} -->"
        
        # Construct Body
        body = f"""{dep_marker}
{version_marker}
A new release has been detected for {dep_name}.

**Category:** {dep.get('category', 'N/A')}
**Current:** {current_version}
**Latest:** {latest_version}

[View Changelog]({dep.get('latest_release_url', '')})
"""
        if dep.get('outdated_snippets'):
            body += "\n## Outdated Code Snippets\n\n"
            snippets = dep['outdated_snippets']
            for i, snippet in enumerate(snippets[:MAX_SNIPPETS], 1):
                fpath = snippet.get('file', 'unknown')
                line_num = snippet.get('line_number', 1)  # Default to 1 to avoid #LNone
                clean_path = fpath[2:] if fpath.startswith("./") else fpath
                repo_url = f"https://github.com/{REPO_NAME}/blob/{default_branch}/{clean_path}?plain=1#L{line_num}"
                
                body += f"### {i}. [{fpath}:{line_num}]({repo_url})\n\n"
                body += f"**Current URL:** {snippet.get('current_url', 'N/A')}\n**Latest URL:** {snippet.get('latest_url', 'N/A')}\n\n"
                
                if 'current_code' in snippet and 'latest_code' in snippet:
                    body += "**Code Difference:**\n" + format_code_diff(snippet['current_code'], snippet['latest_code']) + "\n"
            
            if len(snippets) > MAX_SNIPPETS:
                body += f"\n*... and {len(snippets) - MAX_SNIPPETS} more occurrences.*\n"

        # 3. Decision Logic
        if dep_name in existing_issues:
            issue = existing_issues[dep_name]
            num = issue["number"]
            labels = [l["name"] for l in issue.get("labels", [])]
            issue_state = issue["state"]
            
            # Check for Ignore Label - but only block if issue is OPEN
            # Closed issues with ignore label should allow new issues for new versions
            if IGNORE_LABEL in labels and issue_state == "open":
                print(f"Skipping {dep_name}: Open issue #{num} has '{IGNORE_LABEL}'.")
                continue

            # Check duplication via Body or Comments
            cached_body = issue.get("body", "")
            if cached_body and version_marker in cached_body:
                print(f"Skipping {dep_name}: Version already in body of #{num}.")
                continue
                
            # Check Comments (only if not in body)
            comments = get_issue_comments(num, stop_marker=version_marker)
            if any(version_marker in c for c in comments):
                print(f"Skipping {dep_name}: Version already in comments of #{num}.")
                continue

            # If we get here, the version is NEW for this issue
            if issue_state == "closed":
                print(f"Issue #{num} is closed. Creating NEW issue for {dep_name}...")
                if not create_github_issue(title, body): errors_occurred = True
            else:
                print(f"Adding update comment to #{num}...")
                if not add_comment_to_issue(num, body): errors_occurred = True
        else:
            print(f"Creating new issue '{title}'...")
            if not create_github_issue(title, body): errors_occurred = True

    if errors_occurred: sys.exit(1)

if __name__ == "__main__":
    main()
