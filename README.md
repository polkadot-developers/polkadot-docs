# Polkadot Developer Documentation

This repository is the monorepo for the [Polkadot developer documentation](https://docs.polkadot.com). It contains both the documentation content and the MkDocs configuration used to build and serve the site.

The documentation source files are written in [Markdown](https://daringfireball.net/projects/markdown) and generally follow the [PaperMoon style guide](https://github.com/papermoonio/documentation-style-guide/blob/main/style-guide.md).

## Repository Structure

```
polkadot-docs/
├── docs/                   # Documentation content (Markdown, images, snippets)
│   ├── apps/
│   ├── chain-interactions/
│   ├── images/
│   ├── parachains/
│   ├── reference/
│   ├── smart-contracts/
│   └── ...
├── hooks/                  # MkDocs hooks (Python)
├── layouts/                # Social card layouts
├── material-overrides/     # Theme overrides and custom CSS
├── scripts/                # Utility scripts
├── styles/                 # Vale linting rules
├── mkdocs.yml              # MkDocs configuration
└── requirements.txt        # Python dependencies
```

## Run Polkadot Docs Locally

Follow these steps to run the documentation site locally and preview your changes.

### Clone the Repository

```bash
git clone https://github.com/polkadot-developers/polkadot-docs.git
cd polkadot-docs
```

> **Contributing?** If you plan to [contribute](docs/CONTRIBUTING.md), fork this repository first and clone your fork instead.

### Set Up the Environment

Install Python dependencies:

```bash
make install
```

On Windows:

```bat
Makefile.bat install
```

### Install Node.js Dependencies

```bash
npm install
```

### Serve the Site

```bash
make serve
```

On Windows:

```bat
Makefile.bat serve
```

After a successful build, the site is available at http://127.0.0.1:8000 with live reload on file changes.

### Build and Validate

To do a full build and check for errors (mirrors CI):

```bash
make build
```

### Working with the Docs Again

To resume work after closing your terminal:

1. Navigate to the repo root.
2. Activate the environment: `source venv/bin/activate` (Windows: `venv\Scripts\activate`).
3. Run `mkdocs serve`.

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for how to contribute to this repository.

We're excited to have you contribute to the Polkadot docs and help improve our ecosystem! Every contribution, whether it's fixing a typo, improving documentation, or adding new content, helps make Polkadot more accessible to developers worldwide. Thank you for being part of our community!

## Disclaimer

### Licensing Disclaimer

The developer documentation provided herein has been collaboratively created and curated by [Web 3.0 Technologies Foundation](https://web3.foundation/), [Parity Technologies Ltd.](https://www.parity.io/), and [PaperMoon Dev SL](https://papermoon.io) (hereinafter referred to as the "Organizations") as a joint effort to support the Polkadot ecosystem.

### Documentation License

The content of these documents is [licensed](docs/LICENSE.md) under the Creative Commons Attribution 4.0 International License ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). You are free to share, copy, redistribute, and adapt the material for any purpose, even commercially, provided that appropriate credit is given to the Organizations, a link to the license is provided, and any changes made are indicated.

### Code License

Any code examples or related software provided in these documents are available under the [MIT License](https://opensource.org/license/mit). This permits anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the code, provided that the original copyright notice and this permission notice are included in all copies or substantial portions of the code.

### General Disclaimer

This developer documentation has been created to support and promote the Polkadot ecosystem. The information presented herein is made available solely for general information purposes. The Organizations do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. The Organizations disclaim all liability and responsibility arising from any reliance placed on this information by you or by anyone who may be informed of any of its contents. All statements and/or opinions expressed in these materials are solely the responsibility of the person or entity providing those materials and do not necessarily represent the opinion of the Organizations. The information should not be construed as professional or financial advice of any kind. Advice from a suitably qualified professional should always be sought in relation to any particular matter or circumstance. The information herein may link to or integrate with other websites operated or content provided by third parties, and such other websites may link to this website. The Organizations have no control over any such other websites or their content and will have no liability arising out of or related to such websites or their content. The existence of any such link does not constitute an endorsement of such websites, the content of the websites, or the operators of the websites. These links are being provided to you only as a convenience, and you release and hold the Organizations harmless from any and all liability arising from your use of this information or the information provided by any third-party website or service.
