- port mapping: the outside devices cannot reach out the container bec it's isolated
EXPOSE has no meaning here.

-p x:y
x => the port the receives the outside traffic on. ايدي الشمال
y => the port the container(app) listen on and we want to direct the traffic to. ايدي اليمين

****************************************************************

- persistent volumens (bind mount): sync the code changing and the dockerfile .
 -v pathtothelocation:pathrothecontainer.
 $(pwd) = the current location of the project

****************************************************

- the code didnt change bec in node.js we need to restart the node process when any changes done to the source code
solution => nodemon , dockerfile => npm run dev
***********************************************************

- what if u delete the node_modules from the local and this deletion is synced with the container.
  [COPY package.json . 
  RUN npm install]
  these 2 lines generate node_modules
  but bec of [ COPY . . ] which copy from the local to the dockerfile 
  this will override the result of the previous 2 lines, so node_modules will be deleted bec it doesn't existed on the local while the copying process.

 sudo docker run -v $(pwd):/app -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image
 
 -v /app/node_modules: Anonymous volume which prevents the bind mount from deleting this volume
 *******************************************************

- read-only containers: to prevent the container from changing the local 
 i.e when you create a file inside the container, it will also be created on the local so to prevent this use read-only containers.
  
 sudo docker run -v $(pwd):/app:ro -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image
 ***************************************************

 - ENV PORT 3000: 3000 is the default value of PORT
***********************************************

##################
# DOCKER-COMPOSE: #
##################

instead of writing  a long command contains all the properties u want to specify, determine these proberties in docker-compose file and run a short simple command.

- naming convention 
projectName_serviceName => node_express_node-app

- when u change the image content this doesn't reflect on the docker compose up 
bec, it doesn't know that the existing image is stale and there is an update so, u must force rebuild the image

docker-compose -d up --build


dev, prod environment:
----------------------



