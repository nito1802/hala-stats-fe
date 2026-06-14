FROM node:22-alpine AS build
WORKDIR /app

ARG NPM_TOKEN

COPY package*.json ./
COPY .npmrc ./

RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hala-stats-fe/browser /usr/share/nginx/html

EXPOSE 80