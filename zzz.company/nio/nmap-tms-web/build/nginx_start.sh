#!/bin/bash
sudo rm /dist/static/config.js  \
&& sudo cp /build/config_${appenv}.js /dist/static/  \
&& sudo mv /dist/static/config_${appenv}.js /dist/static/config.js  \
&& sudo nginx -c /build/nginx.conf
