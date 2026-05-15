VENV        := venv
PIP         := $(VENV)/bin/pip
MKDOCS      := $(VENV)/bin/mkdocs
PYTHON      := $(VENV)/bin/python
SCRIPTS_DIR := scripts

PYTHON_BIN := $(shell command -v python3.10 2>/dev/null || command -v python3 2>/dev/null || command -v python 2>/dev/null)

ARGS ?=

ifeq ($(PYTHON_BIN),)
$(error No Python interpreter found. Install Python 3.10 from https://python.org and ensure it is on your PATH)
endif

.DEFAULT_GOAL := help

$(VENV)/.installed: requirements.txt
	@echo "Using $(PYTHON_BIN) to create virtual environment..."
	$(PYTHON_BIN) -m venv $(VENV) || \
		(echo "\nError: Failed to create virtual environment.\n  On Debian/Ubuntu: sudo apt install python3-venv\n  On macOS: reinstall Python from https://python.org" && exit 1)
	$(PIP) install --upgrade pip || \
		(echo "\nError: Failed to upgrade pip. Check your internet connection and try again." && exit 1)
	$(PIP) install -r requirements.txt || \
		(echo "\nError: Failed to install dependencies from requirements.txt.\n  Verify the file exists and your internet connection is working, then re-run: make install" && exit 1)
	@touch $@
	@echo "Setup complete."

.PHONY: install
install: $(VENV)/.installed ## Install Python dependencies into the venv

.PHONY: reinstall
reinstall: ## Force reinstall of all dependencies
	rm -f $(VENV)/.installed
	@$(MAKE) --no-print-directory install

.PHONY: serve
serve: $(VENV)/.installed ## Serve docs locally with live reload (http://127.0.0.1:8000)
	$(MKDOCS) serve $(ARGS) || \
		(echo "\nError: Failed to start the local server.\n  If port 8000 is already in use, run: $(MKDOCS) serve --dev-addr=127.0.0.1:8001" && exit 1)

.PHONY: build
build: $(VENV)/.installed ## Build the static site and validate it compiles cleanly
	$(MKDOCS) build --strict $(ARGS) || \
		(echo "\nError: Build failed. Fix the errors above, then re-run: make build\n  Tip: run 'make serve' to preview and identify broken references interactively." && exit 1)

.PHONY: gen-cookbook
gen-cookbook: $(VENV)/.installed ## Generate the cookbook index table (pass TARGET=path/to/section)
ifndef TARGET
	$(error TARGET is required. Example: make gen-cookbook TARGET=smart-contracts/cookbook)
endif
	$(PYTHON) $(SCRIPTS_DIR)/generate-cookbook-indexes.py $(TARGET) || \
		(echo "\nError: Failed to generate cookbook index for '$(TARGET)'.\n  Ensure the path exists under polkadot-docs/ and contains a .nav.yml file." && exit 1)

.PHONY: help
help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  install       to create a virtual environment and install all doc dependencies"
	@echo "  reinstall     to force reinstall of all dependencies (use when remote requirements change)"
	@echo "  serve         to watch, rebuild, and serve the docs locally with live reload (http://127.0.0.1:8000)"
	@echo "                  pass extra flags with ARGS: make serve ARGS='--watch-theme'"
	@echo "  build         to build the static site and validate it compiles cleanly (mirrors CI)"
	@echo "                  pass extra flags with ARGS: make build ARGS='-d site'"
	@echo "  gen-cookbook  to regenerate the cookbook index table (requires TARGET=path/to/section)"
