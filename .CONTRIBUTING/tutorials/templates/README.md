# Tutorial Templates

This folder contains templates for different types of Polkadot tutorials to help you get started quickly and maintain consistency across all documentation.

## Available Templates

### 📦 [Polkadot SDK Template](polkadot-sdk-template.md)
For tutorials covering:
- Parachain development
- Custom pallet creation  
- Runtime configuration
- Substrate chain setup
- Testing and benchmarking

### 💎 [Smart Contracts Template](smart-contracts-template.md)
For tutorials covering:
- EVM smart contracts (Solidity)
- ink! smart contracts (Rust)
- Contract deployment and interaction
- DeFi applications
- Token contracts

### 🌐 [XCM/Interoperability Template](xcm-interoperability-template.md)
For tutorials covering:
- Cross-chain asset transfers
- XCM message construction
- Channel management (HRMP)
- Cross-chain testing
- Multi-chain workflows

### 🖥️ [dApps Template](dapps-template.md)
For tutorials covering:
- Frontend development
- Wallet integration  
- API connections (Polkadot.js, PAPI)
- User interface design
- Chain interaction

### 🗳️ [Governance Template](governance-template.md)
For tutorials covering:
- Proposal creation and submission
- Voting and delegation
- OpenGov participation
- Treasury proposals
- Community governance

## How to Use Templates

1. **Choose the appropriate template** based on your tutorial's focus
2. **Copy the template** to your tutorial location:
   ```bash
   cp tutorials/templates/[template-name].md tutorials/[category]/[your-tutorial].md
   ```
3. **Replace placeholder content** (marked with square brackets `[...]`)
4. **Customize sections** based on your specific tutorial needs
5. **Add your specific code examples** and screenshots
6. **Update navigation** in the relevant `.nav.yml` file

## Template Structure Explained

### Frontmatter Metadata
Every template includes the required metadata fields:
```yaml
---
title: [Keep under 45 characters for SEO]
description: [120-160 characters for meta description]  
tutorial_badge: Beginner | Intermediate | Advanced
categories: [Relevant, Comma, Separated, Categories]
---
```

### Common Sections
All templates follow a consistent structure:

1. **Introduction**: Context and learning objectives
2. **Prerequisites**: Required knowledge, tools, and setup
3. **Step-by-step Instructions**: Numbered steps with code examples
4. **Verification/Testing**: How to confirm success
5. **Troubleshooting**: Common issues and solutions
6. **Where to Go Next**: Related tutorials and next steps
7. **Additional Resources**: External links and references

### Placeholder Format
- `[Square brackets]`: Replace with your specific content
- `[Optional sections]`: Include only if relevant to your tutorial
- Code comments: Replace example code with your implementations

## Best Practices

### Content Guidelines
- **Be specific**: Replace generic examples with concrete, working code
- **Test thoroughly**: Ensure all code examples work as described
- **Include context**: Explain why each step is necessary
- **Specify versions**: Always include specific versions for dependencies (e.g., `npm install package@1.2.3`)
- **Add screenshots**: Visual aids improve understanding (use `.webp` format)
  - Desktop screenshots: 1512px width, variable height
  - Browser extensions: 400x600px
  - Naming: `tutorial-name-01.webp`, `tutorial-name-02.webp`, etc.

### File Organization
When using templates, ensure you follow the proper file structure:
```
tutorials/[category]/[subcategory]/[tutorial-name].md
images/tutorials/[category]/[subcategory]/[tutorial-name]/
.snippets/code/tutorials/[category]/[subcategory]/[tutorial-name]/
```

### Navigation
**Critical**: Always update the appropriate `.nav.yml` files when adding a new tutorial:
```yaml
- 'Your Tutorial Title': your-tutorial-filename.md
```

## Template Customization

### Adding New Sections
Feel free to add sections relevant to your tutorial:
- **Architecture Overview**: For complex system tutorials  
- **Security Considerations**: For security-sensitive topics
- **Performance Optimization**: For advanced implementation guides
- **Integration Examples**: For API and service tutorials

### Adapting Difficulty Levels
- **Beginner**: Focus on step-by-step instructions with detailed explanations
- **Intermediate**: Assume familiarity with basic concepts, focus on implementation
- **Advanced**: Emphasize architecture, edge cases, and optimization

### Code Examples
Replace template code with your specific examples:
- Use real, tested code snippets
- Include error handling where appropriate
- Show expected outputs
- Provide alternative approaches when relevant

## Questions and Support

- **Style questions**: See [../STYLE_GUIDE.md](../STYLE_GUIDE.md)
- **Contributing process**: See [../CONTRIBUTING.md](../CONTRIBUTING.md)  
- **General help**: See [../../CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Quick Start**: Copy the most relevant template, replace the bracketed placeholders with your content, test thoroughly, and submit your pull request! 🚀