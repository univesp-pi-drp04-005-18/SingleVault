FROM node:16-alpine

WORKDIR /app

COPY package.json ./

COPY package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# # Etapa 1: Build
# FROM node:16-alpine AS builder
# WORKDIR /app

# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install


# RUN npm run build

# # Etapa 2: Servir com NGINX
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html

# EXPOSE 3000
# CMD ["nginx", "-g", "daemon off;"]

