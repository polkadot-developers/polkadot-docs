---
title: General Management
description: Learn how to manage your Polkadot validator node, from setting up monitoring tools like Prometheus and Grafana to implementing security best practices.
---

# General Management

## Introduction

Maintaining a Polkadot validator node requires proactive management to ensure uptime, security, and optimal performance. This guide covers essential operational tasks, including monitoring node health with Prometheus and Grafana, securing your validator with best practices, and implementing alerting systems for quick issue resolution. Whether you're new to running a node or looking to refine your setup, these steps will help you maintain a reliable and secure validator in the Polkadot ecosystem.

## Monitor Your Node

Monitoring your node's performance is critical to maintaining network reliability and security. Tools like [Prometheus](https://prometheus.io/){target=\_blank} and [Grafana](https://grafana.com/){target=\_blank} provide insights into block height, peer connections, CPU and memory usage, and more. This section walks through setting up these tools and configuring alerts to notify you of potential issues.

### Prepare Environment

Before installing Prometheus, it's important to set up the environment securely to ensure Prometheus runs with restricted user privileges. You can set up Prometheus securely as follows:

1. **Create a Prometheus user** - ensure Prometheus runs with minimal permissions
  ``` bash
  sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus
  ```
2. **Set up directories** - create directories for configuration and data storage
  ``` bash
  sudo mkdir /etc/prometheus
  sudo mkdir /var/lib/prometheus
  ```
3. **Change directory ownership** - only Prometheus should have access
  ``` bash
  sudo chown -R prometheus:prometheus /etc/prometheus
  sudo chown -R prometheus:prometheus /var/lib/prometheus
  ```

### Install and Configure Prometheus

After preparing the environment, install and configure the latest version of Prometheus as follows:

1. **Download Prometheus** - obtain the latest binaries from the [Prometheus releases page](https://github.com/prometheus/prometheus/releases/){target=\_blank}
    ```bash
    sudo apt-get update && apt-get upgrade
    wget https://github.com/prometheus/prometheus/releases/download/v2.26.0/prometheus-2.26.0.linux-amd64.tar.gz
    tar xfz prometheus-*.tar.gz
    cd prometheus-2.26.0.linux-amd64
    ```
2. **Set up Prometheus** - copy binaries and directories, assign ownership of these files to the `prometheus` user, and clean up download directory using the following sets of commands:

    === "Binaries"
        ``` bash 
        sudo cp ./prometheus /usr/local/bin/
        sudo cp ./promtool /usr/local/bin/
        sudo cp ./prometheus /usr/local/bin/
        sudo cp ./promtool /usr/local/bin/
        ```
    === "Directories"
        ``` bash 
        sudo cp -r ./consoles /etc/prometheus
        sudo cp -r ./console_libraries /etc/prometheus
        sudo chown -R prometheus:prometheus /etc/prometheus/consoles
        sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
        ```
    === "Clean up"
        ```bash
        cd .. && rm -rf prometheus*
        ```

3. **Create `prometheus.yml` for configuration** - define global settings, rule files, and scrape targets
    ```bash
    sudo nano /etc/prometheus/prometheus.yml
    ```
    Prometheus is scraped every 5 seconds in this example configuration file, ensuring detailed internal metrics. Node metrics with customizable intervals are scraped from port `9615` by default.
    ``` yaml title="prometheus-config.yml"
    --8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/prometheus-config.yml'
    ```
    
4. **Validate configuration with promtool** - use the open-source monitoring system to check your configuration
    ```bash
    promtool check config /etc/prometheus/prometheus.yml
    ```
5. **Assign ownership** - save the configuration file and change the ownership of the file to `prometheus` user
    ```bash
    sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml
    ```

### Start Prometheus

1. **Launch Prometheus** - use the following command to launch Prometheus with a given configuration, set the storage location for metric data, and enable web console templates and libraries: 

    ```bash
    sudo -u prometheus /usr/local/bin/prometheus --config.file /etc/prometheus/prometheus.yml --storage.tsdb.path /var/lib/prometheus/ --web.console.templates=/etc/prometheus/consoles --web.console.libraries=/etc/prometheus/console_libraries
    ```

    If you set the server up properly, you should see terminal messages similar to the following:

    -8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/terminal-ouput-01.html'

2. **Verify access** - verify you can access the Prometheus interface by visiting the following address:
    ``` bash
    http://SERVER_IP_ADDRESS:9090/graph
    ```

    If the interface appears to work as expected, exit the process using `Control + C`.

3. **Create new systemd configuration file** - this will automatically start the server during the boot process
    ```bash
    sudo nano /etc/systemd/system/prometheus.service
    ```
    Add the following code to the configuration file:

    ```bash title="prometheus.service"
    --8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/systemd-config.md'
    ```
    Once you save the file, execute the following command to reload `systemd` and enable the service so that it will be loaded automatically during the operating system's startup:

    ```bash
    sudo systemctl daemon-reload && systemctl enable prometheus && systemctl start prometheus
    ```
4. **Verify service** - return to the Prometheus interface at the following address to verify the service is running:
    ``` bash
    http://SERVER_IP_ADDRESS:9090/
    ```

### Install and Configure Grafana

Grafana provides a powerful, customizable interface to visualize metrics collected by Prometheus. To install and configure Grafana, follow these steps:

1. **Install Grafana** - run the following commands to install Grafana:
    ```bash
    sudo apt-get install -y adduser libfontconfig1
    wget https://dl.grafana.com/oss/release/grafana_7.5.4_amd64.deb
    sudo dpkg -i grafana_7.5.4_amd64.deb
    ```
2. **Set Grafana to auto-start** - configure Grafana to start automatically on system boot and start the service
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable grafana-server
    sudo systemctl start grafana-server
    ```
3. **Access Grafana** - open your browser, navigate to the following address, and use the default user and password `admin` to login:
    ```bash
    http://SERVER_IP_ADDRESS:3000/login
    ```

??? tip "Change default port"
    If you want run Garana on another port, edit the file `/usr/share/grafana/conf/defaults.ini` with a command like:
    ``` bash
    sudo vim /usr/share/grafana/conf/defaults.ini 
    ```
    and change the `http_port` value as desired. Then restart Grafana with:
    ``` bash
    sudo systemctl restart grafana-server
    ```

![Grafana login screen](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-login-01.webp)

Follow these steps to visualize node metrics:

1. Select the gear icon for settings to configure the **Data Sources**
![Select gear icon](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-metrics-01.webp)

2. Select **Add data source** to define the data source
![Select Add data source](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-metrics-02.webp)

3. Select **Prometheus**
![Select Prometheus](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-metrics-03.webp)

4. Enter `https://localhost:9090` in the **URL** field, then select **Save & Test**. If you see the message **"Data source is working"**, your connection is configured correctly
![Save and test](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-metrics-04.webp)

5. Next, select **Import** from the menu bar on the left, select **Prometheus** in the dropdown list and select **Import**
![Import dashboard](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-metrics-05.webp)

6. Finally, start your Polkadot node by running `./polkadot`. You should now be able to monitor your node's performance such as the current block height, network traffic, and running tasks on the Grafana dashboard
![Sample dashboard with metrics](/images/infrastructure/general/setup-secure-wss/running-a-validator/operational-tasks/general-management/grafana-metrics-06.webp)

??? tip "Import via grafana.com" 
    The [Grafana dashboards](https://grafana.com/grafana/dashboards){target=\_blank} page features user created dashboards made available for public use. Visit ["Substrate Node Metrics"](https://grafana.com/grafana/dashboards/21715-substrate-node-metrics/) for an example of available dashboards.

### Install and Configure Alertmanager

You can also configure the optional `Alertmanager` to help predict potential problems or notify you of an active problem with your server. You can receive alerts via Slack, email, and Matrix among other messaging services. You can configure email notifications to alert you if your node goes down. The following sections cover how to install and configure the `AlertManager`.

First, download the latest binary of `AlertManager` and unzip it by running the following command:
```bash
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/unzip-alert-manager.md'
```

#### Setup Gmail

To use Gmail, you must generate an `app password` in your Gmail account to allow `AlertManager` to send you alert notification emails. Visit Google support for more details on setting up your [`app password`](https://support.google.com/accounts/answer/185833?hl=en){target=\_blank}. 

Once you complete the setup, you should see something like the following:

![grafana-am-1](/images/infrastructure/validator/operational-tasks/1-alert-manager.webp)

Be sure to backup this password in a secure location.

#### Configure AlertManager

There is a configuration file named `alertmanager.yml` inside the directory that you unzipped in the first step, but that isn't of use. Create a custom `alertmanager.yml` file under `/etc/alertmanager` with the following configuration:

??? tip "Change `alertmanager` ownership"
    Ensure to change the ownership of `/etc/alertmanager` to `prometheus` by executing the following command:
    ```bash
    sudo chown -R prometheus:prometheus /etc/alertmanager
    ```

```
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/alert-manager.yml'
```

With the preceding configuration, alerts will be sent using the email you set preceding. Remember to replace `YOUR_EMAIL` with the email where you want to receive alerts and paste the app password you saved earlier to the `YOUR_APP_PASSWORD`.

Next, create another `systemd` configuration file named `alertmanager.service` by running the following command:
``` bash
sudo nano /etc/systemd/system/alertmanager.service 
```
Add the following code to the configuration file you just created:

???tip  "SERVER_IP"
    Change to your host IP address and make sure port 9093 is opened

``` bash
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/systemd-alert-config.md'
```

To start the `Alertmanager`, run the following commands:

```
sudo systemctl daemon-reload && sudo systemctl enable alertmanager && sudo systemctl start alertmanager && sudo systemctl status alertmanager
```

```
● alertmanager.service - AlertManager Server Service
   Loaded: loaded (/etc/systemd/system/alertmanager.service; enabled; vendor preset: enabled)
   Active: active (running) since Thu 2020-08-20 22:01:21 CEST; 3 days ago
 Main PID: 20592 (alertmanager)
    Tasks: 70 (limit: 9830)
   CGroup: /system.slice/alertmanager.service
```

If you have configured the `AlertManager` properly, the `Active` field should display "active (running)."

There is an `Alertmanager` plugin in Grafana that can help you monitor the alert information. To install the plugin, execute the followiing command:

``` bash
sudo grafana-cli plugins install camptocamp-prometheus-alertmanager-datasource
```

Once you successfully install the plugin, restart Grafana:

``` bash
sudo systemctl restart grafana-server
```

Now go to your Grafana dashboard `SERVER_IP:3000` and configure the `Alertmanager` datasource.

![grafana-am-5](/images/infrastructure/validator/operational-tasks/5-alert-manager.webp)

Go to **Configuration** -> **Data Sources**, and search for "Prometheus AlertManger" if you cannot find it at the top.

![grafana-am-2](/images/infrastructure/validator/operational-tasks/2-alert-manager.webp)

Fill in the URL to your server location followed by the port number used in the `Alertmanager`. Select **Save & Test** at the bottom to test the connection.

![grafana-am-3](/images/infrastructure/validator/operational-tasks/3-alert-manager.webp)

To monitor the alerts, import the [8010](https://grafana.com/dashboards/8010){target=\_blank} dashboard, which is used for `Alertmanager`. Make sure to select the **Prometheus AlertManage** in the last column then select **Import**.

You will end up having the following:

![grafana-am-4](/images/infrastructure/validator/operational-tasks/4-alert-manager.webp)

#### Integrate AlertManager

To let the Prometheus server be able to talk to the AlertManager, add the following configuration in the `etc/prometheus/prometheus.yml`:

``` yml
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/update-prometheus.yml:5:12'
```

??? interface "Updated `prometheus.yml` file"
    ``` yml
    --8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/update-prometheus.yml'
    ```

Create a new file called `rules.yml` under `/etc/prometheus/` where you will define all the rules for detection and alerts. If any of the rules defined in this file is met, an alert will be triggered. The following rule checks whether the node instance is down. If it is down for more than 5 minutes, an email notification will be sent. If you would like to learn more about the details of the rule defining, see [Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/){target=\_blank} in the Prometheus documentation. You can also find more information on [additional alerts](https://awesome-prometheus-alerts.grep.to/rules.html){target=\_blank} you may find useful.

``` yml
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/instance-down.yml'
```

Change the ownership of this file from `root` to `prometheus` by running:

```bash
sudo chown prometheus:prometheus rules.yml
```

To check the rules defined in `rules.yml` is syntactically correct, run the following command:

```bash
sudo -u prometheus promtool check rules rules.yml
```

Finally, restart everything by running:

```bash
sudo systemctl restart prometheus && sudo systemctl restart alertmanager
```

Now you will receive an alert on the AlertManager and Gmail similar to the following example if one of your target instances is down:

![grafana-am-6](/images/infrastructure/validator/operational-tasks/6-alert-manager.webp)

## Secure Your Validator
<!--https://github.com/polkadot-developers/polkadot-docs/pull/47-->
Validators in a Proof of Stake network are responsible for keeping the network in consensus and verifying state transitions. As the number of validators is limited, validators in the set have the responsibility to be online and faithfully execute their tasks.

This primarily means that validators:

- Must be high availability
- Must have infrastructure that protects validators' signing keys so that an attacker cannot take control and commit [slash-able behavior](infrastructure/staking-mechanics/offenses-and-slashes.md)

!!!warning Do not run more than one validator with the same session keys!
    High availability set-ups that involve redundant validator nodes may seem attractive at first. However, they can be *very dangerous* if they aren't set up perfectly. The reason for this is that **the session keys used by a validator should always be isolated to just a single node.** Replicating session keys across multiple nodes could lead to equivocation [slashes](TODO:update-path){target=\_blank} or parachain validity slashes which can make you lose **100% of your staked funds**.

### Key Management

See the [Polkadot Keys guide]() for more information on keys. The keys
that are of primary concern for validator infrastructure are the session keys. These keys sign messages related to consensus and parachains. Although session keys _aren't_ account keys and therefore cannot transfer funds, an attacker could use them to commit slash-able behavior.

Session keys can be generated inside the node via [the `author.rotateKeys` RPC call](https://polkadot.js.org/apps/#/rpc){target=\_blank}. See the [How to Validate guide]() for instructions on setting  keys. These should be generated and kept within your client. When you generate new session keys, you must submit an extrinsic (a session certificate) from your staking proxy key telling the chain your new session keys.

!!!info "Generating session keys"
    Session keys can also be generated outside the client and inserted into the client's keystore via RPC (using `author.setKeys` RPC call [via PolkadotJS](https://polkadot.js.org/apps/#/rpc){target=\_blank}). For most users, it is recommended to use the [key generation functionality](todo:link_to_main_validator_guide_w/_key_gen) within the client.

#### Signing Outside the Client

In the future, Polkadot will support signing payloads outside the client so that keys can be stored on another device, for example, a Hardware Security Module (HSM) or secure enclave. For the time being,
however, session key signatures are performed within the client.

!!!info "Hardware security modules aren't a panacea"
    They don't incorporate any logic and will just sign and return whatever payload they receive. Therefore, an attacker who gains access to your validator node could still commit slash-able behavior.

#### Secure-Validator Mode

Parity Polkadot has a Secure-Validator Mode, enabling several protections for keeping keys secure. The protections include highly strict filesystem, networking, and process sandboxing on top of the
existing `wasmtime` sandbox.

This mode is **activated by default** if the machine meets the following requirements. If not, there is an error message with instructions on disabling Secure-Validator Mode, though this isn't
recommended due to the security risks involved.

##### Requirements

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

### Monitoring Tools

- [`substrate-telemetry`](https://github.com/paritytech/substrate-telemetry){target=\_blank} - this tracks your node details
  including the version you are running, block height, CPU & memory usage, block propagation time, and other metrics
- [Prometheus](https://prometheus.io/){target=\_blank}-based monitoring stack, including
  [Grafana](https://grafana.com){target=\_blank} for dashboards and log aggregation. It includes alerting, querying,
  visualization, and monitoring features and works for both cloud and on-premise systems

### Linux Best Practices

- Never use the root user
- Always update the security patches for your OS
- Enable and set up a firewall
- Never allow password-based SSH, only use key-based access.
- Disable non-essential SSH subsystems (banner, `motd`, `scp`, X11 forwarding) and harden your SSH configuration ([reasonable guide to begin with](https://stribika.github.io/2015/01/04/secure-secure-shell.html){target=\_blank})
- Back up your storage regularly

### Conclusions

- At the moment, Polkadot can't interact with HSM/SGX. The signing key seeds need to be provided to the validator machine. This key is kept in memory for signing operations and persisted to disk (encrypted with a password)
- Given that high availability setups would always be at risk of double-signing and there's currently no built-in mechanism to prevent it, it is recommended to have a single instance of the validator to avoid slashing

#### Validators

- Validators should only run the Polkadot binary, and they shouldn't listen on any port other than the configured p2p port
- Validators should run on bare-metal machines, as opposed to virtual machines. This will prevent some of the availability issues with cloud providers, along with potential attacks from other virtual machines on the same hardware. The provisioning of the validator machine should be automated and defined in code. This code should be kept in private version control, reviewed, audited, and tested
- Session keys should be generated and provided in a secure way
- Polkadot should be started at boot and restarted if stopped for any reason (supervisor process)
- Polkadot should run as a non-root user

#### Monitoring

- There should be an on-call rotation for managing the alerts
- There should be a clear protocol with actions to perform for each level of each alert and an escalation policy

### Additional References

- [Figment Network's Full Disclosure of Cosmos Validator Infrastructure](https://medium.com/figment-networks/full-disclosure-figments-cosmos-validator-infrastructure-3bc707283967){target=\_blank}
- [Certus One's Knowledge Base](https://kb.certus.one/){target=\_blank}
- [EOS Block Producer Security List](https://github.com/slowmist/eos-bp-nodes-security-checklist){target=\_blank}
- [HSM Policies and the Important of Validator Security](https://medium.com/loom-network/hsm-policies-and-the-importance-of-validator-security-ec8a4cc1b6f){target=\_blank}
