import requests
import json
import sys
import yaml
from urllib.parse import urlparse

REGISTRIES = {
    "repositories": lambda info: get_latest_github_release(info.get("repository_url")),
    "crates": lambda info: get_latest_crate_version(info.get("name")),
    "javascript_packages": lambda info: get_latest_npm_version(info.get("name")),
    "python_packages": lambda info: get_latest_pypi_version(info.get("name")),
}

def get_latest_github_release(repo_url):
    try:
        path = urlparse(repo_url).path.strip("/")
        owner, repo = path.split("/")[-2:]
        api_url = f"https://api.github.com/repos/{owner}/{repo}/releases/latest"
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            return data["tag_name"], data["html_url"]
    except Exception as e:
        print(f"Error fetching GitHub release for {repo_url}: {e}")
    return None, None

def get_latest_crate_version(crate_name):
    try:
        response = requests.get(f"https://crates.io/api/v1/crates/{crate_name}")
        if response.status_code == 200:
            data = response.json()["crate"]
            latest_version = data["max_stable_version"]
            return latest_version, f"https://crates.io/crates/{crate_name}/{latest_version}"
    except Exception as e:
        print(f"Error fetching crate version for {crate_name}: {e}")
    return None, None

def get_latest_npm_version(package_name):
    try:
        response = requests.get(f"https://registry.npmjs.org/{package_name}")
        if response.status_code == 200:
            data = response.json()
            latest_version = data["dist-tags"]["latest"]
            return latest_version, f"https://www.npmjs.com/package/{package_name}/v/{latest_version}"
    except Exception as e:
        print(f"Error fetching npm package version for {package_name}: {e}")
    return None, None

def get_latest_pypi_version(package_name):
    try:
        response = requests.get(f"https://pypi.org/pypi/{package_name}/json")
        if response.status_code == 200:
            data = response.json()["info"]
            latest_version = data["version"]
            return latest_version, f"https://pypi.org/project/{package_name}/{latest_version}/"
    except Exception as e:
        print(f"Error fetching PyPI package version for {package_name}: {e}")
    return None, None

def check_releases(releases_source_file):
    try:
        with open(releases_source_file, "r") as file:
            data = yaml.safe_load(file)
            dependencies = data.get("dependencies", {})
    except Exception as e:
        print(f"Error reading releases source file '{releases_source_file}': {e}")
        sys.exit(1)
    
    outdated_dependencies = []
    
    for category, items in dependencies.items():
        if category not in REGISTRIES:
            continue
        
        for name, info in items.items():
            current_version = info.get("version")
            latest_version, latest_url = REGISTRIES[category](info)
            
            if latest_version and latest_version != current_version:
                outdated_dependencies.append({
                    "name": name,
                    "category": category,
                    "current_version": current_version,
                    "latest_version": latest_version,
                    "latest_release_url": latest_url,
                })
    
    return outdated_dependencies

def main(releases_source_file):
    try:
        outdated_dependencies = check_releases(releases_source_file)
        output = {
            "outdated_dependencies": outdated_dependencies,
            "outdated_count": len(outdated_dependencies),
        }
        with open("outdated_dependencies.json", "w") as f:
            json.dump(output, f, indent=2)
        print(json.dumps(output))
    except Exception as e:
        print(f"Error in main execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main("variables.yml")