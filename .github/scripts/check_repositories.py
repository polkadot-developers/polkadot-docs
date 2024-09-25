import requests
import json
from urllib.parse import urlparse
import sys
import yaml


def get_latest_release(repo_url):
    """Get the latest release tag from a GitHub repository."""
    try:
        # Extract owner and repo name from the URL
        path = urlparse(repo_url).path.strip("/")
        owner, repo = path.split("/")[-2:]

        # Make the GET request to the GitHub API
        api_url = f"https://api.github.com/repos/{owner}/{repo}/releases/latest"
        response = requests.get(api_url)

        if response.status_code == 200:
            data = response.json()
            return data["tag_name"]
        else:
            print(f"Failed to fetch data for {repo_url}: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching the latest release for {repo_url}: {e}")
        sys.exit(1)


def check_releases(releases_source_file):
    """Check the release tags for a list of repositories."""
    try:
        with open(releases_source_file, "r") as file:
            data = yaml.safe_load(file)
            repos = data.get("dependencies", {})
            #print(repos)
    except Exception as e:
        print(f"Error reading releases source file '{releases_source_file}': {e}")
        sys.exit(1)

    outdated_repos = []

    for name, repo_info in repos.items():
        repo_url = repo_info.get("repository_url")
        current_version = repo_info.get("version")

        if not repo_url or not current_version:
            print(f"Invalid repository entry: {name}")
            continue

        latest_version = get_latest_release(repo_url)

        if latest_version and latest_version != current_version:
            outdated_repos.append(
                {
                    "repository": repo_url,
                    "current_version": current_version,
                    "latest_version": latest_version,
                }
            )

    return outdated_repos


def main(releases_source_file):
    """Main function to check releases and generate an output file."""
    try:
        outdated_repos = check_releases(releases_source_file)

        # Output results in a format suitable for GitHub Actions
        output = {
            "outdated_repos": outdated_repos,
            "outdated_count": len(outdated_repos),
        }

        # Write the output to a JSON file
        with open("outdated_repositories.json", "w") as f:
            json.dump(output, f, indent=2)

        # Print the output for GitHub Actions
        print(json.dumps(output))

    except Exception as e:
        print(f"Error in main execution: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main("variables.yml")