# FROM node:21-alpine as BUILD_IMAGE

# WORKDIR /app

# # copy package.json
# COPY package.json .

# # install all our packages
# RUN npm install

# # copy all our remaining files
# COPY . .

# # finally build our project
# CMD npm run build

# # here we are implementing the multi-stage build. It greatly reduces
# # our size, it also won't expose our code in our container as we will
# # only copy the build output from the first stage

# FROM node:21-alpine as PRODUCTION_IMAGE
# WORKDIR /app

# # here, we are copyuing /app/dist folder from BUILD_IMAGE to
# # /app/dist in this stage

# # why dist foler???
# # when we run npm build, vite will generate dist directory that
# # contains our build files
# COPY --from=BUILD_IMAGE /app/dist/ /app/dist/
# EXPOSE 5173

# # to run npm commands as: npm run preview
# # we need package.json
# COPY package.json .

# COPY vite.config.ts .
# # we also need typescript as this project is based on typescript
# RUN npm install typescript

# EXPOSE 5173
# CMD ["npm", "run", "preview"]

FROM node:21-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD [ "npm", "run", "preview" ]