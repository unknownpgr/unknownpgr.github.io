docker run\
 --rm\
 -it\
 -w /app\
 -v $(pwd)/frontend:/app\
 -v $(pwd)/docs:/app/build\
 node:16\
 yarn build