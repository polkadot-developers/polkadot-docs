# Contribute to the Polkadot Docs

> **📋 Essential**: All contributions must follow the [PaperMoon Style Guide](https://github.com/papermoonio/documentation-style-guide).

## Contents

- [Quick Start](#quick-start)
- [Edit Online with GitHub (Simple Changes)](#edit-online-with-github-simple-changes)
- [Fork and Edit Locally](#fork-and-edit-locally)
   - [Fix or Improve Existing Content](#fix-or-improve-existing-content)
   - [Add a New Page](#add-a-new-page)
   - [Create a New Section](#create-a-new-section)
   - [Write a Tutorial](#write-a-tutorial)
   - [Working with Content Elements](#working-with-content-elements)
      - [Adding Images](#adding-images)
      - [Using Code Snippets](#using-code-snippets)
      - [Adding Callout Boxes](#adding-callout-boxes)
- [Frontmatter Reference](#frontmatter-reference)

## Quick Start

There are two main ways to contribute:

- **[Edit Online with GitHub](#edit-online-with-github-simple-changes)** 
   - Best for simple text changes like fixing typos or making small updates directly in your browser.  

- **[Fork and Edit Locally](#fork-and-edit-locally)** 
   - Recommended for more complex contributions that require local testing or previewing changes.


## Edit Online with GitHub (Simple Changes)

For simple contributions like fixing typos or making small text changes, you can use GitHub's online editor.

### Making Your Changes

1. Navigate to the file you want to edit on GitHub.
2. Click the pencil icon (✏️) to edit the file.
3. Make your changes in the online editor.
4. Follow the [PaperMoon Style Guide](https://github.com/papermoonio/documentation-style-guide).

### Creating Your Pull Request

1. Scroll to **Propose changes** at the bottom of the editor.
2. Add a descriptive commit message explaining your changes.
3. Click **Propose changes**. GitHub will automatically:
   - Fork the repository to your account.
   - Create a branch with your changes.
   - Open a pull request.
      - Make sure to check **Allow edits from maintainers**.

## Fork and Edit Locally

For more complex contributions, which involve rendering (e.g., adding a `.nav.yml` section, code snippets, etc) or when you want to preview changes locally.

### Initial Setup

Before making contributions, you need to set up the proper directory structure for local development:

1. Clone the MkDocs repository:

   > **polkadot-mkdocs**: Contains the "engine" (MkDocs configuration, theme, styling)

   ```bash
   git clone https://github.com/papermoonio/polkadot-mkdocs.git
   cd polkadot-mkdocs
   ```

2. Fork and clone the docs repository inside polkadot-mkdocs:

   > **polkadot-docs**: Contains the "content" (documentation pages, tutorials, images)

   ```bash
   # Fork polkadot-docs on GitHub first, then:
   git clone https://github.com/YOUR_USERNAME/polkadot-docs.git
   cd polkadot-docs
   git checkout -b YOUR_FEATURE_BRANCH
   ```

   Your directory structure should now look like:
   ```
   polkadot-mkdocs/
   ├── polkadot-docs/          # Your forked repository
   ├── material-overrides/
   └── mkdocs.yml
   ```

### Making Changes

1. Make your changes:

   - Follow the [PaperMoon Style Guide](https://github.com/papermoonio/documentation-style-guide).
   - Test your changes locally (see [Run Polkadot Docs Locally](../README.md#run-polkadot-docs-locally)).

2. Create pull request:

   - Push your branch and create a pull request.
   - Use the PR template to indicate your review preference.

## Fix or Improve Existing Content

Making changes to existing pages is the simplest contribution:

1. **Edit the content**: Make your improvements directly to the existing markdown file.
2. **Follow style guide**: Ensure your changes maintain proper formatting according to the [PaperMoon Documentation Style Guide](https://github.com/papermoonio/documentation-style-guide).
3. **Test locally**: Verify your changes render correctly by running the Polkadot docs locally. Instructions can be found in the [README](./README.md#run-polkadot-docs-locally)

## Add a New Page

**Requirement**: Follow the [PaperMoon Documentation Style Guide](https://github.com/papermoonio/documentation-style-guide).

To add a page to an existing section:

1. Create your markdown file following [naming conventions](https://github.com/papermoonio/documentation-style-guide/blob/main/style-guide.md#naming-conventions).

2. Include required frontmatter (see [Frontmatter Reference](#frontmatter-reference) for all available fields):

   ```markdown
   ---
   title: Page Title (max 60 chars for SEO)
   description: Description for SEO (120-160 chars).
   categories: Category1, Category2
   ---
   
   # Page Title
   
   ## Introduction

   Write 2-3 paragraphs to introduce the topic.
   
   ## Prerequisites

   List any required tools, knowledge, or setup.
   ```

   **Categories**

   Available categories for pages are listed in the `categories_info` section of `llms_config.json` in the `polkadot-mkdocs` repository.

   **Search Engine Optimization (SEO)**

   Resources for good SEO:
   - [Google's title recommendations](https://developers.google.com/search/docs/advanced/appearance/title-link?hl=en)
   - [Google's description recommendations](https://developers.google.com/search/docs/advanced/appearance/snippet?hl=en)

3. Add your page to the `.nav.yml` file in the same directory:

   ```yaml
   - 'Your Page Display Name': 'your-file-name.md'
   ```

## Create a New Section

To create an entirely new section of documentation:

1. Create directory structure:

   ```
   your-new-section/
   ├── .nav.yml
   ├── index.md
   └── your-first-page.md
   ```

2. Create `.nav.yml`:

   ```yaml
   title: Section Display Name
   nav: 
     - 'Overview': index.md
     - 'Page Display Name': 'file-name.md'
     - subdirectory-name
   ```
   
   - **`title`**: Displayed in left navigation
   - **`index.md`**: Always first in nav list (if exists)
   - **Files**: `'Display Name': 'file-name.md'`
   - **Subdirectories**: Listed by directory name

3. Create the `index.md` landing page with frontmatter and content introducing the section.

## Write a Tutorial

This section covers tutorial-specific requirements and formatting.

**Requirement**: Follow the [PaperMoon Documentation Style Guide](https://github.com/papermoonio/documentation-style-guide).

Place your tutorial under the most relevant existing section of the docs. Set up file and asset paths to match the surrounding structure:

```
<section>/<subsection>/<tutorial-name>.md
images/<section>/<subsection>/<tutorial-name>/
.snippets/code/<section>/<subsection>/<tutorial-name>/
```

### Tutorial Template

```markdown
---
title: Tutorial Title (max 60 chars)
description: Description 120-160 chars.
categories: Category1, Category2
page_badges:
  tutorial_badge: Beginner | Intermediate | Advanced
---

# Tutorial Title

## Introduction

Brief explanation of what users will learn/build.

## Prerequisites

Required knowledge/tools.

## [Action-Oriented Section Title]

Instructions with commands.

## Verification

How to confirm it worked.

## Where to Go Next

Related tutorials.
```

See [Frontmatter Reference](#frontmatter-reference) for a full list of available frontmatter fields.

### Tutorial Requirements

- All code examples must be tested and functional.
- Always specify dependency versions (e.g., `npm install polkadot-api@1.16.0`).
- Use action-oriented section titles.
- Include verification steps.

## Working with Content Elements

### Adding Images

**Where to store**: `images/<path-matching-doc-structure>/`

**Requirements**:

- **Format**: `.webp`
- **Desktop screenshots**: 1512px width, variable height
- **Browser extension screenshots**: 400x600px

**How to use**:

```markdown
![Alt text description](/images/<subdirectory>/<image-file-name>.webp)
```

**Adding annotations**:

Use assets from the [.assets/annotations](.assets/annotations/) directory: 
- **Arrows**: Highlight single elements
- **Steps**: Highlight multiple elements (use numbers for numbered lists, letters for alphabetical lists)

### Using Code Snippets

**Purpose**: For any code used on the page or for reuse of text across multiple pages while maintaining it in one place.

**Where to store**: `.snippets/code/<path-matching-doc-structure>/<snippet-name>`

**How to use**:
```javascript
--8<-- 'code/<subdirectory>/<snippet-file-name>.js:10:20'
```

**File types**:
- **Text snippets**: `.md` files for reusable copy
- **Code snippets**: Use appropriate language extension (`.js`, `.py`, etc.)

Learn more about [snippets syntax](https://facelessuser.github.io/pymdown-extensions/extensions/snippets/).

### Adding Callout Boxes

Use these to highlight important information:

```markdown
!!! tip
    Helpful tips and shortcuts.

!!! note
    Important information to remember.

!!! warning
    Potential issues or caveats.
```

### Using Termynal for Command Output

**Purpose**: Display terminal/command output in a visual format that simulates a terminal session.

**When to use**: Anytime you need to show command output or terminal interactions in the documentation.

**Basic syntax**:

```
<div class="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>your-command-here</span>
    <span data-ty="progress"></span>
    <span data-ty>Output line 1</span>
    <span data-ty>Output line 2</span>
</div>
```

## Frontmatter Reference

Every page begins with a YAML frontmatter block between `---` delimiters. The fields below are all supported options.

### Required fields

| Field         | Description                                                                                                            |
|---------------|------------------------------------------------------------------------------------------------------------------------|
| `title`       | Page title. Keep to 60 characters or fewer for good SEO.                                                               |
| `description` | Meta description shown in search results. Aim for 120–160 characters.                                                  |
| `categories`  | Comma-separated list of content categories used to group AI artifacts. Valid values are defined in `llms_config.json`. |

### Optional fields

| Field               | Type           | Description                                                                                                                                         |
|---------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `short_description` | string         | A shorter description used in auto-generated index tables (falls back to `description` if absent).                                                  |
| `tools`             | string or list | Tools used on the page, shown in index tables. Accepts a comma-separated string or a YAML list.                                                     |
| `hide`              | list           | Hides page elements. Accepted values: `navigation` (hides left nav), `toc` (hides table of contents).                                               |
| `template`          | string         | Overrides the page template. Only used on the homepage (`home.html`).                                                                               |
| `footer_nav`        | bool or int    | Adds the page to the footer navigation. Use `true` to include in discovery order, or an integer for explicit ordering (lower numbers appear first). |
| `extra_javascript`  | list           | Additional JavaScript files to load on this page only. Used to activate interactive widgets.                                                        |
| `extra_css`         | list           | Additional CSS files to load on this page only. Used alongside `extra_javascript` for interactive widgets.                                          |
| `page_badges`       | object         | Displays difficulty and CI status badges in the page header. See [`page_badges`](#page_badges) below.                                               |
| `page_tests`        | object         | Links a test file to the page, shown as a "View tests" link. See [`page_tests`](#page_tests) below.                                                 |
| `toggle`            | object         | Groups pages into a switchable variant toggle (e.g. EVM vs PVM). See [`toggle`](#toggle) below.                                                     |

### `page_badges`

Displays badge labels in the page header.

```yaml
page_badges:
  tutorial_badge: Beginner   # or Intermediate, Advanced
  test_workflow: workflow-name  # filename of the GitHub Actions workflow (without .yml)
```

- `tutorial_badge` — renders a difficulty badge: `Beginner`, `Intermediate`, `Advanced`. Also used by index tables for the Difficulty column.
- `test_workflow` — links to a GitHub Actions status badge for the named workflow. Workflows must exist in the [`polkadot-developers/polkadot-cookbook`](https://github.com/polkadot-developers/polkadot-cookbook) repository under `.github/workflows/`.

### `page_tests`

Links a test file to the page, displayed as a "View tests" link in the page header. The `path` is relative to the root of the [`polkadot-developers/polkadot-cookbook`](https://github.com/polkadot-developers/polkadot-cookbook) repository.

```yaml
page_tests:
  path: polkadot-docs/path/to/tests/docs.test.ts
```

### `toggle`

Powers the page toggle feature, which groups related pages and lets readers switch between variants (e.g. EVM vs PVM) without leaving the section. All pages in a group must share the same `group` value.

```yaml
toggle:
  group: my-group-name     # shared identifier across all pages in the toggle
  variant: evm             # this page's variant identifier
  label: EVM               # label shown on the toggle button
  canonical: true          # mark one page as canonical (the default shown in nav)
```
