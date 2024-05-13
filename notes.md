- port mapping: the outside devices cannot reach out the container bec it's isolated
EXPOSE has no meaning here.

-p x:y
x => the port the receives the outside traffic on. ايدي الشمال
y => the port the container(app) listen on and we want to direct the traffic to. ايدي اليمين

****************************************************************

- persistent volumens (bind mount): sync the code changing and the dockerfile .
 -v path_to_folder_on_localmachine:path_to_folder_on_the_container.
 $(pwd) = the current location of the project

-v  $(pwd):/app
****************************************************

- the code changes aren't updated  on the browser although we bind mout bec in node.js we need to restart the node process when any changes done to the source code
solution => nodemon , dockerfile => npm run dev
nodemon: nodemon is a tool that monitors changes in your code and automatically restarts the server when changes are detected, making it very useful during development.

in package.json
"scripts":{
  "start" : "node index.js",
  "dev" : "nodemon index.js"
}
in dockerfile
CMD ["npm", "run", "dev"]
***********************************************************

- what if u delete the node_modules from the local and this deletion is synced with the container.
  [COPY package.json . 
  RUN npm install]
  these 2 lines generate node_modules
  but bec of [ -v $(pwd):/app ]  which syncs the local with the inside container, this will override the result of the previous 2 lines and overwriting the /app in the container, so node_modules will be deleted bec it doesn't exist on the local while the syncronization process.
  i.e: not on the local -> not in the container. 

 sudo docker run -v $(pwd):/app -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image
 
 -v /app/node_modules: Anonymous volume which prevents the bind mount from deleting node_modules folder
 *******************************************************

- read-only containers: to prevent the container from changing the local 
 i.e when you create a file inside the container, it will also be created on the local so to prevent this use read-only containers.
  
 sudo docker run -v $(pwd):/app:ro -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image
 ***************************************************

 - ENV PORT 3000: 3000 is the default value of PORT value
 - in the command --env PORT val
 -                -e PORT val
 - making file .env
 - in the command --env-file path
  
***********************************************

docker rm node-app -fv
to force delete all the associated volumes with the coontainer node-app
***********************************************
##################
# DOCKER-COMPOSE: #
##################

instead of writing  a long command contains all the properties u want to specify, determine these properties in docker-compose file and run a short simple command.

- naming convention 
projectName_serviceName => node_express_node-app

- when u change the image content this doesn't reflect on the docker compose up 
bec, it just looks for an image with projectName_serviceName and when it finds it, it will not rebuild. it doesn't know that the existing image is stale and there is an update so, u must force rebuild the image.

docker-compose -d up --build


dev, prod environment:
----------------------
docker-compose.yaml: just for the common properties both dev and prod share.

we changed dockerfile cmd => node index.js for production.
                             npm run dev for devolpement bec, it reflects the code changes which is not accepted for the prod.
 - command in both dev and prod will override CMD in dockerfile.
  
* sudo docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up  -d --build : bec any changes in the code we must rebuild the image to update the changes bec no nodemon is installed in the prod.

* sudo docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up  -d: no --build bec there is nodemon istalled in dev which will update the changes.

* sudo docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml down  -v
* 
* sudo docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml down  -v
  
* NODE_ENV an env var to be used in the dockerfile in conditional statement 
  to decide which docker-compose to be run instead of the specifying it in the command.

- In a Docker Compose file for deploying a Node.js application, the NODE_ENV variable in the environment section serves a similar purpose to how it's used in a traditional Node.js application.

Environment-specific Configuration: Node.js applications often have different configurations for different environments such as development, staging, and production. The NODE_ENV variable helps determine which configuration settings to use based on the environment. For example, you might have different database connection strings, logging levels, or error handling mechanisms for different environments.
Default Environment: If the NODE_ENV variable is not explicitly set, Node.js defaults it to "development". However, when deploying a Node.js application, you typically want to set it explicitly to "production" or "staging" to ensure that the application behaves consistently across different environments and uses the appropriate configuration.
------------------------------------
npm install --only=production

- npm install --only=production is used to install only the dependencies required for running a Node.js application in a "production" environment.

- When you run npm install without any flags, it installs both "dependencies" and "devDependencies" listed in the package.json file of your Node.js project [   "devDependencies": {
    "nodemon": "^3.0.1"} ].

- "dependencies" typically include modules required for the application to function in a production environment, while "devDependencies" include modules used for development purposes such as testing, linting, or building the application.

However, when deploying a Node.js application in a production environment, you usually don't need the development dependencies. Installing only production dependencies helps reduce the size of the Docker image and improves security by minimizing the attack surface.

- npm install: This command installs dependencies listed in package.json file, including both "dependencies" and "devDependencies" by default.
- --only=production: This flag instructs npm to only install "dependencies" and skip "devDependencies".
------------------------------

` {
   "scripts": {
    "start": "node index.js", //will run in prod 
    "dev":  "nodemon index.js" // will run in dev 
  },

 "devDependencies": {
    "nodemon": "^3.0.1"
  }
} `

in docker-compose dev: command: ["npm", "run", "dev"]
in docker-compose prod:  command: ["node", "index.js"]


- `start` : This script starts the application in a production environment using node index.js.
- `dev` : This script starts the application in a development environment using nodemon index.js. 
- [ npm run dev ] , it executes nodemon index.js (or whatever command is defined for the "dev" script).

------------------------------
********************************
*           mogodb             *
********************************
using mongo for the first time using docker-compose:

create the initial user (root/admin) for the very first time:

1. in base docker-compose:

- add command: [--auth], without it u will not be able to log in with authentication and get an error.
- add env vars: that will create the initial user credentials:
  MONGO_INITDB_ROOT_USERNAME=xxx
  MONGO_INITDB_ROOT_PASSWORD=yyy

2. from the os shell:
execute the following command otherwise u will get missing semicolon error if u attempt to do it inside mongosh:
 ` sudo docker exec -it node_express_mongo_1 mongosh  -u "xxx" -p "yyy" `

---------------------------------------------------------------

* to save what was done in the db, u must use volume mouting (bind a volume on the localhost to the desired path inside the container of the db):

we will eeclare a named anonymous volume. 
` volumes:     #inline with services
    mongo-db: 
`

inside mongo service we bind the anonymous volume with the desired path that stores the db. from mongo documentation the db stored in /data/db

` mongo:      
  - volumes:
   - mongo-db:/data/db ` 

* when u down the container u have to omit -v option because it will delete the volume which contains the db data, u will lose the db u made and its data.

` sudo docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml down`
---------------------------------------------------------------------

*************************************************
*         Express container                     *
*************************************************

1. down the current container.
2. npm install mongoos
3. up a new container (--build).
4. in index.js:
   - import express.
   - mongoose
      .connect("mongodb://root:xxx@mongo:27017/?authSource=admin")
      .then(() => console.log("successfully connected to db"))
      .catch((e) => console.log(e));
                     ("mongobd://username:password@ip-address:mongo_port/?authSource=admin")
     ip-address: service name in docker-compose = mongodb
     in docker network inspect node_express_node-app_1, there is ip address of the mongo container but it's ephemeral (its ip changes when it's down and up again) and i have to change the ip address everytime. so it's perferable to use the service name in docker-compose.

     after creating the config folder, replace "" with `` although u will get mongoruntimeerror and will not parse the env vars.
    .connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`)

- in docker-compose-dev:
put the env vars of mongo in the node-app service bec they belong to the app.
u will pass their vals in the docker-compose-dev to fill in the env var in the config folder.

********************************************
*              Bootup order                *
********************************************

- there are some potential issues here where we dont know which container will be up first node-app or mon, and if the node-app goes up first it will try to connect to mongodb through the env vars we added, ofcourse it will crash bec  mongodb container didn't go up.
so, 
we will use [ depend_on ] feature in the docker-compose to make the node-app depends on the mongodb container which means mongodb container will go up first then node-app container.

BUT,

this also will not guarantee that the mongo container will go up first. this something u should handle in ur logic of ur app not with docker or the orchestration tool.
------------------------------------------------
****************************************
*             CRUD app                 *
****************************************



 