---
title: Quick Start
description: Deploy a Polkadot Product in under 15 minutes — in the browser with RevX or from the terminal with the CLI. No local environment required.
categories: Apps
---

# Quick Start

Deploy a Polkadot Product in under 15 minutes and see it live under a `.dot` name — with no local development environment to set up. There are two ways to do it: generate one in your browser with RevX, or ship one from your terminal with the CLI. Pick the route that fits you.

!!! info "The only prerequisite"
    You need the [Polkadot App](/apps/) installed on your phone — it signs the final publish step. Everything else runs in your browser or terminal.

=== "In the browser (RevX)"

    This is the browser-based route — no local install needed, your whole IDE runs in the browser.

    You'll use App Builder, a track inside the [RevX](https://revx.dev/){target=\_blank} browser IDE that scaffolds Polkadot Products from a natural-language prompt and publishes them to a `.dot` name. The output is a **Polkadot Product** — the same kind of `.dot`-published app the [Build](/apps/build/){target=\_blank} guides teach you to write by hand.

    By the end you'll have configured an AI provider in App Builder, generated a Polkadot Product from a prompt, inspected the generated code, and published it to `.dot`.

    **Prerequisites**

    You need an API key for an AI provider supported by App Builder (for example, OpenAI or Anthropic).

    !!! warning "Provisional"
        The `Publish to .dot` step signs with your Polkadot App. Whether the `.dot` registration also needs TestNet funds or a verified identity is still being confirmed — if the publish step asks for either, complete the matching steps in [Get Started](/apps/get-started/){target=\_blank} first.

    **Open RevX**

    Open [RevX](https://revx.dev/){target=\_blank} in your browser. RevX is a browser-based IDE; you'll use the App Builder track to scaffold a Polkadot Product end to end.

    ![RevX IDE landing view showing the main workspace](/images/apps/revx/revx-01.webp)

    **Open App Builder**

    From the sidebar, select **App Builder**. App Builder is RevX's track for generating Polkadot Products using AI-assisted workflows.

    ![RevX sidebar with the App Builder option highlighted](/images/apps/revx/revx-02.webp)

    **Create a New App**

    Click **Create App** to start a new project. RevX automatically installs the required dependencies and initializes the project environment so you can move straight into configuration and prompting.

    ![RevX App Builder showing the Create App action and the initialized project environment](/images/apps/revx/revx-03.webp)

    After clicking **Create App**, you will see a loading screen while the IDE initializes the project environment.

    ![RevX App Builder showing the loading screen while the IDE initializes the project environment](/images/apps/revx/revx-04.webp)

    !!! note
        Initial setup may take a moment while dependencies install. Wait for the environment to finish initializing before configuring the builder.

    Once the environment is initialized, you will see a minimal app scaffolded in the editor and running in the terminal.

    ![RevX App Builder showing the minimal app scaffolded in the editor and running in the terminal](/images/apps/revx/revx-05.webp)

    **Configure the Builder**

    From the App Builder view, click the **Settings** icon to open the AI configuration panel.

    ![RevX App Builder settings icon](/images/apps/revx/revx-06.webp)

    Configure the following:

    - **AI provider**: The backend service that powers code generation.
    - **API key**: The credential for your AI provider.
    - **Model**: The specific model to use from the selected provider.

    ![RevX App Builder configuration panel showing API key, AI provider, and model fields](/images/apps/revx/revx-07.webp)

    These settings let the IDE generate applications using the selected AI backend. You can change them at any time if you want to switch providers or models.

    **Generate an App**

    Use the chat interface to describe the app you want to build. RevX generates the application structure and code automatically based on your prompt.

    !!! example "Example prompt"
        Build a Product that shows the balance of Alice (a standard Substrate dev account)

    After you submit the prompt, the IDE produces the project files and scaffolds the app for you to review.

    ![RevX chat interface with a prompt entered and the generated app structure on the right](/images/apps/revx/revx-08.webp)

    !!! tip
        Keep prompts concrete and scoped. Short, specific prompts tend to produce app structures that are easier to review and iterate on.

    **Inspect the Generated Code**

    Once generation completes, open the generated files in the editor to review what was produced. You can continue iterating on the application from within RevX — refining the prompt, editing code directly, or layering additional changes through the chat interface.

    ![RevX editor showing the generated app source files open for inspection](/images/apps/revx/revx-09.webp)

    **Publish to `.dot`**

    When your app is ready, click **Publish to .dot** to deploy the application to the Polkadot ecosystem. The publish action takes the app you generated in RevX and makes it available under a `.dot` name.

    ![RevX App Builder showing the Publish to .dot action](/images/apps/revx/revx-10.webp)

    After clicking **Start Deploy**, you will be asked to sign the transaction with your Polkadot App.

    ![RevX App Builder showing the transaction signing prompt](/images/apps/revx/revx-11.webp)

    After signing the transaction, you will see the deployment progress in the terminal. Your Product is now live under its `.dot` name.

    !!! warning "Provisional"
        The deployed-Product-in-the-browser step is blocked on a signer issue, so the final screenshot is pending. Until then, the signing prompt above is the last visible state for this route.

=== "From the CLI"

    This is the terminal-based route for getting a Polkadot Product deployed end to end from your workstation.

    You'll install playground-cli — the `pg` command — pair it with your Polkadot App, build your Product, and publish it to a `.dot` name. The CLI is the command-line counterpart to Polkadot Desktop: Desktop runs published Products by their `.dot` names; `pg` takes a project on disk and turns it into one.

    !!! info "CLI version"
        This route targets playground-cli `0.27.1`. The CLI is in active development and breaking changes between versions are expected. To follow along, install this version (or check this page's last update against the latest release).

    **Prerequisites**

    - macOS or Linux with `curl` available. (Windows: use WSL.)
    - A signer for the deploy step — the Polkadot App is the recommended path.

    !!! warning "Provisional — picking a signer"
        The CLI supports two signer modes; the Quick Start happy path is still being settled:

        - Mobile signer (`--signer phone`, default) — use the Polkadot App on a camera-equipped device. Required for the interactive `pg init` QR login. Recommended for any deploy you intend to keep.
        - Dev-only signer (`--signer dev`) — no phone needed; uses shared development keys (e.g., `--suri //Alice`). Positioned in the CLI for CI and local iteration. Caveat: the deployed `.dot` Product is owned by the shared dev account, not by you.

        `pg init` installs the rest of the toolchain (rustup, nightly, rust-src, foundry, cdm, IPFS, gh) for you. To install them yourself, see the [upstream playground-cli README](https://github.com/paritytech/playground-cli){target=\_blank}.

    **Install the CLI**

    1. Run the installer:

        ```bash
        curl -fsSL https://raw.githubusercontent.com/paritytech/playground-cli/main/install.sh | bash
        ```

    2. Open a new shell (or `source` your RC file) and verify the install:

        ```bash
        pg --version
        ```

    !!! note "Command aliases"
        The installer registers two interchangeable commands — `playground` (canonical) and `pg` (short alias). This guide uses `pg` throughout.

    **Initialize**

    `pg init` installs toolchain dependencies and pairs the CLI with your signer. It is safe to re-run; existing installs and sessions are detected and skipped.

    ```bash
    pg init
    ```

    --8<-- 'code/apps/quick-start/playground-cli/termynal-init.html'

    !!! tip
        Toolchain install runs in parallel with the login step, so you can scan the QR code while dependencies download.

    **Build**

    `pg build` auto-detects and runs your project build.

    ```bash
    pg build
    ```

    --8<-- 'code/apps/quick-start/playground-cli/termynal-build.html'

    **Deploy**

    `pg deploy` runs the full pipeline: build the frontend, upload artifacts to the Polkadot Bulletin Chain, and register a `.dot` domain via DotNS. Before building, it always runs your package manager's install step to keep dependencies in sync.

    ```bash
    # Interactive — pg prompts for signer, domain, and build directory
    pg deploy

    # Dev signer — no phone needed (the deployed Product is owned by the shared dev account)
    pg deploy --signer dev --domain my-app
    ```

    --8<-- 'code/apps/quick-start/playground-cli/termynal-deploy.html'

    !!! note
        `pg deploy` includes a memory watchdog that aborts the deploy if the process exceeds four GB RSS. If you hit this limit, set `DOT_MEMORY_TRACE=1` (alongside `DOT_DEPLOY_VERBOSE=1`) to capture per-second RSS and heap samples.

    ??? note "More CLI commands"

        **pg mod**

        Clones a moddable app from the Playground registry so you can customize and redeploy it as your own Product. Only apps that opted into `--moddable` at deploy time are listed.

        ```bash
        pg mod [domain]
        ```

        Pass a domain label (e.g., `my-app` or `my-app.dot`) to clone directly, or omit it to open an interactive picker showing every moddable app.

        **pg logout**

        Signs out of the paired account and clears session files under `~/.polkadot-apps/`. A no-op if you are not signed in.

        ```bash
        pg logout
        ```

        **pg update**

        Updates `pg` to the latest version from the GitHub releases page.

        ```bash
        pg update
        ```

## Where to Go Next

You've deployed a Polkadot Product. To keep building it — with your own editor, the full toolchain, and the Build guides — continue with the local development route.

<div class="grid cards" markdown>

-   <span class="badge guide">Local Dev</span> **Continue Locally with Polkadot Desktop**

    ---

    Set up the canonical local dev loop: Polkadot Desktop loads your Product from `localhost`, and you iterate with live reload.

    [:octicons-arrow-right-24: Local Development](/apps/local-development/)

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Add capabilities to your Product — signing, on-chain reads, decentralized storage, off-chain pub/sub, and local persistence — one package-anchored guide at a time.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

</div>
