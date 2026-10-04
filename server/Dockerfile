FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 8000

CMD ["node", "index.js"]
