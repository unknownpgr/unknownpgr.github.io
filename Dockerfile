FROM node:16

RUN apt-get update
RUN apt-get install python -y
RUN curl https://bootstrap.pypa.io/get-pip.py | python3 - 
RUN pip install Pillow

WORKDIR /app
COPY ./backend/package.json /app/
COPY ./backend/yarn.lock /app/
RUN yarn
COPY ./backend /app

ENTRYPOINT [ "node", "blog.js" ]