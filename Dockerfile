# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (without Turbopack)
RUN npm run build

# Setup database and seed
RUN npm run deploy:prod

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
