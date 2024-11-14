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
3. **Change directory ownership** - ensure Prometheus has access
  ``` bash
  sudo chown -R prometheus:prometheus /etc/prometheus
  sudo chown -R prometheus:prometheus /var/lib/prometheus
  ```

### Install and Configure Prometheus

After preparing the environment; install and configure the latest version of Prometheus as follows:

1. **Download Prometheus** - obtain the latest binaries from the [Prometheus releases page](https://github.com/prometheus/prometheus/releases/){target=\_blank} using these commands:
    ```bash
    sudo apt-get update && sudo apt-get upgrade
    wget https://github.com/prometheus/prometheus/releases/download/v2.26.0/prometheus-2.26.0.linux-amd64.tar.gz
    tar xfz prometheus-*.tar.gz
    cd prometheus-2.26.0.linux-amd64
    ```
2. **Set up Prometheus** - copy binaries and directories, assign ownership of these files to the `prometheus` user, and clean up download directory as follows:

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
        cd .. && rm -r prometheus*
        ```

3. **Create `prometheus.yml` for configuration** - run this command to define global settings, rule files, and scrape targets:
    ```bash
    sudo nano /etc/prometheus/prometheus.yml
    ```
    Prometheus is scraped every 5 seconds in this example configuration file, ensuring detailed internal metrics. Node metrics with customizable intervals are scraped from port `9615` by default.
    ``` yaml title="prometheus-config.yml"
    --8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/prometheus-config.yml'
    ```
    
4. **Validate configuration with promtool** - use the open source monitoring system to check your configuration
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

    If you set the server up properly, you should see terminal output similar to the following:

    -8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/terminal-ouput-01.html'

2. **Verify access** - verify you can access the Prometheus interface by visiting the following address:
    ``` bash
    http://SERVER_IP_ADDRESS:9090/graph
    ```

    If the interface appears to work as expected, exit the process using `Control + C`.

3. **Create new systemd service file** - this will automatically start the server during the boot process
    ```bash
    sudo nano /etc/systemd/system/prometheus.service
    ```
    Add the following code to the service file:

    ```bash title="prometheus.service"
    --8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/systemd-config.md'
    ```
    Once you save the file, execute the following command to reload `systemd` and enable the service so that it will load automatically during the operating system's startup:

    ```bash
    sudo systemctl daemon-reload && sudo systemctl enable prometheus && sudo systemctl start prometheus
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
    If you want run Grafana on another port, edit the file `/usr/share/grafana/conf/defaults.ini` with a command like:
    ``` bash
    sudo vim /usr/share/grafana/conf/defaults.ini 
    ```
    You can change the `http_port` value as desired. Then restart Grafana with:
    ``` bash
    sudo systemctl restart grafana-server
    ```

![Grafana login screen](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-login-01.webp)

Follow these steps to visualize node metrics:

1. Select the gear icon for settings to configure the **Data Sources**
![Select gear icon](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-metrics-01.webp)

2. Select **Add data source** to define the data source
![Select Add data source](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-metrics-02.webp)

3. Select **Prometheus**
![Select Prometheus](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-metrics-03.webp)

4. Enter `https://localhost:9090` in the **URL** field, then select **Save & Test**. If you see the message **"Data source is working"** your connection is configured correctly
![Save and test](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-metrics-04.webp)

5. Next, select **Import** from the menu bar on the left, select **Prometheus** in the dropdown list and select **Import**
![Import dashboard](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-metrics-05.webp)

6. Finally, start your Polkadot node by running `./polkadot`. You should now be able to monitor your node's performance such as the current block height, network traffic, and running tasks on the Grafana dashboard
![Sample dashboard with metrics](/images/infrastructure/running-a-validator/operational-tasks/general-management/grafana-metrics-06.webp)

??? tip "Import via grafana.com" 
    The [Grafana dashboards](https://grafana.com/grafana/dashboards){target=\_blank} page features user created dashboards made available for public use. Visit ["Substrate Node Metrics"](https://grafana.com/grafana/dashboards/21715-substrate-node-metrics/){target=\_blank} for an example of available dashboards.

### Install and Configure Alertmanager

The optional `Alertmanager` complements Prometheus by handling alerts and notifying users of potential issues. Follow these steps to install and configure `Alertmanager`:

1. **Download and extract `Alertmanager`** - download the latest version from the [Prometheus Alertmanager releases page](https://github.com/prometheus/alertmanager/releases){target=_blank}
    ```bash
    wget https://github.com/prometheus/alertmanager/releases/download/v0.26.0/alertmanager-0.26.0.linux-amd64.tar.gz
    tar -xvzf alertmanager-0.26.0.linux-amd64.tar.gz
    ```
2. **Move binaries and set permissions** - copy the binaries to a system directory and set appropriate permissions
    ```bash
    cd alertmanager-0.26.0.linux-amd64
    sudo cp ./alertmanager /usr/local/bin/
    sudo cp ./amtool /usr/local/bin/
    sudo chown prometheus:prometheus /usr/local/bin/alertmanager
    sudo chown prometheus:prometheus /usr/local/bin/amtool
    ```
3. **Create configuration file** - create a new `alertmanager.yml` file under `/etc/alertmanager`
    ```bash
    sudo mkdir /etc/alertmanager
    sudo nano /etc/alertmanager/alertmanager.yml
    ```
    Add the following code to the configuration file to define email notifications:
    ```yml title="alertmanager.yml"
    -8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/alertmanager.yml'
    ```

    !!! note "App password"

        You must generate an [`app password` in your Gmail account](https://support.google.com/accounts/answer/185833?hl=en){target=\_blank} to allow `Alertmanager` to send you alert notification emails.

    Ensure the configuration file has the correct permissions:
    ```bash
    sudo chown -R prometheus:prometheus /etc/alertmanager
    ```
4. **Configure as a service** - set up `Alertmanager` to run as a service by creating a systemd service file
    ```bash
    sudo nano /etc/systemd/system/alertmanager.service
    ```
    Add the following code to the service file:
    ```yml title="alertmanager.service"
    -8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/systemd-alert-config.md'
    ```
    Reload and enable the service
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable alertmanager
    sudo systemctl start alertmanager
    ```
    Verify the service status using the following command:
    ```bash
    sudo systemctl status alertmanager
    ```
    If you have configured the `Alertmanager` properly, the **Active** field should display **active (running)** similar to below:
    
    -8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/alertmanager-status.html'

#### Grafana Plugin

There is an [`Alertmanager` plugin in Grafana](https://grafana.com/grafana/plugins/alertmanager/){target=\_blank} that can help you monitor alert information. Follow these steps to use the plugin: 

1. **Install the plugin** - use the following command:
    ``` bash
    sudo grafana-cli plugins install camptocamp-prometheus-alertmanager-datasource
    ```
2. **Restart Grafana**
    ``` bash
    sudo systemctl restart grafana-server
    ```
3. **Configure datasource** - go to your Grafana dashboard `SERVER_IP:3000` and configure the `Alertmanager` datasource as follows:
    - Go to **Configuration** -> **Data Sources**, and search for **Prometheus Alertmanager** 
    - Fill in the URL to your server location followed by the port number used in the `Alertmanager`. Select **Save & Test** to test the connection
4. To monitor the alerts, import the [8010](https://grafana.com/dashboards/8010){target=\_blank} dashboard, which is used for `Alertmanager`. Make sure to select the **Prometheus Alertmanager** in the last column then select **Import**

#### Integrate Alertmanager

A few more steps are required to allow the Prometheus server to talk to the Alertmanager and to configure rules for detection and alerts. Complete the integration as follows:

1. **Update configuration** - update the configuration file in the `etc/prometheus/prometheus.yml` to add the following code:
    ``` yml title="prometheus.yml"
    --8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/update-prometheus.yml:5:12'
    ```
2. **Create rules file** - here you will define the rules for detection and alerts
    Run the following command to create the rules file:
    ```bash
    sudo nano /etc/prometheus/rules.yml
    ```
    If any of the conditions defined in the rules file are met, an alert will be triggered. The following sample rule checks for the node being down and triggers an email notification if an outage of more than five minutes is detected:
    ```yml title="rules.yml"
    -8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/instance-down.yml'
    ```
    See [Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/){target=\_blank} and [additional alerts](https://awesome-prometheus-alerts.grep.to/rules.html){target=\_blank} in the Prometheus documentation to learn more about defining and using alerting rules.
3. **Update ownership of rules file** - ensure user `prometheus` has access by running:
    ```bash
    sudo chown prometheus:prometheus rules.yml
    ```
4. **Check rules** - ensure the rules defined in `rules.yml` are syntactically correct by running the following command:
    ```bash
    sudo -u prometheus promtool check rules rules.yml
    ```
5. **Restart Alertmanager** 
    ```bash
    sudo systemctl restart prometheus && sudo systemctl restart alertmanager
    ```

Now you will receive an email alert if one of your rule triggering conditions is met.

??? interface "Updated `prometheus.yml`"
        
        --8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/update-prometheus.yml'
        

## Secure Your Validator

Validators in Polkadot's Proof of Stake network play a critical role in maintaining network integrity and security by keeping the network in consensus and verifying state transitions. To ensure optimal performance and minimize risks, validators must adhere to strict guidelines around security and reliable operations.

### Key Management

Though they don't transfer funds, session keys are essential for validators as they sign messages related to consensus and parachains. Securing session keys is crucial as allowing them to be exploited or used across multiple nodes can lead to a loss of staked funds via [slashing](infrastructure/staking-mechanics/offenses-and-slashes.md).

Given the current limitations in high-availability setups and the risks associated with double-signing, it’s recommended to run only a single validator instance. Keys should be securely managed, and processes automated to minimize human error.

There are two approaches for generating session keys:

1. **Generate and store in node** - using the `author.rotateKeys` RPC call. For most users, generating keys directly within the client is recommended. You must submit a session certificate from your staking proxy to register new keys. See the [How to Validate](TODO: path) guide for instructions on setting keys

2. **Generate outside node and insert** - using the `author.setKeys` RPC call. This flexibility accommodates advanced security setups and should only be used by experienced validator operators

### Signing Outside the Client

Polkadot plans to support external signing, allowing session keys to reside in secure environments like Hardware Security Modules (HSMs). However, these modules can sign any payload they receive, potentially enabling an attacker to perform slashable actions.

### Secure-Validator Mode

Polkadot's Secure-Validator mode offers an extra layer of protection through strict filesystem, networking, and process sandboxing. This secure mode is activated by default if the machine meets the following requirements:

1. **Linux (x86-64 architecture)** - usually Intel or AMD
2. **Enabled `seccomp`** - this kernel feature facilitates a more secure approach for process management on Linux. Verify by running:
    ``` bash
    cat /boot/config-`uname -r` | grep CONFIG_SECCOMP=
    ```
  If `seccomp` is enabled, you should see output similar to the following:
    ```bash
    CONFIG_SECCOMP=y
    ```

!!! note 
    Optionally, **Linux 5.13** may also be used, as it provides access to even more strict filesystem protections.

### Linux Best Practices

Follow these best practices to keep your validator secure:

- Use a non-root user for all operations
- Regularly apply OS security patches
- Enable and configure a firewall
- Use key-based SSH authentication; deactivate password-based login
- Regularly back up data and harden your SSH configuration. Visit this [SSH guide](https://stribika.github.io/2015/01/04/secure-secure-shell.html){target=\_blank} for more details

### Validator Best Practices

Additional best practices can add an additional layer of security and operational reliability:

- Only run the Polkadot binary, and only listen on the configured p2p port
- Run on bare-metal machines, as opposed to virtual machines 
- Provisioning of the validator machine should be automated and defined in code which is kept in private version control, reviewed, audited, and tested
- Generate and provide session keys in a secure way
- Start Polkadot at boot and restart if stopped for any reason 
- Run Polkadot as a non-root user
- Establish and maintain an on-call rotation for managing alerts
- Establish and maintain a clear protocol with actions to perform for each level of each alert with an escalation policy

### Additional References

- [Certus One's Knowledge Base](https://knowledgebase.certus.com/FAQ/){target=\_blank}
- [EOS Block Producer Security List](https://github.com/slowmist/eos-bp-nodes-security-checklist){target=\_blank}
- [HSM Policies and the Importance of Validator Security](https://medium.com/loom-network/hsm-policies-and-the-importance-of-validator-security-ec8a4cc1b6f){target=\_blank}
