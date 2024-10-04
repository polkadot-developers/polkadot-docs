import requests
import json
import os
import sys
from urllib.parse import urlparse

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")


def parse_github_url(url):
    """Extract owner and repo from a GitHub URL."""
    try:
        path = urlparse(url).path.strip("/")
        return path.split("/")[-2:]
    except Exception as e:
        print(f"Error parsing GitHub URL: {e}")
        sys.exit(1)


def issue_exists(owner, repo, title):
    """Check if an issue with the same title already exists."""
    try:
        url = f"https://api.github.com/repos/polkadot-developers/polkadot-docs/issues"
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


def create_github_issue(owner, repo, title, body):
    """Create a GitHub issue using the GitHub API."""
    try:
        if issue_exists(owner, repo, title):
            print(f"Issue '{title}' already exists. Skipping creation.")
            return

        url = f"https://api.github.com/repos/polkadot-developers/polkadot-docs/issues"
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
            print(
                f"Failed to create issue '{title}'. Status code: {response.status_code}"
            )
            print(response.text)
            sys.exit(1)
    except Exception as e:
        print(f"Error creating issue: {e}")
        sys.exit(1)


def main():
    # Check if GITHUB_TOKEN is set
    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN environment variable is not set.")
        sys.exit(1)

    # Read the JSON file with outdated repositories
    try:
        with open("outdated_repositories.json", "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)

    for repo in data.get("outdated_repos", []):
        owner, repo_name = parse_github_url(repo["repository"])
        title = f"Update needed: {repo_name} ({repo['current_version']} -> {repo['latest_version']})"
        body = f"""A new release has been detected for {repo['repository']}.
Current version: {repo['current_version']}
Latest version: {repo['latest_version']}

Please review the change log and update the documentation accordingly."""

        create_github_issue(owner, repo_name, title, body)


if __name__ == "__main__":
    main()