#!/bin/bash
# Run NGINX for static content
docker run --rm -it -v `pwd`/output:/usr/share/nginx/html:ro -p 80:80 nginx