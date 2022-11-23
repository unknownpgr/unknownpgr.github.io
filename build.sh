DIR="$(dirname -- $0)"
cd $DIR
docker build -t blog .
docker run --rm -v $(pwd)/posts:/posts -v $(pwd)/docs:/out blog
