# Use a secure and minimal base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 4001

# Run the application
CMD [ "node", "src/server.js" ]
