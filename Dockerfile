# Use the latest LTS Node.js as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json before copying the rest
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 5000

<<<<<<< HEAD

# Serve the app
CMD ["npm", "start"]
=======
# Start the application
CMD ["npm", "start"]
>>>>>>> feature/transactions
