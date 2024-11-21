---
title: General Management
description: Optimize your Polkadot validator setup with advanced configuration techniques. Learn how to boost performance, enhance security, and ensure seamless operations.
---
# General Management

## Introduction

Validator performance is pivotal in maintaining the security and stability of the Polkadot network. As a validator, optimizing your setup ensures efficient transaction processing, minimizes latency, and maintains system reliability during high-demand periods. Proper configuration and proactive monitoring also help mitigate risks like slashing and service interruptions.

This guide covers essential practices for managing a validator, including performance tuning techniques, security hardening, and tools for real-time monitoring. Whether you're fine-tuning CPU settings, configuring NUMA balancing, or setting up a robust alert system, these steps will help you build a resilient and efficient validator operation.

## Configuration Optimization

For those seeking to optimize their validator's performance, the following configurations can improve responsiveness, reduce latency, and ensure consistent performance during high-demand periods.

### Deactivate Simultaneous Multithreading

Polkadot validators operate primarily in single-threaded mode for critical paths, meaning optimizing for single-core CPU performance can reduce latency and improve stability. Deactivating simultaneous multithreading (SMT) can prevent virtual cores from affecting performance. SMT implementation is called Hyper-Threading on Intel and 2-way SMT on AMD Zen. The following will deactivate every other (vCPU) core:

```bash
for cpunum in $(cat /sys/devices/system/cpu/cpu*/topology/thread_siblings_list | cut -s -d, -f2- | tr ',' '\n' | sort -un)
do
  echo 0 > /sys/devices/system/cpu/cpu$cpunum/online
done
```

To save the changes permanently, add `nosmt=force` as kernel parameter. Edit `/etc/default/grub` and add `nosmt=force` to `GRUB_CMDLINE_LINUX_DEFAULT` variable as follows:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/grub-config-01.js:1:7'
```

After updating the variable, be sure to update GRUB to apply changes:

``` bash
sudo update-grub
```

After the reboot, you should see that half of the cores are offline. To confirm, run:

``` bash
lscpu --extended
```

### Deactivate Automatic NUMA Balancing

Deactivating NUMA (Non-Uniform Memory Access) balancing for multi-CPU setups helps keep processes on the same CPU node, minimizing latency. Run the following command to deactivate NUMA balancing in runtime:

``` bash
sysctl kernel.numa_balancing=0
```

To deactivate NUMA balancing permanently, add `numa_balancing=disable` to GRUB settings:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/grub-config-01.js:9:15'
```

After updating the variable, be sure to update GRUB to apply changes:

``` bash
sudo update-grub
```

Confirm the deactivation by running the following command:

``` bash
sysctl -a | grep 'kernel.numa_balancing'
```

If you successfully deactivated NUMA balancing, the preceding command should return `0`.

### Spectre and Meltdown Mitigations

[Spectre](https://en.wikipedia.org/wiki/Spectre_(security_vulnerability)){target=\_blank} and [Meltdown](https://en.wikipedia.org/wiki/Meltdown_(security_vulnerability)){target=\_blank} are well-known vulnerabilities in modern CPUs that exploit speculative execution to access sensitive data. These vulnerabilities have been patched in recent Linux kernels, but the mitigations can slightly impact performance, especially in high-throughput or containerized environments.

If your security needs allow it, you may selectively deactivate specific mitigations for performance gains. The Spectre V2 and Speculative Store Bypass Disable (SSBD) for Spectre V4 apply to speculative execution and are particularly impactful in containerized environments. Deactivating them can help regain performance if your environment doesn't require these security layers.

To selectively deactivate the Spectre mitigations, update the `GRUB_CMDLINE_LINUX_DEFAULT` variable in your /etc/default/grub configuration:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/operational-tasks/general-management/grub-config-01.js:17:23'
```

After updating the variable, be sure to update GRUB to apply changes and then reboot:

``` bash
sudo update-grub
sudo reboot
```

This approach selectively deactivates the Spectre V2 and Spectre V4 mitigations, leaving other protections intact. For full security, keep mitigations activated unless there's a significant performance need, as disabling them could expose the system to potential attacks on affected CPUs.

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

1. **Download Prometheus** - obtain the respective release binary for your system architecture from the [Prometheus releases page](https://github.com/prometheus/prometheus/releases/){target=\_blank}. Replace the placeholder text with the respective release binary, e.g. `https://github.com/prometheus/prometheus/releases/download/v3.0.0/prometheus-3.0.0.linux-amd64.tar.gz`
    ```bash
    sudo apt-get update && sudo apt-get upgrade
    wget INSERT_RELEASE_DOWNLOAD_LINK
    tar xfz prometheus-*.tar.gz
    cd prometheus-3.0.0.linux-amd64
    ```
2. **Set up Prometheus** - copy binaries and directories, assign ownership of these files to the `prometheus` user, and clean up download directory as follows:

    === "1. Binaries"
        ``` bash 
        sudo cp ./prometheus /usr/local/bin/
        sudo cp ./promtool /usr/local/bin/
        sudo cp ./prometheus /usr/local/bin/
        ```
    === "2. Directories"
        ``` bash 
        sudo cp -r ./consoles /etc/prometheus
        sudo cp -r ./console_libraries /etc/prometheus
        sudo chown -R prometheus:prometheus /etc/prometheus/consoles
        sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
        ```
    === "3. Clean up"
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

Grafana provides a powerful, customizable interface to visualize metrics collected by Prometheus. This guide follows [Grafana's canonical installation instructions](https://grafana.com/docs/grafana/latest/setup-grafana/installation/debian/#install-from-apt-repository){target=\_blank} To install and configure Grafana, follow these steps:

1. Install Grafana prerequisites - run the following commands to install the required packages:
    ```bash
    sudo apt-get install -y apt-transport-https software-properties-common wget    
    ```

2. Import the GPG key:
    ```bash
    sudo mkdir -p /etc/apt/keyrings/
    wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
    ```

3. Configure the stable release repo and update packages:
    ```bash
    echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
    sudo apt-get update

    ```

4. Install the latest stable version of Grafana:
    ```bash
    sudo apt-get install grafana
    ```

After installing Grafana, you can move on to the configuration steps.

1. Set Grafana to auto-start - configure Grafana to start automatically on system boot and start the service
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable grafana-server.service
    sudo systemctl start grafana-server
    ```

2.  Verify the Grafana service is running** with the following command:
    ```bash
    sudo systemctl status grafana-server
    ```
If necessary, you can stop or restart the service with the following commands:

    ```bash
    sudo systemctl stop grafana-server
    sudo systemctl restart grafana-server
    ```
 
3. Access Grafana - open your browser, navigate to the following address, and use the default user and password `admin` to login:
    ```bash
    http://SERVER_IP_ADDRESS:3000/login
    ```

!!! tip "Change default port"
    If you want run Grafana on another port, edit the file `/usr/share/grafana/conf/defaults.ini` with a command like:
    ``` bash
    sudo vim /usr/share/grafana/conf/defaults.ini 
    ```
    You can change the `http_port` value as desired. Then restart Grafana with:
    ``` bash
    sudo systemctl restart grafana-server
    ```

![Grafana login screen](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-1.webp)

Follow these steps to visualize node metrics:

1. Select the gear icon for settings to configure the **Data Sources**
2. Select **Add data source** to define the data source
![Select Prometheus](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-2.webp)
3. Select **Prometheus**
![Save and test](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-3.webp)
4. Enter `http://localhost:9090` in the **URL** field, then select **Save & Test**. If you see the message **"Data source is working"** your connection is configured correctly
![Import dashboard](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-4.webp)
5. Next, select **Import** from the menu bar on the left, select **Prometheus** in the dropdown list and select **Import**
6. Finally, start your Polkadot node by running `./polkadot`. You should now be able to monitor your node's performance such as the current block height, network traffic, and running tasks on the Grafana dashboard
![Live dashboard](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-5.webp)

!!! tip "Import via grafana.com" 
    The [Grafana dashboards](https://grafana.com/grafana/dashboards){target=\_blank} page features user created dashboards made available for public use. Visit ["Substrate Node Metrics"](https://grafana.com/grafana/dashboards/21715-substrate-node-metrics/){target=\_blank} for an example of available dashboards.

### Install and Configure Alertmanager

The optional `Alertmanager` complements Prometheus by handling alerts and notifying users of potential issues. Follow these steps to install and configure `Alertmanager`:

1. Download extract `Alertmanager` - download the latest version from the [Prometheus Alertmanager releases page](https://github.com/prometheus/alertmanager/releases){target=\_blank}. Replace the placeholder text with the respective release binary, e.g. `https://github.com/prometheus/alertmanager/releases/download/v0.28.0-rc.0/alertmanager-0.28.0-rc.0.linux-amd64.tar.gz`
    ```bash
    wget INSERT_RELEASE_DOWNLOAD_LINK
    tar -xvzf alertmanager*
    ```
2. **Move binaries and set permissions** - copy the binaries to a system directory and set appropriate permissions
    ```bash
    cd alertmanager-0.28.0-rc.0.linux-amd64
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

Though they don't transfer funds, session keys are essential for validators as they sign messages related to consensus and parachains. Securing session keys is crucial as allowing them to be exploited or used across multiple nodes can lead to a loss of staked funds via [slashing](/infrastructure/staking-mechanics/offenses-and-slashes/).

Given the current limitations in high-availability setups and the risks associated with double-signing, it’s recommended to run only a single validator instance. Keys should be securely managed, and processes automated to minimize human error.

There are two approaches for generating session keys:

1. **Generate and store in node** - using the `author.rotateKeys` RPC call. For most users, generating keys directly within the client is recommended. You must submit a session certificate from your staking proxy to register new keys. See the [How to Validate](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/) guide for instructions on setting keys

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

## Additional Resources

- [Certus One's Knowledge Base](https://knowledgebase.certus.com/FAQ/){target=\_blank}
- [EOS Block Producer Security List](https://github.com/slowmist/eos-bp-nodes-security-checklist){target=\_blank}
- [HSM Policies and the Importance of Validator Security](https://medium.com/loom-network/hsm-policies-and-the-importance-of-validator-security-ec8a4cc1b6f){target=\_blank}

For additional guidance, connect with other validators and the Polkadot engineering team in the [Polkadot Validator Lounge](https://matrix.to/#/#polkadotvalidatorlounge:web3.foundation){target=\_blank} on Element.

