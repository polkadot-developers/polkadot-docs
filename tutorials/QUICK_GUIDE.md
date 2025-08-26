# Contributing Tutorials - Quick Guide

Fast-track guide for experienced contributors. For detailed explanations, see [STYLE_GUIDE.md](STYLE_GUIDE.md).

## Essential Requirements

### 1. Metadata (Required)
```yaml
---
title: Tutorial Title (max 45 chars)
description: Description 120-160 chars
tutorial_badge: Beginner | Intermediate | Advanced
categories: Category1, Category2
---
```

### 2. File Structure (Required)
```
tutorials/[category]/[subcategory]/[tutorial-name].md
images/tutorials/[category]/[subcategory]/[tutorial-name]/
.snippets/code/tutorials/[category]/[subcategory]/[tutorial-name]/
```

### 3. Navigation Update (Critical)
**Must update `.nav.yml` files** or your tutorial won't appear:
```yaml
# In appropriate .nav.yml file
- 'Display Title': tutorial-filename.md
```

### 4. Working Code & Tests (Required)
- All code examples must be tested and functional
- Include verification steps
- Test on clean environment before submitting

## Tutorial Categories

- **polkadot-sdk/**: Parachains, pallets, runtime development
- **smart-contracts/**: EVM, ink!, demo applications  
- **interoperability/**: XCM operations, channel management
- **dapps/**: Frontend integration, API usage
- **onchain-governance/**: Proposals, OpenGov operations

## Basic Template

```markdown
# Tutorial Title

## Introduction
[Brief explanation of what users will learn/build]

## Prerequisites
- [Required knowledge/tools]

## Step 1: [Action]
[Instructions with commands]

## Verification
[How to confirm it worked]

## Where to Go Next
[Related tutorials]
```

## Image Requirements

- **Format**: `.webp` only
- **Location**: `images/tutorials/[path]/`
- **Dimensions**: 
  - Desktop screenshots: 1512px width, variable height
  - Browser extensions: 400x600px  
- **Alt text**: Always required

## Submission Checklist

- [ ] Metadata complete
- [ ] Working code tested
- [ ] Images in `.webp` format
- [ ] Navigation updated (`.nav.yml`)
- [ ] Files follow naming conventions
- [ ] Verification steps included

## Quick Links

- **Templates**: [templates/](templates/) folder
- **Style Guide**: [STYLE_GUIDE.md](STYLE_GUIDE.md)  
- **Examples**: Browse existing tutorials for reference

---

Need help? Check the [detailed style guide](STYLE_GUIDE.md) or existing tutorials for examples.