FROM node:15
WORKDIR /app

COPY package.json . 

# else npm install --only=production
#install only prod dependencies and skip installing any dev dependencies(nodemon).
ARG NODE_ENV
RUN if [ "${NODE_ENV}" = "development" ]; \
    then npm install; \
    else npm install --only=production; \   
    fi

COPY . . 
ENV PORT 3000

CMD ["node", "index.js"]

