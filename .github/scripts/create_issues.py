import requests
import json
import os
import sys

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_NAME = os.environ.get("GITHUB_REPOSITORY", "polkadot-developers/polkadot-docs")
REPO_API_URL = f"https://api.github.com/repos/{REPO_NAME}/issues"

def get_existing_issues():
    """Retrieve all existing issues from GitHub and return a dictionary of {title: number}."""
    try:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        api_url_with_query = f"{REPO_API_URL}?per_page=100"
        response = requests.get(api_url_with_query, headers=headers)
        response.raise_for_status()

        issues = response.json()
        return {issue["title"]: issue["number"] for issue in issues}
    except Exception as e:
        print(f"Error retrieving existing issues: {e}")
        sys.exit(1)

def create_github_issue(title, body):
    """Create a GitHub issue using the GitHub API."""
    try:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        data = {"title": title, "body": body}
        response = requests.post(REPO_API_URL, headers=headers, json=data)

        if response.status_code == 201:
            print(f"Successfully created issue '{title}'")
        else:
            print(f"Failed to create issue '{title}'. Status code: {response.status_code}")
            print(response.text)
            sys.exit(1)
    except Exception as e:
        print(f"Error creating issue: {e}")
        sys.exit(1)

def add_comment_to_issue(issue_number, body):
    """Add a comment to an existing GitHub issue."""
    try:
        url = f"{REPO_API_URL}/{issue_number}/comments"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        data = {"body": body}
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 201:
            print(f"Successfully added comment to issue #{issue_number}")
        else:
            print(f"Failed to add comment to issue #{issue_number}. Status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error adding comment to issue: {e}")

def get_issue_comments(issue_number):
    """Retrieve all comments for a given issue."""
    try:
        url = f"{REPO_API_URL}/{issue_number}/comments"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return [comment['body'] for comment in response.json()]
    except Exception as e:
        print(f"Error retrieving comments for issue #{issue_number}: {e}")
        return []

def format_code_diff(current_code, latest_code):
    """Format the code difference for GitHub markdown."""
    diff_md = "```diff\n"
    
    # Split the code into lines
    current_lines = current_code.splitlines() if current_code else []
    latest_lines = latest_code.splitlines() if latest_code else []
    
    # Simple diff: prefix removed lines with - and added lines with +
    for line in current_lines:
        diff_md += f"- {line}\n"
    
    for line in latest_lines:
        diff_md += f"+ {line}\n"
    
    diff_md += "```\n"
    return diff_md

def main():
    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN environment variable is not set.")
        sys.exit(1)

    try:
        with open("outdated_dependencies.json", "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)

    existing_issues = get_existing_issues()

    for dep in data.get("outdated_dependencies", []):
        # Use generic title to group updates for the same dependency
        title = f"Update needed: {dep['name']}"
        body = f"""A new release has been detected for {dep['name']}.

**Category:** {dep['category']}
**Current version:** {dep['current_version']}
**Latest version:** {dep['latest_version']}

Please review the [changelog]({dep['latest_release_url']}) and update the documentation accordingly.
"""

        # Add outdated snippets information if available
        if 'outdated_snippets' in dep and dep['outdated_snippets']:
            body += "\n## Outdated Code Snippets\n\n"
            body += "The following code snippets in the documentation need to be updated:\n\n"
            
            for i, snippet in enumerate(dep['outdated_snippets'], 1):
                file_path = snippet['file']
                line_number = snippet['line_number']
                current_url = snippet['current_url']
                latest_url = snippet['latest_url']
                
                # Include file path and line number as a link to the repository file if possible
                repo_file_path = f"https://github.com/polkadot-developers/polkadot-docs/blob/master/{file_path.replace('./', '')}?plain=1#L{line_number}"
                body += f"### {i}. [{file_path}:{line_number}]({repo_file_path})\n\n"
                
                # Add URLs for reference
                body += f"**Current URL:** {current_url}\n\n"
                body += f"**Latest URL:** {latest_url}\n\n"
                
                # If the comparison results include the actual code snippets, show the diff
                if 'current_code' in snippet and 'latest_code' in snippet:
                    body += "**Code Difference:**\n\n"
                    body += format_code_diff(snippet['current_code'], snippet['latest_code'])
                    body += "\n"

        if title in existing_issues:
            issue_number = existing_issues[title]
            comments = get_issue_comments(issue_number)
            
            # Check if this update has already been posted
            # We check if the unique identifier of the update (the version part) is already in any comment
            duplicate_found = False
            version_identifier = f"Latest version: {dep['latest_version']}"
            
            for comment in comments:
                if body == comment or version_identifier in comment:
                     duplicate_found = True
                     break
            
            if duplicate_found:
                print(f"Skipping comment on issue #{issue_number} as an update for version {dep['latest_version']} already exists.")
            else:
                print(f"Issue '{title}' already exists (Issue #{issue_number}). Adding comment.")
                add_comment_to_issue(issue_number, body)
        else:
            print(f"Creating new issue '{title}'...")
            create_github_issue(title, body)

if __name__ == "__main__":
    main()
