# This script will build docker image for blog builder, and build blog from blog builder.
DIR="$(dirname -- $0)"
cd $DIR
docker build -t blog .
docker run --rm -v $(pwd)/posts:/posts -v $(pwd)/docs:/out blog