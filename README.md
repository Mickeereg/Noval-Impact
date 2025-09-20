# ScanCycle

A full-stack application that incentivizes recycling through a points-based reward system. Users can scan QR codes on recyclable items to earn points and receive coupons when their recycling can is full.

## Features

- User authentication and authorization
- QR code generation and scanning for recyclable items
- Points tracking and leaderboard
- SMS notifications for collection requests
- Coupon reward system
- Admin dashboard for user management
- Real-time recycling progress tracking

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion for animations
- React Hot Toast for notifications
- React Router for navigation
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Twilio for SMS notifications
- QR Code generation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Twilio account for SMS functionality
- npm or yarn package manager

## Environment Variables

Create a .env file in the backend directory with the following variables:

PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
COMPANY_PHONE_NUMBER=your_company_phone_number
NODE_ENV=development

## Installation

1. Clone the repository:
git clone https://github.com/Mickeereg/Noval-Impact.git
cd Noval-Impact

2. Install frontend dependencies:
cd frontend
npm install --legacy-peer-deps

3. Install backend dependencies:
cd ../backend
npm install

## Running the Application

1. Start the backend server:
cd backend
npm start

2. Start the frontend development server:
cd frontend
npm run dev

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5002

## Project Structure

recycling-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── config/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
└── README.md

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile

### Items
- POST /api/items/generate-qr - Generate QR code for recyclable item
- POST /api/items/validate-qr - Validate scanned QR code
- GET /api/items - Get all items (admin only)

### Users
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- GET /api/users/leaderboard - Get leaderboard

### Notifications
- POST /api/notifications/can-full - Send notification when recycling can is full

## Features in Detail

### User Authentication
- Secure registration with Aadhaar validation
- JWT-based authentication
- Role-based access control (admin/user)

### QR Code System
- Generate unique QR codes for recyclable items
- Scan and validate QR codes
- Prevent duplicate scanning
- Track recycling history

### Points System
- Earn points for recycling different types of items
- Track recycling progress
- View leaderboard rankings
- Receive coupons when recycling can is full

### Admin Features
- View all users and their recycling history
- Manage user accounts
- Monitor recycling statistics
- Receive SMS notifications for collection requests

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Twilio for SMS integration
- MongoDB Atlas for database hosting
- All contributors and maintainers
