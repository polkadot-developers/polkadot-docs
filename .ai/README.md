# AI Directory: LLM-related files

The `/.ai/` directory contains files generated for use with LLM-driven tools like coding assistants and agents in order to improve the user experience for developers using these tools alongside our documentation.  

## Generate Updated Files

Follow these steps to generate a fresh set of files after updating documentation content:

1. From the `polkadot-docs` directory, run:

```
python scripts/generate_llms.py
```

2. Successful file generation will result in output similar to the following:

    ▶️  Generate AI pages<br />
    [ai-pages] processed=150 skipped=0<br />
    [ai-pages] output dir: /polkadot-mkdocs/polkadot-docs/.ai/pages<br />
    ✅ Generate AI pages complete<br />
     <br />
    ▶️  Generate llms.txt<br />
    ✅ llms.txt generated at: /polkadot-mkdocs/polkadot-docs/llms.txt<br />
     Pages listed: 150<br />
    ✅ Generate llms.txt complete<br />
     <br />
    ▶️  Generate site-index and full site content files<br />
    ✅ site-index.json written: /polkadot-mkdocs/polkadot-docs/.ai/site-index.json  (pages=150)<br />
    ✅ llms-full.jsonl written: /polkadot-mkdocs/polkadot-docs/.ai/llms-full.jsonl  (lines=1360)<br />
    ✅ Generate site-index and full site content files complete<br />
     <br />
    ▶️  Generate category bundles<br />
    ✅ Category bundles written to: /polkadot-mkdocs/polkadot-docs/.ai/categories<br />
    ✅ Generate category bundles complete
     <br />
    🎉 All steps finished successfully.
    <br />

3. Commit the updated `/.ai/` files with your content changes and open your PR as you usually do.

## Guide to Scripts and Files

The scripts for LLM-related files generation are located in `polkadot-docs/scripts` which contains the following:

- **`llms_config.json`**: Single point of configuration for the LLM files. 
- **`generate_llms.py`**: Pipeline for generating updated LLM files.
- **`generate_ai_pages.py`**: Creates one resolved Markdown file per documentation page and outputs them to the `/.ai/pages` directory.
- **`generate_llms_txt.py`**: Creates the `llms.txt` site index file using the Markdown file URLs and outputs it to the `/polkadot-docs/` directory.
- **`generate_site_index.py`**: Creates two full-site content related files:
    - `llms-full.jsonl`: This file contains the entire documentation site, enhanced with metadata for improved indexing and chunking, and replaces the previous `llms-full.txt` file perviously used.
    - `site-index.json`: This lightweight version of the full documentation site uses content previews rather than full content bodies to allow for a smaller file size.
- **`generate_category_bundles.py`**: Bundles pages with the same category tag together, along with context via Basics and Reference categories, and outputs them to `/.ai/categories/` as Markdown files.

## FAQs

### Why are we now using Markdown instead of `.txt` files?

- LLMs see a Markdown file and automatically know which semantic clues to look for to identify headings, bullet lists, and other structural elements. In comparison, a `.txt` file presents as a flattened sequence of words where the model has to work harder to identify the structure of the content. 

### What do you mean by "resolved Markdown" files?

- The resolved Markdown files are those which are processed to replace all of the code snippet and variable placeholders with their intended contents and strip any HTML comments.

### Why use the `/.ai/pages` and `/.ai/categories` directories rather than ouputting the files to '/llms-files/' like before?

- The Markdown files are located in a directory that is not included in the site build to prevent doubling the size of the website (one HTML file + one Markdown file for every page). This arrangement also prevents the resolved Markdown being converted into HTML elements, making them less effective for LLM consumption.