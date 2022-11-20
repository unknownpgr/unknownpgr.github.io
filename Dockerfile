FROM node:16

RUN apt-get update
RUN apt-get install python -y
RUN curl https://bootstrap.pypa.io/get-pip.py | python3 - 
RUN pip install Pillow

WORKDIR /app

# Install packages first, to maximize cache usage.
COPY src/package.json ./
COPY src/yarn.lock ./
RUN yarn

# Copy other soruces
COPY src .
RUN chmod 700 init.sh

ENTRYPOINT [ "/bin/bash", "init.sh" ]