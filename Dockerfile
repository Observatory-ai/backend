FROM node:alpine AS development
WORKDIR /observatory
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /observatory
COPY package*.json ./
RUN npm install --only=production
COPY . .
COPY --from=development /observatory/dist ./dist
CMD ["npm", "run", "start:prod"]