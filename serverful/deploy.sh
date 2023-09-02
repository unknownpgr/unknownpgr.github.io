cd `dirname $0`

set -e

# Build images
BACKEND_IMAGE=se.ction.link/blog-backend
docker build -t $BACKEND_IMAGE:local backend
FRONTEND_IMAGE=se.ction.link/blog-frontend
docker build -t $FRONTEND_IMAGE:local frontend

# Get image tags
BACKEND_TAG=`echo $(docker inspect --format='{{.Id}}' $BACKEND_IMAGE:local) | md5sum | cut -c1-8`
FRONTEND_TAG=`echo $(docker inspect --format='{{.Id}}' $FRONTEND_IMAGE:local) | md5sum | cut -c1-8`

echo "Backend image tag: $BACKEND_TAG"
echo "Frontend image tag: $FRONTEND_TAG"

# Tag images
docker tag $BACKEND_IMAGE:local $BACKEND_IMAGE:$BACKEND_TAG
docker tag $FRONTEND_IMAGE:local $FRONTEND_IMAGE:$FRONTEND_TAG

export BACKEND_IMAGE=$BACKEND_IMAGE:$BACKEND_TAG
export FRONTEND_IMAGE=$FRONTEND_IMAGE:$FRONTEND_TAG

# Push images
docker push $BACKEND_IMAGE
docker push $FRONTEND_IMAGE

# Deploy
cat kubernetes/resources.yaml | envsubst | kubectl apply -f -
