# Use Node.js LTS as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy the package.json file into the container at /app
COPY package*.json ./

# Install all the dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs in
EXPOSE 5000

# Serve the app
CMD ["npm", "start"]