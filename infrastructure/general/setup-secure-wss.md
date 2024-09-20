---
title: Setup Secure WebSocket
description: Instructions on setting up a secure socket for remote connections.
---

<!-- TODO: link relevant guides (bootnode, rpc) -->

## Secure a WebSocket Port

A non-secure websocket port can be converted to a secure WSS port by placing it behind an SSL-enabled proxy. This can be used to secure a bootnode or secure a RPC server. The SSL-enabled apache2/nginx/other proxy server redirects requests to the internal websocket and converts it to a secure (WSS) connection. For this, you will need an SSL certificate for which you can use a service like LetsEncrypt or self-signing.

### Obtaining an SSL Certificate

One easy way to get a free SSL certificate can be achieved by following the LetsEncrypt instructions
([nginx](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal){target=_blank}/[apache](https://certbot.eff.org/instructions?ws=apache&os=ubuntufocal){target=_blank}).
This will auto-generate an SSL certificate and include it in your configuration.

Alternatively, you can generate a self-signed certificate and rely on the raw IP address of your
node when connecting to it. This isn't preferable since you will have to whitelist the certificate
to access it from a browser.

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/selfsigned.key -out /etc/ssl/certs/selfsigned.crt
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

## Installing a Proxy Server

There are a lot of different implementations of a websocket proxy, some of the more widely used are
[nginx](https://www.nginx.com/){target=_blank} and [apache2](https://httpd.apache.org/){target=_blank}, for which configuration
examples provided below.

### NGINX

```bash
apt install nginx
```

In an SSL-enabled virtual host add:

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

Optionally some form of rate limiting can be introduced:

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

### Apache2

You can run it in different modes such as `prefork`, `worker`, or `event`. In this example, the
[`event`](https://httpd.apache.org/docs/2.4/mod/event.html){target=_blank} works well on higher load
environments, but other modes are also useful depending on the requirements.

```bash
apt install apache2
a2dismod mpm_prefork
a2enmod mpm_event proxy proxy_html proxy_http proxy_wstunnel rewrite ssl
```

The [`mod_proxy_wstunnel`](https://httpd.apache.org/docs/2.4/mod/mod_proxy_wstunnel.html){target=_blank} provides support for the tunneling of web socket connections to a backend websocket server. The connection is automatically upgraded to a websocket connection. In an SSL-enabled `virtualhost` add:

```apacheconf
(...)
SSLProxyEngine on
ProxyRequests off

ProxyPass / ws://localhost:9944
ProxyPassReverse / ws://localhost:9944
```

Older versions of `mod_proxy_wstunnel` don't upgrade the connection automatically and will need the
following config added:

```apacheconf
RewriteEngine on
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteRule /(.*) ws://localhost:9944/$1 [P,L]
RewriteRule /(.*) http://localhost:9944/$1 [P,L]
```

Optionally some form of rate limiting can be introduced:

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

Open [Polkadot-JS UI](https://polkadot.js.org/apps){target=_blank} and click the logo in the top left to switch the
node. Activate the "Development" toggle and input your node's address - either the domain or the IP
address. Remember to prefix with `wss://` and if you're using the 443 port, append `:443`, like so:
`wss://example.com:443`.

![A sync-in-progress chain connected to Polkadot-JS UI](/images/infrastructure/general/maintain-wss-image.webp)