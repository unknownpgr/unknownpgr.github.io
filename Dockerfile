FROM node:16

RUN apt-get update
RUN apt-get install python -y
RUN curl https://bootstrap.pypa.io/get-pip.py | python3 - 
RUN pip install Pillow

WORKDIR /app
COPY ./backend /app
RUN yarn

ENTRYPOINT [ "node", "blog.js" ]