FROM adas-img.nioint.com/aa-map/ubuntu-nginx-cmake:18
RUN mkdir -p /nmap/app/html/static
RUN mkdir -p /nmap/app/nginxConfig
RUN mkdir -p /nmap/app/bin
RUN mkdir -p /usr/share/nginx/log
COPY ./html/ /nmap/app/html/
EXPOSE 80
COPY ./works/nginxConfig/ /nmap/app/nginxConfig/
COPY ./works/shells/ /nmap/app/bin/

RUN chmod 777 /nmap/app/bin/start.sh
CMD ["/nmap/app/bin/start.sh"]
