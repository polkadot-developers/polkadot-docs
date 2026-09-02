!!! info "Storage options for your Product"
    Match the data to the layer built for it; see [Where to Store Data](/apps/concepts/data-placement/) for the full decision guide.

    - **Local storage**: Per-Product, per-device key-value for preferences, drafts, and cached values. Not synced across devices. See [Persist Data Locally](/apps/build/persist-data-locally/).
    - **Bulletin Chain**: Content-addressed, on-chain, retained ~2 weeks by default and renewable. Fetched later by CID: profile photos, published articles, app bundles. See [Store Data on Chain](/apps/build/store-data-on-chain/).
    - **Statement Store**: Gossip-distributed, short-lived (default 30s TTL), allowance-gated. Real-time signaling between users: chat, presence, typing indicators. See [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/).
