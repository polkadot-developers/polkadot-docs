```apacheconf
# (...)
SSLProxyEngine on
ProxyRequests off
ProxyPass / ws://localhost:9944
ProxyPassReverse / ws://localhost:9944
```