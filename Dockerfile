FROM node:22.19.0-alpine

WORKDIR /app
ENV NUXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
EXPOSE 3001
CMD ["npm", "run", "dev:docker"]
