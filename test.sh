#!/bin/bash
docker run --rm -it -v `pwd`/output:/usr/share/nginx/html:ro -p 80:80 nginx