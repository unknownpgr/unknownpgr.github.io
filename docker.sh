cd "$(dirname "$0")"
docker run --rm -it -v /$PWD:/app -w /app node:14 /bin/bash