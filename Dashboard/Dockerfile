FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the environment variable to avoid OpenSSL issue
ENV NODE_OPTIONS=--openssl-legacy-provider

# Build the application
RUN npm run build

# Install a lightweight HTTP server to serve the app
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 5000

# Run the app with the HTTP server
CMD ["serve", "-s", "build", "-l", "5000"]