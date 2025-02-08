#!/bin/bash
docker run --rm -it -u $(id -u) -v $(pwd):/workspace -w /workspace node:22 /bin/bash