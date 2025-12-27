# LOST_DIR - Lost & Found Community App

A full-stack application for the community to report and find lost items.

## Features
- **Authentication**: Secure registration and login using JWT.
- **Discovery**: Browse lost and found items with search and category filters.
- **Reporting**: Easily post lost or found items with location and details.
- **Management**: Track your own posts and update item status (Recovered/Returned).
- **Clean UI**: Modern, minimal, and mobile-first design.

## Tech Stack
### Client
- React Native (Expo)
- TypeScript
- Expo Router (File-based routing)
- Axios for API communication
- AsyncStorage for session management

### Server
- Node.js (Express)
- TypeScript
- MongoDB (Mongoose)
- JWT for Authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js
- MongoDB (Running locally or on Atlas)

### Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lostfound
   JWT_SECRET=your_secret_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the API URL in `client/constants/Config.ts` if needed (defaults to localhost).
4. Start the Expo app:
   ```bash
   npx expo start
   ```

## Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing

## Run Commands
- `npm run dev` (Server): Starts development server with ts-node-dev.
- `npm run build` (Server): Compiles TypeScript to JavaScript.
- `npx expo start` (Client): Starts the Expo development server.

gFVj73zOFWK7g2uk