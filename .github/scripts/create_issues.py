import requests
import json
import os
import sys

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_API_URL = "https://api.github.com/repos/polkadot-developers/polkadot-docs/issues"

def get_existing_issues():
    """Retrieve all existing issues from GitHub and return their titles."""
    try:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        api_url_with_query = f"{REPO_API_URL}?per_page=100"
        response = requests.get(api_url_with_query, headers=headers)
        response.raise_for_status()

        issues = response.json()
        return {issue["title"] for issue in issues}
    except Exception as e:
        print(f"Error retrieving existing issues: {e}")
        sys.exit(1)

def create_github_issue(title, body, existing_issues):
    """Create a GitHub issue using the GitHub API if it does not already exist."""
    if title in existing_issues:
        print(f"Issue '{title}' already exists. Skipping creation.")
        return

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
        title = f"Update needed: {dep['name']} ({dep['current_version']} -> {dep['latest_version']})"
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

        create_github_issue(title, body, existing_issues)

if __name__ == "__main__":
    main()