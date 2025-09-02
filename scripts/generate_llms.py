# generate_llms.py

from generate_ai_pages import main as generate_ai_pages
from generate_llms_txt import generate_llms_txt
from generate_site_index import main as generate_full_site_content
from generate_category_bundles import main as generate_category_bundles


def main():
    config_path = "llms_config.json"
    # 1) Run the generate_ai_pages script to 
    #    incorporate content updates into AI artifacts
    generate_ai_pages(config_path)

    # 2) Run the generate_llms_txt script to create
    #    a map of site content (outputs llms.txt)
    generate_llms_txt(config_path)

    # 3) Run the generate_full_site_content script to generate
    #    llms-full.jsonl and site-index.json files
    generate_full_site_content(config_path)

    # 4) Run the generate_category_bundles script to
    #    generate files bundling pages by category
    generate_category_bundles(config_path)

if __name__ == "__main__":
    main()