FROM adas-img.nioint.com/aa-map/ubuntu-nginx-cmake-18-dept:1.0
RUN mkdir -p /nmap/app/html/static
RUN mkdir -p /nmap/app/html/data
RUN mkdir -p /nmap/app/nginxConfig
RUN mkdir -p /nmap/app/bin
RUN mkdir -p /usr/share/nginx/log
COPY ./dist/ /nmap/app/html/
EXPOSE 80
COPY ./nio/nginxConfig/ /nmap/app/nginxConfig/
COPY ./nio/bin/ /nmap/app/bin/
COPY ./build/config_dev.js /nmap/app/html/static/
COPY build/config_test.js /nmap/app/html/static/
COPY ./build/config_prod.js /nmap/app/html/static/
RUN chmod 777 /nmap/app/bin/start.sh
CMD ["/nmap/app/bin/start.sh"]
