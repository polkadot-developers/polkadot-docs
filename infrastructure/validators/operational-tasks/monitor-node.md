---
title: Monitor Your Node
description: Set up Prometheus and Grafana to monitor your Polkadot SDK-based node, visualize metrics, and configure alerts for optimal performance and uptime.
---

# Monitor Your Node

## Introduction

Monitoring your node's performance ensures reliability and uptime in Polkadot SDK-based networks. This guide explains how to set up [Prometheus](https://prometheus.io/){target=\_blank} for collecting node metrics and [Grafana](https://grafana.com/){target=\_blank} for visualizing them in real-time. Following these steps, you can gain insights into your node's activity, including block height, peer connections, CPU and memory usage, and more. Additionally, the guide covers alert configurations to notify you about potential issues, allowing you to maintain optimal node performance.

## Prerequisites

Before continuing with this guide, ensure you have the following:

<!--TODO: What goes here? What should I read, install, or be familiar with before I can do the rest of this?-->

## Prepare Environment

Before installing Prometheus, it's important to set up the environment securely by creating a dedicated user account and setting permissions to ensure Prometheus can run without unnecessary access privileges. The following steps outline how to configure Prometheus with restricted user access and the necessary directory setup:

1. Create a user for Prometheus by adding the `--no-create-home` flag to disallow `prometheus` from logging in as follows:
  ``` bash
  sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus
  ```
2. Use the following commands to create directories to store the configuration and executable files:
  ``` bash
  sudo mkdir /etc/prometheus
  sudo mkdir /var/lib/prometheus
  ```
3. Change the ownership of these directories to `prometheus` so that only Prometheus can access them:
  ``` bash
  sudo chown -R prometheus:prometheus /etc/prometheus
  sudo chown -R prometheus:prometheus /var/lib/prometheus
  ```

## Install Prometheus

After preparing the environment, you must update your operating system and install the latest version of Prometheus. You can check the [Prometheus releases page](https://github.com/prometheus/prometheus/releases/){target=\_blank} for the latest version.

Use the following commands to install the latest version of Prometheus:

```bash
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/install-prometheus.md'
```

Within this directory, you will find the following binaries:

- **`prometheus`** - the main binary that runs Prometheus
- **`promtool`** - used for validating and testing configurations

You will also see these directories:

- **`consoles`** - holds web interface templates for displaying data
- **`console_libraries`** - supporting libraries for the consoles

To set up Prometheus:

1. Copy the binaries to the `/usr/local/bin/` directory:
  ``` bash
  sudo cp ./prometheus /usr/local/bin/
  sudo cp ./promtool /usr/local/bin/
  ```
2. Assign ownership of these files to the `prometheus` user:
  ``` bash
  sudo chown prometheus:prometheus /usr/local/bin/prometheus
  sudo chown prometheus:prometheus /usr/local/bin/promtool
  ```
3. Copy the `consoles` and `console_libraries` directories to `/etc/prometheus`:
  ``` bash
  sudo cp -r ./consoles /etc/prometheus
  sudo cp -r ./console_libraries /etc/prometheus
  ```
4. Assign ownership of these directories to the `prometheus` user:
  ``` bash
  sudo chown -R prometheus:prometheus /etc/prometheus/consoles
  sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
  ```
5. After copying all the necessary files, you can clean up the downloaded Prometheus directory:
  ```bash
  cd .. && rm -rf prometheus*
  ```

## Configure Prometheus

To use Prometheus, you need to configure it by creating a YAML configuration file. This file will define how Prometheus scrapes targets and evaluates rules.

Create a file called `prometheus.yml` in `/etc/prometheus/` as follows:
```bash
sudo nano /etc/prometheus/prometheus.yml
```

This file should include the following key sections:

- **`global`** - defines general parameters, such as scrape intervals
- **`rule_files`** - points to rule files Prometheus uses to trigger alerts
- **`scrape_configs`** - lists resources Prometheus will monitor, such as your node

The configuration file should resemble the following:

``` yaml
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/prometheus.yml'
```

In this example, Prometheus is scraped every 5 seconds to ensure detailed internal metrics. Node metrics with customizable intervals are scraped from port `9615` by default.

You can validate the correctness of your configuration using the `promtool` open-source monitoring system:

```bash
promtool check config /etc/prometheus/prometheus.yml
```

Save the configuration file and change the ownership of the file to `prometheus` user:

```bash
sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml
```

## Start Prometheus

Use the following command to launch Prometheus with a given configuration, set the storage location for metric data, and enable web console templates and libraries: 

```bash
sudo -u prometheus /usr/local/bin/prometheus --config.file /etc/prometheus/prometheus.yml --storage.tsdb.path /var/lib/prometheus/ --web.console.templates=/etc/prometheus/consoles --web.console.libraries=/etc/prometheus/console_libraries
```

If you set the server up properly, you should see messages similar to the following:
<!--TODO: this should be run live to get fresh terminal output to add to a styled termynal snippet. These are all dated 2021 -->
```bash
level=info ts=2021-04-16T19:02:20.167Z caller=main.go:380 msg="No time or size retention was set so using the default time retention" duration=15d
level=info ts=2021-04-16T19:02:20.167Z caller=main.go:418 msg="Starting Prometheus" version="(version=2.26.0, branch=HEAD, revision=3cafc58827d1ebd1a67749f88be4218f0bab3d8d)"
level=info ts=2021-04-16T19:02:20.167Z caller=main.go:423 build_context="(go=go1.16.2, user=root@a67cafebe6d0, date=20210331-11:56:23)"
level=info ts=2021-04-16T19:02:20.167Z caller=main.go:424 host_details="(Linux 5.4.0-42-generic #46-Ubuntu SMP Fri Jul 10 00:24:02 UTC 2020 x86_64 ubuntu2004 (none))"
level=info ts=2021-04-16T19:02:20.167Z caller=main.go:425 fd_limits="(soft=1024, hard=1048576)"
level=info ts=2021-04-16T19:02:20.167Z caller=main.go:426 vm_limits="(soft=unlimited, hard=unlimited)"
level=info ts=2021-04-16T19:02:20.169Z caller=web.go:540 component=web msg="Start listening for connections" address=0.0.0.0:9090
level=info ts=2021-04-16T19:02:20.170Z caller=main.go:795 msg="Starting TSDB ..."
level=info ts=2021-04-16T19:02:20.171Z caller=tls_config.go:191 component=web msg="TLS is disabled." http2=false
level=info ts=2021-04-16T19:02:20.174Z caller=head.go:696 component=tsdb msg="Replaying on-disk memory mappable chunks if any"
level=info ts=2021-04-16T19:02:20.175Z caller=head.go:710 component=tsdb msg="On-disk memory mappable chunks replay completed" duration=1.391446ms
level=info ts=2021-04-16T19:02:20.175Z caller=head.go:716 component=tsdb msg="Replaying WAL, this may take a while"
level=info ts=2021-04-16T19:02:20.178Z caller=head.go:768 component=tsdb msg="WAL segment loaded" segment=0 maxSegment=4
level=info ts=2021-04-16T19:02:20.193Z caller=head.go:768 component=tsdb msg="WAL segment loaded" segment=1 maxSegment=4
level=info ts=2021-04-16T19:02:20.221Z caller=head.go:768 component=tsdb msg="WAL segment loaded" segment=2 maxSegment=4
level=info ts=2021-04-16T19:02:20.224Z caller=head.go:768 component=tsdb msg="WAL segment loaded" segment=3 maxSegment=4
level=info ts=2021-04-16T19:02:20.229Z caller=head.go:768 component=tsdb msg="WAL segment loaded" segment=4 maxSegment=4
level=info ts=2021-04-16T19:02:20.229Z caller=head.go:773 component=tsdb msg="WAL replay completed" checkpoint_replay_duration=43.716µs wal_replay_duration=53.973285ms total_replay_duration=55.445308ms
level=info ts=2021-04-16T19:02:20.233Z caller=main.go:815 fs_type=EXT4_SUPER_MAGIC
level=info ts=2021-04-16T19:02:20.233Z caller=main.go:818 msg="TSDB started"
level=info ts=2021-04-16T19:02:20.233Z caller=main.go:944 msg="Loading configuration file" filename=/etc/prometheus/prometheus.yml
level=info ts=2021-04-16T19:02:20.234Z caller=main.go:975 msg="Completed loading of configuration file" filename=/etc/prometheus/prometheus.yml totalDuration=824.115µs remote_storage=3.131µs web_handler=401ns query_engine=1.056µs scrape=236.454µs scrape_sd=45.432µs notify=723ns notify_sd=2.61µs rules=956ns
level=info ts=2021-04-16T19:02:20.234Z caller=main.go:767 msg="Server is ready to receive web requests."

```

Verify you can access the Prometheus interface by visiting the following address:
``` bash
http://SERVER_IP_ADDRESS:9090/graph
```

If the interface appears to work as expected, exit the process using `Control + C`.

Next, create a new `systemd` configuration file to start the server during the boot process automatically:

```bash
sudo nano /etc/systemd/system/prometheus.service
```

Add the following code to the configuration file:

```bash
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/systemd-config.md'
```

Once you save the file, execute the following command to reload `systemd` and enable the service so that it will be loaded automatically during the operating system's startup:

```bash
sudo systemctl daemon-reload && systemctl enable prometheus && systemctl start prometheus
```

Prometheus should be running now, and you should be able to reaccess its frontend by re-visiting:
``` bash
http://SERVER_IP_ADDRESS:9090/
```

## Install Grafana

You can use Grafana to query the Prometheus server and visualize your node metrics. First, run the following commands to install Grafana:

```bash
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_7.5.4_amd64.deb
sudo dpkg -i grafana_7.5.4_amd64.deb
```

If everything is fine, configure Grafana to auto-start on boot and then start the service.

```bash
sudo systemctl daemon-reload
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

You can now access it by going to the `http://SERVER_IP_ADDRESS:3000/login`. The default user and password are `admin`.

??? tip "Change default port"
    If you want run Garana on another port, edit the file `/usr/share/grafana/conf/defaults.ini` with a command like:
    ``` bash
    sudo vim /usr/share/grafana/conf/defaults.ini 
    ```
    and change the `http_port` value as desired. Then restart Grafana with:
    ``` bash
    sudo systemctl restart grafana-server
    ```


![1-grafana-login](/images/infrastructure/validator/operational-tasks/1-grafana-login.webp)

1. To visualize the node metrics, select the gear icon for settings to configure the **Data Sources** first
![2-add-data-source](/images/infrastructure/validator/operational-tasks/2-add-data-source.webp)
2. Select **Add data source** to choose where the source for the data.
![2-add-data-source-2](/images/infrastructure/validator/operational-tasks/2-add-data-source-2.webp)
3. Select **Prometheus**
![3-select-prometheus](/images/infrastructure/validator/operational-tasks/3-select-prometheus.webp)
4. The only thing you need to input is the `URL` that is `https://localhost:9090` and then select
`Save & Test`. If you see `Data source is working`, your connection is configured correctly
![4-configure-data-source](/images/infrastructure/validator/operational-tasks/4-configure-data-source.webp)
5. Next, select **Import** from the menu bar on the left to import the dashboard used to visualize your node data 
??? tip "Import via grafana.com" 
    This tool allows you to use a dashboard that another user created and made public. You can visit the [Grafana dashboards](https://grafana.com/grafana/dashboards){target=\_blank} page to see other available dashboards. For example, select the ["Substrate Node Metrics"](https://grafana.com/grafana/dashboards/21715-substrate-node-metrics/) dashboard and input "21715" under the `id` field and select **Load**
![5-import-dashboard](/images/infrastructure/validator/operational-tasks/5-import-dashboard.webp)
6. Once the dashboard is loaded, select **Prometheus** in the Prometheus dropdown list and select **Import**
![5-import-dashboard-2](/images/infrastructure/validator/operational-tasks/5-import-dashboard-2.webp)
7. In the meantime, start your Polkadot node by running `./polkadot`. You should now be able to monitor your node's performance such as the current block height, network traffic, and running tasks on the Grafana dashboard
![6-dashboard-metric](/images/infrastructure/validator/operational-tasks/6-dashboard-metric.webp)

## Install and Configure Optional `Alertmanager`

You can also configure the optional `Alertmanager` to help predict potential problems or notify you of an active problem with your server. You can receive alerts via Slack, email, and Matrix among other messaging services. You can configure email notifications to alert you if your node goes down. The following sections cover how to install and configure the `AlertManager`.

First, download the latest binary of `AlertManager` and unzip it by running the following command:
```bash
--8<-- 'code/infrastructure/validators/operational-tasks/monitor-node/unzip-alert-manager.md'
```

### Setup Gmail

To use Gmail, you must generate an `app password` in your Gmail account to allow `AlertManager` to send you alert notification emails. Visit Google support for more details on setting up your [`app password`](https://support.google.com/accounts/answer/185833?hl=en){target=\_blank}. 

Once you complete the setup, you should see something like the following:

![grafana-am-1](/images/infrastructure/validator/operational-tasks/1-alert-manager.webp)

Be sure to backup this password in a secure location.

### Configure AlertManager

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

### Integrate AlertManager

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