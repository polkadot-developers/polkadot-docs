import requests
import json
import os
import sys

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

def issue_exists(title):
    """Check if an issue with the same title already exists."""
    try:
        url = "https://api.github.com/repos/polkadot-developers/polkadot-docs/issues"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        issues = response.json()
        for issue in issues:
            if issue["title"] == title:
                return True
        return False
    except Exception as e:
        print(f"Error checking for existing issues: {e}")
        sys.exit(1)

def create_github_issue(title, body):
    """Create a GitHub issue using the GitHub API."""
    try:
        if issue_exists(title):
            print(f"Issue '{title}' already exists. Skipping creation.")
            return

        url = "https://api.github.com/repos/polkadot-developers/polkadot-docs/issues"
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        data = {"title": title, "body": body}
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 201:
            print(f"Successfully created issue '{title}'")
            return
        else:
            print(f"Failed to create issue '{title}'. Status code: {response.status_code}")
            print(response.text)
            sys.exit(1)
    except Exception as e:
        print(f"Error creating issue: {e}")
        sys.exit(1)

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

    for dep in data.get("outdated_dependencies", []):
        title = f"Update needed: {dep['name']} ({dep['current_version']} -> {dep['latest_version']})"
        body = f"""A new release has been detected for {dep['name']}.

Category: {dep['category']}
Current version: {dep['current_version']}
Latest version: {dep['latest_version']}

Latest release: [View here]({dep['latest_release_url']})

Please review the change log and update the documentation accordingly."""

        create_github_issue(title, body)

if __name__ == "__main__":
    main()
