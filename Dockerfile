FROM node:16

RUN apt-get update
RUN apt-get install python -y
RUN curl https://bootstrap.pypa.io/get-pip.py | python3 - 
RUN pip install Pillow

COPY src /app
WORKDIR /app
RUN chmod 700 init.sh
RUN yarn

ENTRYPOINT [ "/bin/bash", "init.sh" ]