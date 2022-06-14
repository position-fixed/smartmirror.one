FROM node:alpine
WORKDIR /code
COPY . .
ENV NODE_OPTIONS=--no-experimental-fetch
RUN ["apk", "add", "--update", "python3", "make", "g++"]
RUN ["rm", "-rf", "/var/cache/apk/*"]
RUN ["npm", "install"]
RUN ["npm", "run", "build"]
WORKDIR /code/packages/backend
RUN ["npm", "run", "update:dependencies"]
RUN ["npm", "run", "package"]
WORKDIR /code/packages/backend/_bins
RUN ["cp",  "./smartmirror1-linux", "/root"]
WORKDIR /root
RUN ["rm", "-rf", "/code"]
RUN ["chmod", "+x", "./smartmirror1-linux"]
EXPOSE 3000
CMD ["./smartmirror1-linux"]