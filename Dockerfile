FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY client/package*.json client/
RUN npm run install-client --omit=dev

COPY server/package*.json server/
RUN npm run install-server --omit=dev

COPY client/ client/
COPY server/ server/

RUN npm run build --prefix client


USER node

CMD ["npm", "start", "--prefix" , "server"]

EXPOSE 8000