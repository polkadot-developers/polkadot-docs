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