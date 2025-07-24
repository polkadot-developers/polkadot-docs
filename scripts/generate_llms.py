# generate_llms.py

from generate_llms_standard import generate_standard_llms
from generate_llms_by_category import generate_all_categories
from generate_llms_txt import generate_llms_txt

def main():
    # 1) Run the generate_llms_txt script
    generate_llms_txt("llms_config.json")

    # 2) Run the standard generate_llms
    generate_standard_llms()

    # 3) Then run the category-based generation
    generate_all_categories("llms_config.json")

if __name__ == "__main__":
    main()