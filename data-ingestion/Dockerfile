# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy both package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Install mongodb and fs packages
RUN npm install mongodb fs

# Bundle app source
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Command to run the app
CMD ["npm", "start"]
