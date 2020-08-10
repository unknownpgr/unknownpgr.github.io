# Clean blog
./blog_clean.sh
# Compile typescript
yarn run tsc -p ./libs/tsconfig.json
# Update blog
node ./libs/blog.js