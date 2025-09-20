# Noval-Impact - Technical Documentation

## Table of Contents
1. [Setup & Installation Guide](#setup--installation-guide)
2. [Project Architecture Overview](#project-architecture-overview)
3. [Code Description & Functionalities](#code-description--functionalities)
4. [Direct Link to Source Code Repository](#direct-link-to-source-code-repository)

---

## Setup & Installation Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Mickeereg/Noval-Impact.git
   cd Noval-Impact
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

4. **Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI= 'You mongoDB string/url'
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5002
   NODE_ENV=development
   ```

### Running the Application

1. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Ensure your connection string is correct

2. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:5002`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Register a new account or login with existing credentials

### Production Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd backend
   npm start
   ```

---

## Project Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 5173    │    │   Port: 5002    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.2.0
- Vite (Build Tool)
- React Router DOM (Routing)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- QR Code Libraries (html5-qrcode, qrcode.react)
- React Hot Toast (Notifications)

**Backend:**
- Node.js
- Express.js (Web Framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- Bcrypt (Password Hashing)
- QRCode (QR Generation)
- Twilio (SMS Notifications)

### Project Structure

```
Noval-Impact/
├── backend/
│   ├── src/
│   │   ├── index.js              # Main server file
│   │   ├── models/               # Database models
│   │   │   ├── User.js           # User schema
│   │   │   ├── Item.js           # Recyclable item schema
│   │   │   └── Coupon.js         # Coupon schema
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js           # Authentication routes
│   │   │   ├── items.js          # Item management routes
│   │   │   ├── users.js          # User management routes
│   │   │   ├── leaderboard.js    # Leaderboard routes
│   │   │   ├── admin.js          # Admin routes
│   │   │   └── notifications.js  # Notification routes
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── auth.js           # JWT authentication
│   │   │   └── admin.js          # Admin authorization
│   │   └── services/             # Business logic services
│   │       └── notificationService.js
│   ├── uploads/                  # File uploads
│   └── public/                   # Static files
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Navbar.jsx        # Navigation component
│   │   │   ├── QRScanner.jsx     # QR code scanner
│   │   │   ├── QRGenerator.jsx   # QR code generator
│   │   │   ├── DashboardScanner.jsx
│   │   │   ├── Leaderboard.jsx   # Points leaderboard
│   │   │   └── LandingPage.jsx   # Landing page
│   │   ├── pages/                # Page components
│   │   │   ├── Auth.jsx          # Login/Register page
│   │   │   ├── Dashboard.jsx     # User dashboard
│   │   │   └── AdminPage.jsx     # Admin panel
│   │   ├── config/               # Configuration files
│   │   │   └── api.js            # API configuration
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # App entry point
│   └── public/                   # Static assets
└── README.md
```

### Database Schema

**Users Collection:**
```javascript
{
  name: String,
  username: String (unique),
  aadhaar: String (unique, 12 digits),
  address: String,
  password: String (hashed),
  isAdmin: Boolean,
  points: Number,
  bottlePoints: Number,
  recycledItems: [ObjectId],
  coupons: [ObjectId],
  createdAt: Date
}
```

**Items Collection:**
```javascript
{
  itemId: String (unique),
  type: String (enum: plastic, tin, paper, glass, electronics, other),
  points: Number,
  qrCode: String,
  qrCodeImage: String,
  isUsed: Boolean,
  usedBy: ObjectId,
  usedAt: Date,
  createdAt: Date
}
```

---

## Code Description & Functionalities

### Core Features

#### 1. User Authentication & Authorization
- **Registration**: Users can register with name, username, Aadhaar number, and address
- **Login**: JWT-based authentication with 7-day token expiration
- **Admin Role**: Special admin users with elevated privileges
- **Password Security**: Bcrypt hashing with salt rounds

#### 2. QR Code System
- **QR Generation**: Automatic QR code creation for recyclable items
- **QR Scanning**: Camera-based QR code scanning for item validation
- **Item Tracking**: Each item has a unique QR code for tracking usage

#### 3. Points & Rewards System
- **Dynamic Point Values**:
  - Plastic: 5 points
  - Tin: 6 points
  - Paper: 3 points
  - Glass: 8 points
  - Electronics: 15 points
  - Other: 4 points
- **Point Accumulation**: Users earn points for recycling items
- **Leaderboard**: Real-time ranking of users by points

#### 4. Item Management
- **Item Types**: Support for 6 different recyclable categories
- **Usage Tracking**: Prevent duplicate scanning of the same item
- **Admin Controls**: Admins can create and manage recyclable items

#### 5. Notification System
- **SMS Integration**: Twilio integration for SMS notifications
- **Real-time Updates**: Toast notifications for user actions
- **Email Notifications**: (Extensible for future implementation)

### Key Components

#### Backend API Endpoints

**Authentication Routes (`/api/auth`)**
- `POST /register` - User registration
- `POST /login` - User login

**Item Routes (`/api/items`)**
- `POST /validate-qr` - Validate and process QR codes
- `GET /` - Get all items (admin only)
- `POST /` - Create new item (admin only)

**User Routes (`/api/users`)**
- `GET /profile` - Get user profile
- `GET /leaderboard` - Get points leaderboard
- `PUT /profile` - Update user profile

**Admin Routes (`/api/admin`)**
- `GET /stats` - Get system statistics
- `POST /items` - Create recyclable items
- `GET /users` - Get all users

#### Frontend Components

**Authentication System**
- Login/Register forms with validation
- JWT token management
- Protected route handling

**QR Code Scanner**
- Camera integration for QR scanning
- Real-time validation feedback
- Error handling for invalid codes

**Dashboard**
- User point display
- Recent activity feed
- Quick access to scanner

**Admin Panel**
- User management interface
- Item creation and management
- System statistics dashboard

### Security Features

1. **Password Security**: Bcrypt hashing with salt
2. **JWT Authentication**: Secure token-based auth
3. **Input Validation**: Server-side validation for all inputs
4. **CORS Protection**: Configured for specific origins
5. **Error Handling**: Comprehensive error handling and logging

### Performance Optimizations

1. **Database Indexing**: Unique indexes on username and Aadhaar
2. **Static File Serving**: Optimized static file delivery
3. **Middleware Optimization**: Efficient request processing
4. **Frontend Code Splitting**: Vite-based optimized builds

---

## Direct Link to Source Code Repository

**GitHub Repository**: [Noval-Impact Repository](https://github.com/your-username/Noval-Impact)

### Repository Contents
- Complete source code for both frontend and backend
- Database models and schemas
- API documentation
- Deployment configurations
- Environment setup files

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## Additional Information

### Development Team
- **Backend Development**: Node.js, Express.js, MongoDB
- **Frontend Development**: React, Vite, Tailwind CSS
- **Database Design**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based security system

### Future Enhancements
- Mobile app development (React Native)
- Advanced analytics dashboard
- Integration with external recycling services
- Gamification features
- Social sharing capabilities

### Support
For technical support or questions, please contact the development team or create an issue in the GitHub repository.

---

*Last Updated: [Current Date]*
*Version: 1.0.0*
