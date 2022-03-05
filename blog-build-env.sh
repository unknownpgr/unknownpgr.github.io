set -e
IMAGE=unknownpgr/blog
docker build -t $IMAGE .
docker push $IMAGE