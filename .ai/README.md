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

- **`llms_config.json`**: single point of configuration for the LLM files. 

