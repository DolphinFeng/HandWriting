FROM adas-img.nioint.com/aa-map/ubuntu-nginx-cmake:18
RUN mkdir -p /nmap/app/html/static
RUN mkdir -p /nmap/app/nginxConfig
RUN mkdir -p /nmap/app/bin
RUN mkdir -p /usr/share/nginx/log
COPY ./dist/ /nmap/app/html/
EXPOSE 80
COPY ./nio/nginxConfig/ /nmap/app/nginxConfig/
COPY ./nio/bin/ /nmap/app/bin/
COPY ./build/config_nio_dev.js /nmap/app/html/static/
COPY ./build/config_nio_test.js /nmap/app/html/static/
COPY ./build/config_idc-prod.js /nmap/app/html/static/
COPY ./build/config_poc.js /nmap/app/html/static/
COPY ./build/config_prod.js /nmap/app/html/static/
COPY ./build/config_stg.js /nmap/app/html/static/
#RUN rm /nmap/app/html/static/config.js
#RUN mv /nmap/app/html/static/config_nio_test.js /nmap/app/html/static/config.js
RUN chmod 777 /nmap/app/bin/start.sh
CMD ["/nmap/app/bin/start.sh"]
