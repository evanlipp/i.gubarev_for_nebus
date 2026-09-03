FROM node:22.19.0-alpine

WORKDIR /app
ENV NUXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci && cp package-lock.json node_modules/.package-lock.json

COPY . ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3001
CMD ["sh", "./docker-entrypoint.sh"]
