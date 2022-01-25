IMAGE=unknownpgr/blog
docker run\
  --rm\
  -it\
  -v $(pwd)/posts:/posts\
  -v $(pwd)/docs:/docs\
  $IMAGE