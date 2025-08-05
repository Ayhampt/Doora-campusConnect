# Doora Services Marketplace - Backend

A comprehensive service marketplace backend built with Node.js, Express.js, and MongoDB. This platform connects service providers with customers, enabling seamless booking and management of various services.

## 🚀 Features

- **User Management**: Customer and Admin registration/authentication
- **Service Management**: Create, read, update, and delete services
- **Category Management**: Hierarchical category system with subcategories
- **Booking System**: Complete booking workflow with status tracking
- **Appointment Management**: Schedule and manage appointments
- **Review System**: Comprehensive rating and review system
- **File Upload**: Cloudinary integration for image uploads
- **Email Services**: Nodemailer integration for email notifications
- **Authentication**: JWT-based authentication with refresh tokens
- **Role-based Access**: Customer and Admin role management

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Code Formatting**: Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Cloudinary account (for image uploads)
- Email service provider (SMTP)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Doora-servicesMarketplace/Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the Backend directory with the following variables:

```env
# Server Configuration
PORT=8001
CORS_ORIGIN=http://localhost:3000

# Database Configuration
MONGO_URI=mongodb://localhost:27017
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT Configuration
ACCESS_TOKEN_SECRET_KEY=your_access_token_secret_here
ACCESS_TOKEN_SECRET_KEY_EXPIRY=1d
REFRESH_TOKEN_SECRET_KEY=your_refresh_token_secret_here
REFRESH_TOKEN_SECRET_KEY_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Application Domain
DOMAIN=http://localhost:3000
```

### 4. Create Required Directories

```bash
mkdir -p public/temp
```

### 5. Start the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:8001` (or your specified PORT).

## 📦 Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^5.1.0 | Web framework |
| **mongoose** | ^8.16.3 | MongoDB object modeling |
| **bcrypt** | ^6.0.0 | Password hashing |
| **jsonwebtoken** | ^9.0.2 | JWT authentication |
| **dotenv** | ^17.2.0 | Environment variable management |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing |
| **cookie-parser** | ^1.4.7 | Cookie parsing middleware |
| **multer** | ^2.0.2 | File upload handling |
| **cloudinary** | ^2.7.0 | Cloud image management |
| **nodemailer** | ^7.0.5 | Email sending |
| **mongoose-aggregate-paginate-v2** | ^1.1.4 | Pagination for aggregation queries |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **nodemon** | ^3.1.10 | Development server with auto-restart |
| **prettier** | ^3.6.2 | Code formatting |

## 🏗️ Project Structure

```
Backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── favorite.controller.js
│   │   ├── booking.controller.js
│   │   ├── category.controller.js
│   │   ├── healthCheck.controller.js
│   │   ├── review.controller.js
│   │   ├── service.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── profile.controller.js
│   │   └── user.controller.js
│   ├── db/                   # Database configuration
│   │   └── index.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── authIsAdmin.middleware.js
│   │   ├── error.middleware.js
│   │   └── multer.middleware.js
│   ├── models/               # Mongoose models
│   │   ├── favorite.model.js
│   │   ├── booking.model.js
│   │   ├── category.model.js
│   │   ├── review.model.js
│   │   ├── service.model.js
|   |   ├── profile.model.js
|   |   ├── dashboard.model.js
│   │   └── user.model.js
│   ├── routes/               # API routes
│   │   ├── healthCheck.route.js
│   │   └── user.route.js
│   ├── utils/                # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.js
│   │   └── mailer.js
│   ├── app.js                # Express app configuration
│   ├── constants.js          # Application constants
│   └── index.js              # Application entry point
├── public/
│   └── temp/                 # Temporary file storage
├── .prettierrc               # Prettier configuration
├── .prettierignore          # Prettier ignore rules
├── package.json             # Project configuration
└── README.md               # This file
```


## 🔧 API Endpoints

### Health Check
- `GET /api/v1/healthcheck` - Server health status

### User Management
- `POST /api/v1/user/register` - User registration with avatar upload

### Authentication Features
- JWT-based authentication
- Refresh token system
- Email verification
- Password reset functionality

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access and refresh token system
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Mongoose schema validation
- **File Upload Security**: Multer configuration with file type restrictions
- **Environment Variables**: Sensitive data protection

## 📧 Email Features

- **Email Verification**: Account verification emails
- **Password Reset**: Secure password reset workflow
- **Token-based Security**: Hashed tokens with expiration

## 📱 File Upload System

- **Storage**: Cloudinary integration
- **Middleware**: Multer for handling multipart/form-data
- **Temporary Storage**: Local temp folder before cloud upload
- **Auto Cleanup**: Automatic local file deletion after upload

## 🚀 Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start



## 📊 Code Formatting

This project uses Prettier for consistent code formatting:

```json
{
  "singleQuote": false,
  "bracketSpacing": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "semi": true
}
```

## 🔧 Configuration Details

### Database Connection
- **Database Name**: Doora
- **Connection**: Mongoose with connection retry logic
- **Features**: Automatic reconnection, connection logging

### CORS Configuration
- **Origin**: Configurable via environment variable
- **Credentials**: Enabled for cookie support
- **Methods**: All standard HTTP methods supported

### Express Configuration
- **JSON Limit**: 50MB for large payloads
- **URL Encoded**: Extended parsing enabled
- **Static Files**: Public directory serving
- **Cookie Parser**: Enabled for authentication

## 🚨 Error Handling

- **Custom Error Classes**: ApiError utility class
- **Async Handler**: Wrapper for async route handlers
- **Global Error Middleware**: Centralized error processing
- **Validation Errors**: Mongoose validation error handling



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Author

**Ayham** - Backend Developer


