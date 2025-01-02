#!/bin/bash
#mv /nmap/app/html/static/config_${appenv}.js /nmap/app/html/config.js -f
nginx -c /nmap/app/nginxConfig/nginx.conf
sleep infinity
