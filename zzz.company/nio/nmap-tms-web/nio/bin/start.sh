#!/bin/bash
#killall -9 nginx ;
#sed -i "s/\(group = .*$\)/group = \"${env}\"/g" /app/tke/rainbow/conf.d/nginx.toml &&
#chmod +x /app/tke/rainbow/rainbow_confd ;
#/app/tke/rainbow/rainbow_confd -onetime -conf_file=/app/tke/rainbow/config.toml ;
#rm /nmap/app/html/static/config.js  \
mv /nmap/app/html/static/config_${appenv}.js /nmap/app/html/static/config.js  \
&& nginx -c /nmap/app/nginxConfig/nginx.conf ;
#nohup /app/tke/rainbow/rainbow_confd -conf_file=/app/tke/rainbow/config.toml >/dev/null 2>&1 &
sleep infinity
