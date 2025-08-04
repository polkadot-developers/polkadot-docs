---
title: Storage
description: Explore decentralized storage solutions for your Polkadot dApp. Learn about key integrations like Crust and IPFS for robust, censorship-resistant data.
---

# Storage Integrations

Polkadot offers developers a range of decentralized storage solutions to manage dApp data, host frontends, and store large files in a censorship-resistant and resilient manner. These integrations are essential for building fully decentralized applications, ensuring that all components of your dApp, from the front-end to the data, are not reliant on centralized servers.

## Key Storage Solutions

By leveraging decentralized storage, you can enhance the security, reliability, and censorship resistance of your dApps. Polkadot's ecosystem offers several options, allowing you to choose the best fit for your specific needs.

Some of the storage solutions available for Polkadot dApp builders are:

- **[Crust Network](#crust-network):** A decentralized storage network that provides an incentive layer for IPFS.
- **[IPFS](#ipfs):** A foundational peer-to-peer protocol for decentralized file storage.
- **[Other Solutions](#other-solutions):** A brief overview of other storage options in the ecosystem.


## Crust Network

[Crust Network](https://crust.network/){target=\_blank} is a decentralized storage protocol built using the Polkadot SDK that serves as an incentive layer for IPFS. As a parachain in the Polkadot ecosystem, Crust provides a comprehensive set of tools and services for decentralized storage.

### Key Features of Crust

-   **Decentralized and Immutable:** Crust leverages a global network of nodes to provide a truly decentralized storage layer, ensuring data immutability and high availability.
-   **IPFS-based:** Crust is built on top of IPFS, providing a robust and widely-used foundation for file storage. It enhances IPFS with an incentive layer, guaranteeing data persistence and replication.
-   **Cross-Chain Interoperability:** Through Polkadot's XCM, Crust can offer storage services to other parachains, and it also supports EVM-compatible chains, enabling seamless integration with a wide range of dApps.
-   **Developer-Friendly:** Crust offers a suite of tools, including an S3-compatible gateway, a GitHub-like application for decentralized code repositories, and various SDKs to simplify the integration process.

### Use Cases

-   **dApp Hosting:** Deploy your dApp's frontend on Crust for a fully decentralized solution.
-   **NFT Storage:** Store NFT metadata and assets in a persistent and decentralized manner.
-   **File Storage and Sharing:** Build decentralized applications for file storage and sharing, similar to traditional cloud storage services.


## IPFS

The [InterPlanetary File System (IPFS)](https://ipfs.tech/){target=\_blank} is a peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open. It is a foundational technology for the decentralized web, and many storage solutions, including Crust, are built upon it.

IPFS uses **content-addressing** instead of location-addressing. When you add a file to IPFS, it is given a unique cryptographic hash called a Content Identifier (CID). This means that the content itself determines its address, making it verifiable and permanent.

### Using IPFS with Polkadot

While IPFS is a standalone protocol, it can be integrated into your Polkadot dApp in several ways:

-   **Off-Chain Data Storage:** Store large files, such as images, videos, and documents, off-chain on IPFS to reduce on-chain storage costs and improve performance.
-   **Frontend Hosting:** Host your dApp's frontend on IPFS to ensure that it remains accessible and censorship-resistant.
-   **Integration with Storage Networks:** Use services like Crust Network or other pinning services to ensure your IPFS data is always available and replicated across multiple nodes.
-   **Run your own IPFS Node:** Since IPFS is a P2P Network, you can optionally run your own IPFS node and have complete control over your data


## Other Solutions

In addition to Crust and IPFS, the Polkadot ecosystem is home to other emerging storage solutions. Projects like **[Aleph Cloud](https://aleph.cloud){target=\_blank}** and **[Chainsafe's Files](https://files.chainsafe.io){target=\_blank}** also offer decentralized storage services that can be integrated with your Polkadot dApp. As the ecosystem continues to grow, more storage options will become available, providing developers with a wide range of choices to meet their needs.