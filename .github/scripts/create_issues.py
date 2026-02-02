import requests
import json
import os
import sys
import difflib
import time
import re

# --- Configuration ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_NAME = os.environ.get("GITHUB_REPOSITORY", "polkadot-developers/polkadot-docs")
REPO_API_URL = f"https://api.github.com/repos/{REPO_NAME}/issues"
REQUEST_TIMEOUT = 30  # seconds
MAX_DIFF_LINES = 100  # Limit diff output
MAX_SNIPPETS = 10     # Limit number of snippets
WRITE_DELAY = 1.5     # Increased slightly for better safety against abuse detection
IGNORE_LABEL = "ignore-dep-bot"

# Cache for default branch
_default_branch = None

def get_default_branch():
    """Fetch the default branch to ensure links work on forks/renamed branches."""
    global _default_branch
    if _default_branch is not None: return _default_branch
    try:
        url = f"https://api.github.com/repos/{REPO_NAME}"
        headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        _default_branch = response.json().get("default_branch", "main")
        return _default_branch
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
    except:
        print(f"Response text: {response.text}")
    
    # Return True if error is likely transient or rate-limit related
    return status in (403, 429, 502, 503)

def extract_dep_name_from_body(body):
    """Extract dependency name using the hidden marker."""
    if not body: return None
    # Case-insensitive match for robustness
    match = re.search(r'', body, re.IGNORECASE)
    return match.group(1).strip() if match else None

def get_existing_issues():
    """
    Retrieve all issues and index them by the Hidden Dependency Marker.
    Returns: (dict_by_dep_name, success_bool)
    """
    try:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "polkadot-docs-dep-bot",
        }
        issues = []
        page = 1
        
        print("Fetching existing issues to build cache...")
        while True:
            # sort=created direction=desc ensures we get the NEWEST issues first
            params = {'state': 'all', 'sort': 'created', 'direction': 'desc', 'per_page': 100, 'page': page}
            response = requests.get(REPO_API_URL, headers=headers, params=params, timeout=REQUEST_TIMEOUT)
            
            if response.status_code != 200:
                if handle_api_error(response, "fetching issues"): return {}, False
                return {}, False
            
            page_issues = response.json()
            if not page_issues: break
            
            issues.extend([i for i in page_issues if "pull_request" not in i])
            page += 1
            
            # Safety break for massive repos to prevent infinite loops (optional, set high)
            if page > 50: 
                print("Warning: Scanned 5000 issues, stopping to prevent timeout.")
                break
        
        result = {}
        for issue in issues:
            body = issue.get("body", "") or ""
            dep_name = extract_dep_name_from_body(body)
            
            if not dep_name: continue
            
            # Since we iterate newest-first, the first time we see a dep_name, 
            # it is the most relevant issue.
            if dep_name not in result:
                result[dep_name] = issue
            elif result[dep_name]["state"] == "closed" and issue["state"] == "open":
                # Upgrade to the open issue if we previously only found a closed one
                result[dep_name] = issue
                
        return result, True
    except Exception as e:
        print(f"Error retrieving existing issues: {e}")
        return {}, False

def create_github_issue(title, body):
    try:
        headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
        data = {"title": title, "body": body}
        response = requests.post(REPO_API_URL, headers=headers, json=data, timeout=REQUEST_TIMEOUT)
        time.sleep(WRITE_DELAY) # Rate limit safety

        if response.status_code == 201:
            print(f"Successfully created issue '{title}'")
            return True
        handle_api_error(response, f"creating issue '{title}'")
        return False
    except Exception as e:
        print(f"Error creating issue: {e}")
        return False

def add_comment_to_issue(issue_number, body):
    try:
        url = f"{REPO_API_URL}/{issue_number}/comments"
        headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
        response = requests.post(url, headers=headers, json={"body": body}, timeout=REQUEST_TIMEOUT)
        time.sleep(WRITE_DELAY) # Rate limit safety

        if response.status_code == 201:
            print(f"Successfully added comment to #{issue_number}")
            return True
        handle_api_error(response, f"adding comment to #{issue_number}")
        return False
    except Exception as e:
        print(f"Error adding comment: {e}")
        return False

def get_issue_comments(issue_number, stop_marker=None):
    try:
        url = f"{REPO_API_URL}/{issue_number}/comments"
        headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
        all_comments = []
        page = 1
        
        while True:
            params = {'per_page': 100, 'page': page}
            response = requests.get(url, headers=headers, params=params, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            page_comments = response.json()
            if not page_comments: break
            
            for comment in page_comments:
                body = comment.get('body', '')
                all_comments.append(body)
                if stop_marker and body and stop_marker in body:
                    return all_comments
            page += 1
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
        dep_marker = f""
        version_marker = f""
        
        # Construct Body
        body = f"""{dep_marker}\n{version_marker}
A new release has been detected for {dep_name}.

**Category:** {dep.get('category', 'N/A')}
**Current:** {dep.get('current_version')}
**Latest:** {dep.get('latest_version')}

[View Changelog]({dep.get('latest_release_url')})
"""
        if dep.get('outdated_snippets'):
            body += "\n## Outdated Code Snippets\n\n"
            snippets = dep['outdated_snippets']
            for i, snippet in enumerate(snippets[:MAX_SNIPPETS], 1):
                fpath = snippet.get('file', '')
                clean_path = fpath[2:] if fpath.startswith("./") else fpath
                repo_url = f"https://github.com/{REPO_NAME}/blob/{default_branch}/{clean_path}?plain=1#L{snippet.get('line_number')}"
                
                body += f"### {i}. [{fpath}:{snippet.get('line_number')}]({repo_url})\n\n"
                body += f"**Current URL:** {snippet.get('current_url')}\n**Latest URL:** {snippet.get('latest_url')}\n\n"
                
                if 'current_code' in snippet and 'latest_code' in snippet:
                    body += "**Code Difference:**\n" + format_code_diff(snippet['current_code'], snippet['latest_code']) + "\n"
            
            if len(snippets) > MAX_SNIPPETS:
                body += f"\n*... and {len(snippets) - MAX_SNIPPETS} more occurrences.*\n"

        # 3. Decision Logic
        if dep_name in existing_issues:
            issue = existing_issues[dep_name]
            num = issue["number"]
            labels = [l["name"] for l in issue.get("labels", [])]
            
            # Check for Ignore Label
            if IGNORE_LABEL in labels:
                print(f"Skipping {dep_name}: #{num} has '{IGNORE_LABEL}'.")
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
            if issue["state"] == "closed":
                print(f"Issue #{num} is closed and outdated. Creating NEW issue...")
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
