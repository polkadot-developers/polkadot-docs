import json
import re
import os
import requests
import sys

def parse_dependencies_json(json_file_path):
    """
    Parse the JSON file containing dependencies and extract only the repositories type.
    
    Args:
        json_file_path: Path to the JSON file containing the dependencies
        
    Returns:
        List of dictionaries containing repository dependencies
    """
    try:
        # Read and parse the JSON file
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        
        # Extract only dependencies with category "repositories"
        repositories = [
            dependency for dependency in data.get('outdated_dependencies', [])
            if dependency.get('category') == 'repositories'
        ]
        
        return repositories
    except FileNotFoundError:
        print(f"Error: File {json_file_path} not found.")
        return []
    except json.JSONDecodeError:
        print(f"Error: File {json_file_path} contains invalid JSON.")
        return []
    except Exception as e:
        print(f"Error parsing dependencies: {str(e)}")
        return []

def find_repository_references(root_dir, repo_dependencies):
    """
    Search through the codebase for repository references matching the patterns.
    
    Args:
        root_dir: Root directory of the codebase to search
        repo_dependencies: List of repository dependencies to check for
    
    Returns:
        List of dictionaries containing file path, line number, and matched text
    """
    # Build a list of repo names to search for
    repo_names = [repo['name'] for repo in repo_dependencies]
    
    # Regex patterns to match repository URLs with placeholders
    patterns = [
        # Pattern for GitHub URLs with line references
        r'https://github\.com/.*?/blob/\{\{\s*dependencies\.repositories\.([a-zA-Z_]+)\.version\s*\}\}.*?#L\d+',
        # Pattern for raw.githubusercontent.com URLs with line ranges
        r'https://raw\.githubusercontent\.com/.*?/refs/tags/\{\{\s*dependencies\.repositories\.([a-zA-Z_]+)\.version\s*\}\}.*?:\d+:\d+'
    ]
    
    results = []
    
    # Walk through all files in the codebase
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.md'):  # Assuming we're only searching Markdown files
                file_path = os.path.join(dirpath, filename)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        for line_num, line in enumerate(file, 1):
                            # Check each pattern
                            for pattern in patterns:
                                matches = re.finditer(pattern, line)
                                for match in matches:
                                    repo_var = match.group(1)
                                    # Only include if the repo name is in our dependencies list
                                    if repo_var in repo_names:
                                        results.append({
                                            'file': file_path,
                                            'line_number': line_num,
                                            'match_text': match.group(0),
                                            'repo_var': repo_var,
                                            'full_line': line.strip()
                                        })
                except (UnicodeDecodeError, IOError) as e:
                    print(f"Error reading file {file_path}: {str(e)}")
    
    return results

def convert_to_raw_url(github_url):
    """
    Convert a GitHub URL to a raw.githubusercontent.com URL.
    
    Args:
        github_url: GitHub URL to convert
        
    Returns:
        Raw URL for the same content
    """
    # Pattern: https://github.com/{owner}/{repo}/blob/{branch}/{path}#L{line}
    pattern = r'https://github\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+?)(?:#L(\d+))?$'
    match = re.match(pattern, github_url)
    
    if match:
        owner, repo, branch, path, line_num = match.groups()
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
        return raw_url, line_num
    return None, None

def extract_line_range(url):
    """
    Extract line range from a raw GitHub URL with line numbers.
    
    Args:
        url: URL potentially containing line numbers
        
    Returns:
        Tuple of (url without line numbers, start line, end line)
    """
    # Check for line range in format :start_line:end_line
    pattern = r'(.+):(\d+):(\d+)$'
    match = re.match(pattern, url)
    
    if match:
        base_url, start_line, end_line = match.groups()
        return base_url, int(start_line), int(end_line)
    
    return url, None, None

def fetch_code_snippet(url, version, line_start=None, line_end=None):
    """
    Fetch code from a raw GitHub URL, optionally extracting specific lines.
    
    Args:
        url: Raw GitHub URL
        version: Version to use in place of the placeholder
        line_start: Starting line (optional)
        line_end: Ending line (optional)
        
    Returns:
        The code snippet as a string
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        content = response.text.splitlines()
        
        if line_start is not None and line_end is not None:
            # Extract specific lines (adjust for 0-based indexing)
            content = content[line_start-1:line_end]
        elif line_start is not None:
            # Just one line
            content = [content[line_start-1]]
            
        return '\n'.join(content)
    except requests.RequestException as e:
        print(f"Error fetching code: {str(e)}")
        return None

def compare_code_snippets(repo_references, repo_dependencies):
    """
    Compare code snippets between current and latest versions.
    
    Args:
        repo_references: List of repository references found in the codebase
        repo_dependencies: List of repository dependencies
        
    Returns:
        List of dictionaries containing the comparison results
    """
    # Create a lookup dictionary for repositories
    repo_dict = {repo['name']: repo for repo in repo_dependencies}
    results = []
    
    for ref in repo_references:
        repo_name = ref['repo_var']
        if repo_name not in repo_dict:
            continue
            
        repo = repo_dict[repo_name]
        current_version = repo['current_version']
        latest_version = repo['latest_version']
        
        url = ref['match_text']
        # Replace the placeholder with actual versions
        url_pattern = re.compile(r'\{\{\s*dependencies\.repositories\.[a-zA-Z_]+\.version\s*\}\}')
        
        current_url = url_pattern.sub(current_version, url)
        latest_url = url_pattern.sub(latest_version, url)
        
        # Check if it's already a raw URL
        if "raw.githubusercontent.com" in current_url:
            raw_current_url, line_num = current_url, None
            raw_latest_url, line_num = latest_url, None
            
            # Extract line ranges if present
            raw_current_url, start_line, end_line = extract_line_range(raw_current_url)
            raw_latest_url, _, _ = extract_line_range(raw_latest_url)
        else:
            # Convert to raw URL
            raw_current_url, line_num = convert_to_raw_url(current_url)
            raw_latest_url, _ = convert_to_raw_url(latest_url)
            
            # Set line range if a specific line was referenced
            if line_num:
                start_line, end_line = int(line_num), int(line_num)
            else:
                start_line, end_line = None, None
        
        # Fetch both versions of the code
        print(f"Fetching code snippets for {repo_name}...")

        # Print url with line numbers
        print(f"Current URL: {current_url}")
        current_code = fetch_code_snippet(raw_current_url, current_version, start_line, end_line)
        print(current_code)

        print(f"Latest: {latest_url}")
        latest_code = fetch_code_snippet(raw_latest_url, latest_version, start_line, end_line)
        print(latest_code)

        # Check if they match
        match = (current_code == latest_code) if current_code and latest_code else False
        
        results.append({
            'file': ref['file'],
            'line_number': ref['line_number'],
            'repo_name': repo_name,
            'current_version': current_version,
            'latest_version': latest_version,
            'current_url': current_url,
            'latest_url': latest_url,
            'match': match,
            'current_code': current_code,
            'latest_code': latest_code
        })
    
    return results

def check_outdated_snippets(json_file_path, codebase_root_dir):
    """
    Complete workflow to check for outdated code snippets in the documentation codebase.
    
    Args:
        json_file_path: Path to the JSON file containing dependencies
        codebase_root_dir: Root directory of the documentation codebase
        
    Returns:
        Updated dependencies data with outdated snippets information
    """
    # Step 1: Parse the JSON file to get repository dependencies
    repo_dependencies = parse_dependencies_json(json_file_path)
    print(f"Found {len(repo_dependencies)} repository dependencies.")
    
    # Step 2: Search the codebase for repository references
    repo_references = find_repository_references(codebase_root_dir, repo_dependencies)
    print(f"Found {len(repo_references)} repository references in the codebase.")
    
    # Step 3: Compare code snippets between current and latest versions
    comparison_results = compare_code_snippets(repo_references, repo_dependencies)
    #print(comparison_results)
    
    # Filter for outdated snippets (where match is False)
    outdated_snippets = [result for result in comparison_results if not result['match']]
    print(f"Found {len(outdated_snippets)} outdated code snippets.")
    
    # Step 4: Update the original JSON file with outdated snippets information
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    
    # Prepare outdated snippets information for each repository
    repo_to_outdated = {}
    for snippet in outdated_snippets:
        repo_name = snippet['repo_name']
        if repo_name not in repo_to_outdated:
            repo_to_outdated[repo_name] = []
            
        repo_to_outdated[repo_name].append({
            'file': snippet['file'],
            'line_number': snippet['line_number'],
            'current_url': snippet['current_url'],
            'latest_url': snippet['latest_url']
        })
    
    # Add outdated_snippets field to each repository in the JSON
    for dependency in data['outdated_dependencies']:
        if dependency['category'] == 'repositories' and dependency['name'] in repo_to_outdated:
            dependency['outdated_snippets'] = repo_to_outdated[dependency['name']]
        elif dependency['category'] == 'repositories':
            dependency['outdated_snippets'] = []
    
    # Write updated data back to the file
    with open(json_file_path, 'w') as file:
        json.dump(data, file, indent=2)
    
    return data

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <json_file_path> <codebase_root_dir>")
        sys.exit(1)
    
    json_file_path = sys.argv[1]
    codebase_root_dir = sys.argv[2]
    
    updated_data = check_outdated_snippets(json_file_path, codebase_root_dir)

     # Print summary of outdated snippets
    for dependency in updated_data['outdated_dependencies']:
        if dependency['category'] == 'repositories':
            snippet_count = len(dependency.get('outdated_snippets', []))
            if snippet_count > 0:
                print(f"\n{dependency['name']}: {snippet_count} outdated snippets")
                for i, snippet in enumerate(dependency['outdated_snippets'], 1):
                    print(f"  {i}. {snippet['file']}:{snippet['line_number']}")