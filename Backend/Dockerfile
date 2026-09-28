FROM node:20-alpine

WORKDIR /app

# Copy package files first (layer cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy all source files
COPY . .

# Non-root user for security
RUN addgroup -S geoplant && adduser -S geoplant -G geoplant
USER geoplant

EXPOSE 8080

CMD ["node", "server.js"]
