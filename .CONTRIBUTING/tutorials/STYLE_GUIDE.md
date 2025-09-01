# Tutorial Style Guide - Detailed Reference

Comprehensive guide for tutorial writing standards, formatting, and best practices. 

**For contributors using the Self-Managed Path:** This guide contains all requirements you must follow.

**For contributors using the Team-Assisted Path:** This guide is recommended reading to create better tutorials from the start, but the team will handle most formatting requirements for you.

Quick reference available at: [TUTORIALS_CONTRIBUTING.md](.CONTRIBUTING.md)

This guide covers tutorial-specific requirements and formatting. For general writing guidelines that apply to all documentation, refer to the [PaperMoon Documentation Style Guide](https://github.com/papermoonio/documentation-style-guide).

## Table of Contents

- [Tutorial Structure](#tutorial-structure)
- [Writing Guidelines](#writing-guidelines)
- [Metadata Requirements](#metadata-requirements)
- [File Organization](#file-organization)
- [Navigation Configuration](#navigation-configuration)
- [Code Examples](#code-examples)
- [Images and Screenshots](#images-and-screenshots)
- [Testing Guidelines](#testing-guidelines)

## Tutorial Structure

### Tutorial Categories Overview

```
tutorials/
├── dapps/              # Application development guides
├── interoperability/   # XCM, cross-chain operations
├── onchain-governance/ # Governance operations
├── polkadot-sdk/      # SDK-based development
└── smart-contracts/    # Smart contract development
```

### Category Details

#### Polkadot SDK Tutorials (`polkadot-sdk/`)
- **Parachains**: Zero-to-hero guides, custom pallets, runtime development
- **System Chains**: Asset Hub, Bridge Hub operations
- **Testing**: Chain forking, spawning networks, benchmarking

#### Smart Contracts (`smart-contracts/`)
- **EVM Contracts**: ERC-20, NFTs, DeFi applications
- **Native Contracts**: ink! smart contracts
- **Demo Applications**: Complex application deployments

#### Interoperability (`interoperability/`)
- **XCM Operations**: Cross-chain messaging, asset transfers
- **Channel Management**: HRMP channel operations
- **Testing and Debugging**: XCM testing, replay, dry-run

#### dApps (`dapps/`)
- **Frontend Integration**: Wallet connections, chain interactions
- **API Usage**: PAPI, Polkadot.js integrations

#### On-chain Governance (`onchain-governance/`)
- **Proposal Management**: Creating, voting, tracking proposals
- **OpenGov Operations**: Delegation, conviction voting

## Writing Guidelines

### Target Audience Considerations

Before writing, determine:
1. **Target audience**: Beginners, intermediate, or advanced users
2. **Prerequisites**: Required knowledge, tools, and setup
3. **Learning objectives**: What users will accomplish
4. **Category fit**: Ensure tutorial belongs in the appropriate category

### Writing Best Practices

1. **Use active voice**: "You will build..." instead of "A blockchain will be built..."
2. **Be specific**: Provide exact commands, file paths, and parameter values
3. **Include context**: Explain why each step is necessary
4. **Use consistent terminology**: Follow established Polkadot vocabulary
5. **Provide alternatives**: When multiple approaches exist, mention them
6. **Add warnings**: Use `!!!warning` for important caveats

### Tone and Style

- Write in second person ("you will", "your application")
- Use clear, concise sentences
- Break up long paragraphs
- Use bullet points for lists and options
- Number steps for procedures

## Metadata Requirements

### Complete Metadata Template

```yaml
---
title: Your Tutorial Title
description: A concise description (120-160 characters) of what the tutorial covers
tutorial_badge: Beginner | Intermediate | Advanced
categories: Category1, Category2, Category3
---
```

### Field Specifications

- **title**: SEO-optimized title (max 45 characters)
- **description**: Meta description for search engines (120-160 characters)
- **tutorial_badge**: Difficulty level (Beginner | Intermediate | Advanced)
- **categories**: Comma-separated relevant tags for filtering

### Common Categories

Use these standardized categories:
- `Basics`, `Parachains`, `Smart Contracts`, `dApps`, `Interoperability`
- `Testing`, `Governance`, `System Chains`, `XCM`, `Runtime Development`

## File Organization

### Directory Structure

```
tutorials/[category]/[subcategory]/[tutorial-name].md
images/tutorials/[category]/[subcategory]/[tutorial-name]/
.snippets/code/tutorials/[category]/[subcategory]/[tutorial-name]/
```

### File Naming Conventions

- Use kebab-case for file names: `set-up-a-template.md`
- Match directory names with tutorial categories
- Keep names descriptive but concise
- Avoid special characters and spaces

### Example Structure

```
tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template.md
images/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/
.snippets/code/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/
```

## Navigation Configuration

### Navigation File Structure

Each directory contains a `.nav.yml` file defining navigation:
- `/tutorials/.nav.yml` - Main tutorials navigation
- `/tutorials/[category]/.nav.yml` - Category-specific navigation  
- `/tutorials/[category]/[subcategory]/.nav.yml` - Subcategory navigation

### Navigation Format

```yaml
title: Section Title
nav:
  - index.md
  - 'Display Title': tutorial-filename.md
  - subcategory-folder-name
```

### Navigation Examples

**Main tutorials navigation** (`/tutorials/.nav.yml`):
```yaml
title: Tutorials
nav:
  - index.md
  - polkadot-sdk
  - interoperability
  - smart-contracts
  - dapps
```

**Category-specific navigation** (`/tutorials/polkadot-sdk/parachains/zero-to-hero/.nav.yml`):
```yaml
title: Zero to Hero
nav:
  - index.md
  - 'Set Up a Template': set-up-a-template.md
  - 'Build a Custom Pallet': build-custom-pallet.md
  - 'Add Pallets to the Runtime': add-pallets-to-runtime.md
```

### Navigation Best Practices

- Use clear, descriptive display titles (under 50 characters)
- Order tutorials by logical progression (beginner → advanced)
- Always include `index.md` as the first entry
- Use folder names (without quotes) for subcategories

## Code Examples

### Code Snippet Organization

Store reusable code in the `.snippets` directory:

```
.snippets/code/tutorials/[category]/[subcategory]/[tutorial-name]/
├── setup.sh
├── example-contract.sol
├── interaction-script.js
└── expected-output.html
```

### Including Code Snippets

```markdown
```bash
--8<-- 'code/tutorials/polkadot-sdk/parachains/setup.sh'
```
```

### Code Block Guidelines

- Always specify language for syntax highlighting
- Include file names when showing file contents
- Use `!!!tip` to explain complex code sections
- Test all code examples before submission
- Include expected outputs where relevant
- **Always specify dependency versions** in installation commands
  - Instead of: `npm install polkadot-api`
  - Use: `npm install polkadot-api@1.16.0`

### Language Tags

Common language tags to use:
- `bash` - Terminal commands
- `rust` - Rust code
- `javascript` - JavaScript/TypeScript
- `solidity` - Smart contract code
- `yaml` - Configuration files
- `json` - JSON data

## Images and Screenshots

### Image Requirements

- **Format**: All images must be in `.webp` format
- **Location**: Store in `images/tutorials/[category]/[subcategory]/[tutorial-name]/`
- **Naming**: Use sequential, descriptive names following this pattern:
  - `tutorial-name-01.webp`, `tutorial-name-02.webp`, etc.
  - Example: `set-up-a-template-01.webp`, `set-up-a-template-02.webp`
- **Alt text**: Always include descriptive alt text for accessibility

### Screenshot Guidelines

- Use consistent browser/interface settings
- Crop images to show only relevant content
- Use arrows or highlighting to guide attention
- Ensure text is readable at standard sizes
- Update screenshots when UI changes

#### Image Dimensions
**Important**: Use these specific dimensions to avoid rework during review:

- **Desktop screenshots**: 1512px width, variable height
- **Browser extension screenshots**: 400x600px


### Image Syntax

```markdown
![Descriptive alt text](/images/tutorials/category/subcategory/tutorial-name/image-name.webp)
```

### Image Optimization

- Compress images for web performance
- Use appropriate dimensions (not too large)
- Consider dark/light mode compatibility
- Test images at different screen sizes

## Testing Guidelines

### Testing Requirements

Before submitting, test your tutorial thoroughly:

1. **Fresh environment**: Test on a clean system without existing setup
2. **Follow exactly**: Execute instructions step-by-step
3. **Test alternatives**: Try different operating systems if applicable
4. **Verify outputs**: Ensure all expected results are achieved
5. **Check links**: Verify all external links work properly

### Testing Checklist

- [ ] All commands execute successfully
- [ ] All downloads and installations work
- [ ] Screenshots match current interface versions
- [ ] Code examples compile and run
- [ ] Expected outputs are produced
- [ ] External links are functional
- [ ] Tutorial works on different environments

### Common Testing Issues

- Environment-specific dependencies
- Version compatibility problems
- Network connectivity requirements
- Permission issues
- Missing prerequisite installations

## Advanced Tutorial Structure

For complex tutorials requiring multiple sections:

```markdown
---
title: [Title]
description: [Description]
tutorial_badge: Advanced
categories: [Categories]
---

# Tutorial Title

## Introduction
[Context and objectives]

## Prerequisites
[Required knowledge and tools]

## Overview
[Architecture or process overview]

## Part 1: [Section Title]
### Step 1: [Substep]
### Step 2: [Substep]

## Part 2: [Section Title]
### Step 1: [Substep]
### Step 2: [Substep]

## Testing and Verification
[Comprehensive testing instructions]

## Troubleshooting
[Common issues and solutions]

## Where to Go Next
[Advanced topics and related tutorials]

## Additional Resources
[External links and documentation]
```

## Formatting Guidelines

### Callout Boxes

Use these for important information:

- `!!!tip` - Helpful tips and shortcuts
- `!!!note` - Important information to remember
- `!!!warning` - Potential issues or caveats
- `!!!danger` - Critical warnings about destructive actions

### Lists and Procedures

- Use numbered lists for step-by-step procedures
- Use bullet points for feature lists or options
- Keep list items parallel in structure
- Use sub-lists sparingly for clarity

### Code Formatting

- Use backticks for inline code: `variable_name`
- Use code blocks for multi-line code
- Include language tags for syntax highlighting
- Show command outputs when relevant

## Quality Standards

### Content Quality

- Accuracy: All technical information must be correct
- Completeness: Cover all necessary steps
- Clarity: Instructions should be unambiguous
- Currency: Keep content up to date with latest versions

### Review Process

Before submission:
1. Self-review for completeness and accuracy
2. Test on clean environment
3. Check all links and references
4. Verify code examples work
5. Ensure proper formatting and structure

---

## Questions or Issues?

For additional help:
1. Check existing tutorials for examples
2. Review the [main contributing guide](.CONTRIBUTING.md)
3. Open an issue for clarification
4. Join the Polkadot developer community discussions