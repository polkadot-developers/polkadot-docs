---
title: Set Up Secure WebSocket
description: Instructions on enabling SSL for your node and setting up a secure WebSocket proxy server using nginx for remote connections.
categories: Infrastructure
url: https://docs.polkadot.com/infrastructure/running-a-node/setup-secure-wss/
---

# Set Up Secure WebSocket

## Introduction

Ensuring secure WebSocket communication is crucial for maintaining the integrity and security of a Polkadot or Kusama node when interacting with remote clients. This guide walks you through setting up a secure WebSocket (WSS) connection for your node by leveraging SSL encryption with popular web server proxies like nginx or Apache.

By the end of this guide, you'll be able to secure your node's WebSocket port, enabling safe remote connections without exposing your node to unnecessary risks. The instructions in this guide are for UNIX-based systems.

## Secure a WebSocket Port

You can convert a non-secured WebSocket port to a secure WSS port by placing it behind an SSL-enabled proxy. This approach can be used to secure a bootnode or RPC server. The SSL-enabled apache2/nginx/other proxy server redirects requests to the internal WebSocket and converts it to a secure (WSS) connection. You can use a service like [LetsEncrypt](https://letsencrypt.org/){target=\_blank} to obtain an SSL certificate.

### Obtain an SSL Certificate

LetsEncrypt suggests using the [Certbot ACME client](https://letsencrypt.org/getting-started/#with-shell-access/){target=\_blank} for your respective web server implementation to get a free SSL certificate:

- [nginx](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal){target=\_blank}
- [apache2](https://certbot.eff.org/instructions?ws=apache&os=ubuntufocal){target=\_blank}
 
LetsEncrypt will auto-generate an SSL certificate and include it in your configuration.

When connecting, you can generate a self-signed certificate and rely on your node's raw IP address. However, self-signed certificates aren't optimal because you must include the certificate in an allowlist to access it from a browser.

Use the following command to generate a self-signed certificate using OpenSSL:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/selfsigned.key -out /etc/ssl/certs/selfsigned.crt
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

## Install a Proxy Server

There are a lot of different implementations of a WebSocket proxy; some of the more widely used are [nginx](https://www.f5.com/go/product/welcome-to-nginx){target=\_blank} and [apache2](https://httpd.apache.org/){target=\_blank}, both of which are commonly used web server implementations. See the following section for configuration examples for both implementations.

### Use nginx

1. Install the `nginx` web server: 
    ```bash
    apt install nginx
    ```

2. In an SSL-enabled virtual host, add:
    ```conf
server {
    (...)
    location / {
    proxy_buffers 16 4k;
    proxy_buffer_size 2k;
    proxy_pass http://localhost:9944;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    }
}
```

3. Optionally, you can introduce some form of rate limiting:
    ```conf
http {
    limit_req_zone  "$http_x_forwarded_for" zone=zone:10m rate=2r/s;
    (...)
}
location / {
    limit_req zone=zone burst=5;
    (...)
}
```

### Use Apache2

Apache2 can run in various modes, including `prefork`, `worker`, and `event`. In this example, the [`event`](https://httpd.apache.org/docs/2.4/mod/event.html){target=\_blank} mode is recommended for handling higher traffic loads, as it is optimized for performance in such environments. However, depending on the specific requirements of your setup, other modes like `prefork` or `worker` may also be appropriate.

1. Install the `apache2` web server:
    ```bash
apt install apache2
a2dismod mpm_prefork
a2enmod mpm_event proxy proxy_html proxy_http proxy_wstunnel rewrite ssl
```

2. The [`mod_proxy_wstunnel`](https://httpd.apache.org/docs/2.4/mod/mod_proxy_wstunnel.html){target=\_blank} provides support for the tunneling of WebSocket connections to a backend WebSocket server. The connection is automatically upgraded to a WebSocket connection. In an SSL-enabled virtual host add:

    ```apacheconf
# (...)
SSLProxyEngine on
ProxyRequests off
ProxyPass / ws://localhost:9944
ProxyPassReverse / ws://localhost:9944
```

    !!!warning 
        Older versions of `mod_proxy_wstunnel` don't upgrade the connection automatically and will need the following config added:
        ```apacheconf
        RewriteEngine on
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteRule /(.*) ws://localhost:9944/$1 [P,L]
        RewriteRule /(.*) http://localhost:9944/$1 [P,L]
        ```

3. Optionally, some form of rate limiting can be introduced by first running the following command:

    ```bash
    apt install libapache2-mod-qos
    a2enmod qos
    ```

    Then edit `/etc/apache2/mods-available/qos.conf` as follows:

    ```conf
    # allows max 50 connections from a single IP address:
    QS_SrvMaxConnPerIP                                 50
    ```

## Connect to the Node

1. Open [Polkadot.js Apps interface](https://polkadot.js.org/apps){target=\_blank} and click the logo in the top left to switch the node.
2. Activate the **Development** toggle and input either your node's domain or IP address. Remember to prefix with `wss://` and, if you're using the 443 port, append `:443` as follows:

    ```bash
    wss://example.com:443
    ```

![A sync-in-progress chain connected to Polkadot.js UI](/images/infrastructure/running-a-validator/running-a-node/setup-secure-wss/setup-secure-wss-1.webp)
