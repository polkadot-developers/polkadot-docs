# Polkadot Developer Documentation

This repository contains documentation for Polkadot, a decentralized protocol that enables interoperability, scalability, and shared security across multiple blockchains. It provides a comprehensive range of resources and technical information to support developers in building and deploying the Polkadot ecosystem.

The documentation source files are written in [Markdown](https://daringfireball.net/projects/markdown) and generally follow the [PaperMoon style guide](https://github.com/papermoonio/documentation-style-guide/blob/main/style-guide.md).

## Run Polkadot Docs Locally

You may want to spin up a local version of the documentation site to preview your changes. This guide will cover the steps needed to serve a local version.

### Clone Repositories

Building and serving the site requires cloning two repositories:

- **[Polkadot MkDocs](https://github.com/papermoonio/polkadot-mkdocs)**: Contains the MkDocs configuration files, theme overrides, and custom CSS for the Polkadot documentation site.

- **[Polkadot Docs](https://github.com/polkadot-developers/polkadot-docs)**: The actual content is stored in the `polkadot-docs` repository and pulled into the `polkadot-mkdocs` directory during build.

For everything to work correctly, the file structure needs to be as follows:

```bash
polkadot-mkdocs
|--- /material-overrides/ (folder)
|--- /polkadot-docs/ (repository)
|--- mkdocs.yml
```

To set up the structure, follow these steps:

1. Clone this repository:

    ```bash
    git clone https://github.com/papermoonio/polkadot-mkdocs
    ```

2. Inside the folder just created, clone the `polkadot-docs` repository:

    ```bash
    cd polkadot-mkdocs
    git clone https://github.com/polkadot-developers/polkadot-docs.git
    ```

### Install Dependencies and Serve Site

1. Now that the repositories are cloned and properly nested, use the [pip](https://pypi.org/project/pip/) package installer to install [mkdocs](https://www.mkdocs.org/) and other required dependencies by running the command:

    ```bash
    pip install -r requirements.txt
    ```

    This command will install all dependencies listed in the `requirements.txt` file.

2. Switch to the `polkadot-docs` directory and use [npm](https://docs.npmjs.com/about-npm) to install dependencies:

    ```bash
    cd polkadot-docs && npm install
    ```

3. Navigate back to the `polkadot-mkdocs` folder, then build the site:

    ```bash
    mkdocs serve
    ```

After a successful build, the site should be available at http://127.0.0.1:8000.

## Contributing

See [.CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute to this repository.

## Disclaimer

### Licensing Disclaimer

The developer documentation provided herein has been collaboratively created and curated by [Web 3.0 Technologies Foundation](https://web3.foundation/), [Parity Technologies Ltd.](https://www.parity.io/), and [PaperMoon Dev SL](https://papermoon.io) (hereinafter referred to as the "Organizations") as a joint effort to support the Polkadot ecosystem.

### Documentation License
The content of these documents is [licensed](LICENSE.md) under the Creative Commons Attribution 4.0 International License ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). You are free to share, copy, redistribute, and adapt the material for any purpose, even commercially, provided that appropriate credit is given to the Organizations, a link to the license is provided, and any changes made are indicated.

### Code License
Any code examples or related software provided in these documents are available under the [MIT License](https://opensource.org/license/mit). This permits anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the code, provided that the original copyright notice and this permission notice are included in all copies or substantial portions of the code.

### General Disclaimer
This developer documentation has been created to support and promote the Polkadot ecosystem. The information presented herein is made available solely for general information purposes. The Organizations do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. The Organizations disclaim all liability and responsibility arising from any reliance placed on this information by you or by anyone who may be informed of any of its contents. All statements and/or opinions expressed in these materials are solely the responsibility of the person or entity providing those materials and do not necessarily represent the opinion of the Organizations. The information should not be construed as professional or financial advice of any kind. Advice from a suitably qualified professional should always be sought in relation to any particular matter or circumstance. The information herein may link to or integrate with other websites operated or content provided by third parties, and such other websites may link to this website. The Organizations have no control over any such other websites or their content and will have no liability arising out of or related to such websites or their content. The existence of any such link does not constitute an endorsement of such websites, the content of the websites, or the operators of the websites. These links are being provided to you only as a convenience, and you release and hold the Organizations harmless from any and all liability arising from your use of this information or the information provided by any third-party website or service.
