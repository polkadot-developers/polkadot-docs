# Mkdocs Framework and Material Theme for the Polkadot Developer Documentation Site

This repo contains the Mkdocs config files, theme overrides, and CSS changes.

- [Mkdocs](https://www.mkdocs.org/)
- [Material for Mkdocs](https://squidfunk.github.io/mkdocs-material/)

The actual content is stored in the `polkadot-docs` repo and pulled in during build.

- [Polkadot Docs](https://github.com/polkadot-developers/polkadot-docs)

## Get Started

### Clone the Repository

So first, lets clone this repository:

```bash
git clone https://github.com/papermoonio/polkadot-mkdocs
cd polkadot-mkdocs
```

## Set Up Repository Structure

In order for everything to work correctly, the structure needs to be as follows:

```text
polkadot-mkdocs
|--- /material-overrides/ (folder)
|--- /polkadot-docs/ (repository)
|--- mkdocs.yml
```

Inside the `polkadot-mkdocs` directory just created, clone the [`polkadot-docs` repository](https://github.com/polkadot-developers/polkadot-docs):

```bash
git clone https://github.com/polkadot-developers/polkadot-docs.git
```

## Run the Docs

From the `polkadot-mkdocs` folder, run:

```bash
make serve
```

On Windows:

```bat
Makefile.bat serve
```

This will install dependencies automatically if you haven't already, then start the local server. After a successful build, the site is available at `http://127.0.0.1:8000` with live reload on file changes.

To pass extra flags to `mkdocs serve`, use the `ARGS` variable:

```bash
make serve ARGS="--watch-theme"
```

On Windows, pass them as a second argument:

```bat
Makefile.bat serve "--watch-theme"
```

> **_NOTE:_** To improve build times, you can:

> - Disable the git revision plugin by running the following command before you serve the docs: `export ENABLED_GIT_REVISION_DATE=false`
> - Disable the LLM file plugins for local development by running the following command before you serve the docs: `export ENABLED_LLMS_PLUGINS=false`

## Optional Quality Checks

To validate the site builds cleanly with strict mode (the same check that runs in CI):

```bash
make build
```

On Windows:

```bat
Makefile.bat build
```
