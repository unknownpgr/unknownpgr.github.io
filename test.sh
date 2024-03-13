#!/bin/bash
docker run --rm -it -v `pwd`/output:/usr/share/nginx/html:ro -p 8000:80 nginx