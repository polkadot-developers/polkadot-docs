---
title: Use Systemd
description: Using a service manager, such as systemd to streamline the management of your Polkadot node as a process on your Linux host machine.
---

# Run a Validator Using Systemd

Running your Polkadot validator as a [systemd](https://en.wikipedia.org/wiki/Systemd){target=\_blank} service is an effective way to ensure its reliability and uptime. This method enables your validator to automatically restart after server reboots or unexpected crashes, significantly reducing the risk of [slashing](TODO:update-path){target=\_blank} due to downtime.

This guide will walk you through creating and managing a systemd service for your validator, allowing you to seamlessly monitor and control it as part of your Linux system.

## Prerequisites

The following sections go through the process of using the binary and running a Polkadot validator node as a systemd service. To get started, you'll need to:

- Make sure that your system meets the [requirements](TODO:update-path)
- Make sure that you meet the [minimum bond requirements](https://wiki.polkadot.network/docs/chain-state-values#minimum-validator-bond){target=\_blank} for validating
- Have [installed](TODO:update-path--install-polkadot-binary) or [built from sources](TODO:update-path--compile-the-binary) the Polkadot binary

## Create the Systemd Service File

First create a new unit file called `polkadot-validator.service` in `/etc/systemd/system/`:

```bash
touch /etc/systemd/system/polkadot-validator.service
```

In this unit file, you will write the commands that you want to run on server boot/restart:

```systemd
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/heads/master/polkadot/scripts/packaging/polkadot.service'
```

!!!warning
    It is recommended to delay the restart of a node with `RestartSec` in the case of node crashes. It's possible that when a node crashes, consensus votes in GRANDPA aren't persisted to disk. In this case, there is potential to equivocate when immediately restarting. What can happen is that the node won't recognize votes that didn't make it to disk and will then cast conflicting votes. Delaying the restart will allow the network to progress past potentially conflicting votes, at which point other nodes won't accept them.

## Run the Service

To enable this to start on booting your machine, run:

```bash
systemctl enable polkadot-validator.service
```

Start it manually with:

```bash
systemctl start polkadot-validator.service
```

You can check that it's working with:

```bash
systemctl status polkadot-validator.service
```

You can tail the logs with [`journalctl`](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html){target=\_blank} (a tool to print log entries from the systemd journal) like so:

```bash
journalctl -f -u polkadot-validator
```

Now, you can monitor and manage a Polkadot validator as you would any other service on your Linux host.
