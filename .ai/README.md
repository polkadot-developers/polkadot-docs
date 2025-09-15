# AI Directory: LLM-related files

The `/.ai/` directory contains files generated for use with LLM-driven tools like coding assistants and agents in order to improve the user experience for developers using these tools alongside our documentation.  

## Generate Updated Files

Follow these steps to generate a fresh set of files after updating documentation content:

1. From the `polkadot-docs` directory, run:

```
python scripts/generate_llms.py
```

2. Successful file generation will result in output similar to the following:

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>python3 scripts/generate_llms.py</span>
  <br />
    <span data-ty>▶️  Generate AI pages</span><br />
    <span data-ty>[ai-pages] processed=150 skipped=0</span><br />
    <span data-ty>[ai-pages] output dir: /polkadot-mkdocs/polkadot-docs/.ai/pages</span><br />
    <span data-ty>✅ Generate AI pages complete</span><br />
    <span data-ty> </span><br />
    <span data-ty>▶️  Generate llms.txt</span><br />
    <span data-ty>✅ llms.txt generated at: /polkadot-mkdocs/polkadot-docs/llms.txt</span><br />
    <span data-ty> Pages listed: 150</span><br />
    <span data-ty>✅ Generate llms.txt complete</span><br />
    <span data-ty> </span><br />
    <span data-ty>▶️  Generate site-index and full site content files</span><br />
    <span data-ty>✅ site-index.json written: /polkadot-mkdocs/polkadot-docs/.ai/site-index.json  (pages=150)</span><br />
    <span data-ty>✅ llms-full.jsonl written: /polkadot-mkdocs/polkadot-docs/.ai/llms-full.jsonl  (lines=1360)</span><br />
    <span data-ty>✅ Generate site-index and full site content files complete</span><br />
    <span data-ty> </span><br />
    <span data-ty>▶️  Generate category bundles</span><br />
    <span data-ty>✅ Category bundles written to: /polkadot-mkdocs/polkadot-docs/.ai/categories</span><br />
    <span data-ty>✅ Generate category bundles complete</span>
    <span data-ty> </span><br />
    <span data-ty>🎉 All steps finished successfully.</span>
    <span data-ty></span><br />
    </div><br /><br />

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

- The Markdown files must be located in a directory that is not included in the site build to prevent Mkdocs from converting the Markdown to HTML elements when building the site.



