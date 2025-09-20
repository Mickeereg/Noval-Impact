# Byte of Africa Backend

Backend for the Byte of Africa recycling rewards app.

## Features

- User authentication with username and JWT
- QR code generation and validation for recyclable items
- Points system for recycling
- Leaderboard for top recyclers
- Coupon/rewards system
- User profile and history tracking

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

3. Start the server:
```
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, username, aadhaar, password }`
  - Returns: JWT token and user data

- `POST /api/auth/login` - Login user
  - Body: `{ username, password }`
  - Returns: JWT token and user data

### Items

- `POST /api/items/generate-qr` - Generate QR code for a recyclable item
  - Body: `{ type }`
  - Returns: Item ID and QR code data URL

- `POST /api/items/validate-qr` - Validate a scanned QR code
  - Body: `{ qrData }`
  - Returns: Validation result and points awarded

- `GET /api/items` - Get all recyclable items (admin only)
  - Returns: List of items

### Users

- `GET /api/users/profile` - Get user profile
  - Returns: User profile data

- `PATCH /api/users/profile` - Update user profile
  - Body: `{ name }`
  - Returns: Updated user profile

- `GET /api/users/history` - Get user recycling history
  - Returns: User's recycling history

- `GET /api/users/coupons` - Get user coupons
  - Returns: User's coupons

### Leaderboard

- `GET /api/leaderboard/global` - Get global leaderboard
  - Returns: Top 10 users by points

- `GET /api/leaderboard/monthly` - Get monthly leaderboard
  - Returns: Top 10 users by points for the current month

- `GET /api/leaderboard/weekly` - Get weekly leaderboard
  - Returns: Top 10 users by points for the current week

- `GET /api/leaderboard/my-rank` - Get user's rank
  - Returns: User's rank and points

## Database Models

### User
- name
- username (unique)
- aadhaar (unique)
- password (hashed)
- points
- recycledItems (references to Item)
- coupons (references to Coupon)

### Item
- itemId (unique)
- type
- points
- qrCode
- isUsed
- usedBy (references to User)
- usedAt

### Coupon
- code (unique)
- type
- value
- description
- pointsRequired
- isActive
- expiryDate
- redeemedBy (references to User)
- redeemedAt 