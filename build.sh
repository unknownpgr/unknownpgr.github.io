# This script will build docker image for blog builder, and build blog from blog builder.
set -e

# Get sudo permission
sudo echo "Get sudo permission"

ROOT="$(dirname -- $0)"
cd $ROOT

sudo rm -rf src/.cache
sudo rm -rf docs

docker build -t blog .
docker run --rm -it -v $(pwd)/posts:/posts -v $(pwd)/docs:/out blog

sudo chown -R $(id -u):$(id -g) docs

touch docs/.nojekyll

git add docs/*