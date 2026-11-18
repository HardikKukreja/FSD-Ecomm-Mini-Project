FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# mongodb-memory-server needs to download its binary on first start
# Allow it to write to this directory
ENV MONGOMS_DOWNLOAD_DIR=/app/.mongodb-binaries
ENV MONGOMS_PREFER_GLOBAL_PATH=0

EXPOSE 5000
CMD ["node", "index.js"]
