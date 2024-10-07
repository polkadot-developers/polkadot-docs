---
title: Setup Secure WebSocket
description: Instructions on enabling SSL for your node and setting up a secure web socket proxy server using nginx for remote connections.
---


## Secure a WebSocket Port

A non-secure websocket port can be converted to a secure WSS port by placing it behind an SSL-enabled proxy. This can be used to secure a bootnode or secure a RPC server. The SSL-enabled apache2/nginx/other proxy server redirects requests to the internal websocket and converts it to a secure (WSS) connection. For this, you will need an SSL certificate for which you can use a service like  [LetsEncrypt](https://letsencrypt.org/){target=_blank}.

### Obtaining an SSL Certificate

One easy way to get a free SSL certificate can be achieved by following the LetsEncrypt instructions for your respective web server implementation:

-  [nginx](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal){target=_blank}
-  [apache2](https://certbot.eff.org/instructions?ws=apache&os=ubuntufocal){target=_blank}. 
 
This will auto-generate an SSL certificate and include it in your configuration.

Alternatively, you can generate a self-signed certificate and rely on the raw IP address of your node when connecting to it. This isn't preferable since you will have to whitelist the certificate to access it from a browser.

The below command utilizes OpenSSL to generate a self-signed certificate:

--8<-- 'code/infrastructure/general/install-openssl.md'

## Installing a Proxy Server

There are a lot of different implementations of a websocket proxy, some of the more widely used are [nginx](https://www.nginx.com/){target=_blank} and [apache2](https://httpd.apache.org/){target=_blank}, both of which are commonly used web server implementations. Configuration examples for both are provided below.

### NGINX

1. Install the `nginx` web server: 
    ```bash
    apt install nginx
    ```

2. In an SSL-enabled virtual host add:
    --8<-- 'code/infrastructure/general/nginx-config.md'

3. Optionally some form of rate limiting can be introduced:
    --8<-- 'code/infrastructure/general/nginx-rate-limit.md'

### Apache2

You can run it in different modes such as `prefork`, `worker`, or `event`. In this example, the [`event`](https://httpd.apache.org/docs/2.4/mod/event.html){target=_blank} works well on higher load environments, but other modes are also useful depending on the requirements.

1. Install the `apache2` web server:
    --8<-- 'code/infrastructure/general/install-apache2.md'

2. The [`mod_proxy_wstunnel`](https://httpd.apache.org/docs/2.4/mod/mod_proxy_wstunnel.html){target=_blank} provides support for the tunneling of web socket connections to a backend websocket server. The connection is automatically upgraded to a websocket connection. In an SSL-enabled `virtualhost` add:
    --8<-- 'code/infrastructure/general/apache2-config.md'

    !!!warning "Older versions of `mod_proxy_wstunnel` don't upgrade the connection automatically and will need the following config added:"
        ```apacheconf
        RewriteEngine on
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteRule /(.*) ws://localhost:9944/$1 [P,L]
        RewriteRule /(.*) http://localhost:9944/$1 [P,L]
        ```

3. Optionally some form of rate limiting can be introduced:

    ```bash
    apt install libapache2-mod-qos
    a2enmod qos
    ```

    And edit `/etc/apache2/mods-available/qos.conf`

    ```conf
    # allows max 50 connections from a single ip address:
    QS_SrvMaxConnPerIP                                 50
    ```

## Connecting to the Node

Open [Polkadot.js Apps interfacae](https://polkadot.js.org/apps){target=_blank} and click the logo in the top left to switch the
node. Activate the "Development" toggle and input your node's address - either the domain or the IP
address. Remember to prefix with `wss://` and if you're using the 443 port, append `:443`, like so:
`wss://example.com:443`.

![A sync-in-progress chain connected to Polkadot-JS UI](/images/infrastructure/general/maintain-wss.webp)