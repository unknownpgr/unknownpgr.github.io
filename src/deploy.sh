cd `dirname $0`

set -e
shopt -s expand_aliases
alias build='curl -sSL l.ist.sh/b | node - build'

# Build images
echo "Building images..."
export BACKEND_IMAGE=`build backend se.ction.link/blog-backend`
export FRONTEND_IMAGE=`build frontend se.ction.link/blog-frontend`

# Deploy
cat kubernetes/resources.yaml | envsubst | kubectl apply -f -

echo "Done!"