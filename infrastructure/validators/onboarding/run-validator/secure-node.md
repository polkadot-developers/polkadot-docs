---
title: Secure Your Validator
description: Recommended practices to monitor, secure, and manage keys for your relay chain validator, along with some caveats on validators and hardware security
---

Validators in a Proof of Stake network are responsible for keeping the network in consensus and verifying state transitions. As the number of validators is limited, validators in the set have the responsibility to be online and faithfully execute their tasks.

This primarily means that validators:

- Must be high availability
- Must have infrastructure that protects validators' signing keys so that an attacker cannot take control and commit [slash-able behavior](TODO:update-path){target=\_blank}

!!!warning Do not run more than one validator with the same session keys!
    High availability set-ups that involve redundant validator nodes may seem attractive at first. However, they can be *very dangerous* if they aren't set up perfectly. The reason for this is that **the session keys used by a validator should always be isolated to just a single node.** Replicating session keys across multiple nodes could lead to equivocation [slashes](TODO:update-path){target=\_blank} or parachain validity slashes which can make you lose **100% of your staked funds**.

## Key Management

See the [Polkadot Keys guide]() for more information on keys. The keys
that are of primary concern for validator infrastructure are the session keys. These keys sign messages related to consensus and parachains. Although session keys _aren't_ account keys and therefore cannot transfer funds, an attacker could use them to commit slash-able behavior.

Session keys can be generated inside the node via [the `author.rotateKeys` RPC call](https://polkadot.js.org/apps/#/rpc){target=\_blank}. See the [How to Validate guide]() for instructions on setting  keys. These should be generated and kept within your client. When you generate new session keys, you must submit an extrinsic (a session certificate) from your staking proxy key telling the chain your new session keys.

!!!info "Generating session keys"
    Session keys can also be generated outside the client and inserted into the client's keystore via RPC (using `author.setKeys` RPC call [via PolkadotJS](https://polkadot.js.org/apps/#/rpc){target=\_blank}). For most users, it is recommended to use the [key generation functionality](todo:link_to_main_validator_guide_w/_key_gen) within the client.

### Signing Outside the Client

In the future, Polkadot will support signing payloads outside the client so that keys can be stored on another device, for example, a Hardware Security Module (HSM) or secure enclave. For the time being,
however, session key signatures are performed within the client.

!!!info "Hardware security modules aren't a panacea"
    They don't incorporate any logic and will just sign and return whatever payload they receive. Therefore, an attacker who gains access to your validator node could still commit slash-able behavior.

### Secure-Validator Mode

Parity Polkadot has a Secure-Validator Mode, enabling several protections for keeping keys secure. The protections include highly strict filesystem, networking, and process sandboxing on top of the
existing `wasmtime` sandbox.

This mode is **activated by default** if the machine meets the following requirements. If not, there is an error message with instructions on disabling Secure-Validator Mode, though this isn't
recommended due to the security risks involved.

#### Requirements

!!!info "`seccomp` is kernel feature that facilitates a more secure approach for process management on Linux"

1. *Linux on x86-64 family* (usually Intel or AMD)
2. *`seccomp` enabled*. You can check that this is the case by running the following command:
  ```
  cat /boot/config-`uname -r` | grep CONFIG_SECCOMP=
  ```
  The expected output, if enabled, is:
  ```
  CONFIG_SECCOMP=y
  ```

!!!note "Optionally, **Linux 5.13** may also be used, as it provides access to even more strict filesystem protections."

## Monitoring Tools

- [`substrate-telemetry`](https://github.com/paritytech/substrate-telemetry){target=\_blank} - this tracks your node details
  including the version you are running, block height, CPU & memory usage, block propagation time, and other metrics
- [Prometheus](https://prometheus.io/){target=\_blank}-based monitoring stack, including
  [Grafana](https://grafana.com){target=\_blank} for dashboards and log aggregation. It includes alerting, querying,
  visualization, and monitoring features and works for both cloud and on-premise systems

## Linux Best Practices

- Never use the root user
- Always update the security patches for your OS
- Enable and set up a firewall
- Never allow password-based SSH, only use key-based access.
- Disable non-essential SSH subsystems (banner, `motd`, `scp`, X11 forwarding) and harden your SSH configuration ([reasonable guide to begin with](https://stribika.github.io/2015/01/04/secure-secure-shell.html){target=\_blank})
- Back up your storage regularly

## Conclusions

- At the moment, Polkadot can't interact with HSM/SGX. The signing key seeds need to be provided to the validator machine. This key is kept in memory for signing operations and persisted to disk (encrypted with a password)
- Given that high availability setups would always be at risk of double-signing and there's currently no built-in mechanism to prevent it, it is recommended to have a single instance of the validator to avoid slashing

### Validators

- Validators should only run the Polkadot binary, and they shouldn't listen on any port other than the configured p2p port
- Validators should run on bare-metal machines, as opposed to virtual machines. This will prevent some of the availability issues with cloud providers, along with potential attacks from other virtual machines on the same hardware. The provisioning of the validator machine should be automated and defined in code. This code should be kept in private version control, reviewed, audited, and tested
- Session keys should be generated and provided in a secure way
- Polkadot should be started at boot and restarted if stopped for any reason (supervisor process)
- Polkadot should run as a non-root user

### Monitoring

- There should be an on-call rotation for managing the alerts
- There should be a clear protocol with actions to perform for each level of each alert and an escalation policy

## Additional References

- [Figment Network's Full Disclosure of Cosmos Validator Infrastructure](https://medium.com/figment-networks/full-disclosure-figments-cosmos-validator-infrastructure-3bc707283967){target=\_blank}
- [Certus One's Knowledge Base](https://kb.certus.one/){target=\_blank}
- [EOS Block Producer Security List](https://github.com/slowmist/eos-bp-nodes-security-checklist){target=\_blank}
- [HSM Policies and the Important of Validator Security](https://medium.com/loom-network/hsm-policies-and-the-importance-of-validator-security-ec8a4cc1b6f){target=\_blank}

