# Found - Co-founder Discovery Platform

A production-ready MVP for connecting entrepreneurs with their ideal co-founders. Built with React Native and Node.js, featuring real-time chat, smart matching, and comprehensive profile management.

## 🚀 Features

### Core Functionality
- **Smart Matching Algorithm**: Swipe-based discovery with mutual matching
- **Real-time Chat**: WhatsApp-style messaging with Socket.IO
- **Profile Management**: Comprehensive profiles with skills, industries, and goals
- **Verification System**: Document upload and verification process
- **Location-based Discovery**: Find co-founders in your area

### Authentication & Security
- JWT-based authentication
- Email/Phone login with OTP verification
- Password strength validation
- Secure file uploads
- Input sanitization and rate limiting

### User Experience
- Clean, minimal UI with light mode only
- Swipe gestures for profile discovery
- Online/offline status indicators
- Message read receipts and typing indicators
- Responsive design for all screen sizes

## 📱 Tech Stack

### Frontend (React Native)
- **Framework**: Expo with React Navigation
- **State Management**: Context API
- **API Client**: Axios
- **Real-time**: Socket.IO Client
- **Storage**: Expo SecureStore
- **File Handling**: Expo Image Picker & Document Picker

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.IO
- **File Uploads**: Multer with local storage
- **Email**: Nodemailer
- **Validation**: Express Validator

### Database Models
- User, Profile, Skill, Industry
- Like, Match, Message, Block
- Document, OTP, Feedback
- Proper indexing for performance

## 🛠️ Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Expo CLI
- Git

### Backend Setup

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/found
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:19006

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@found.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# File upload settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

4. **Create uploads directory**
```bash
mkdir -p uploads/documents
```

5. **Start the backend**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the frontend**
```bash
npm start
```

4. **Run on device/simulator**
```bash
# For iOS
npm run ios

# For Android
npm run android

# For web (development only)
npm run web
```

### Database Seeding

1. **Seed the database with sample data**
```bash
cd backend
node scripts/seed.js
```

This creates 5 sample users with profiles:
- john.doe@example.com / Password123!
- jane.smith@example.com / Password123!
- mike.wilson@example.com / Password123!
- sarah.jones@example.com / Password123!
- alex.brown@example.com / Password123!

## 📱 App Flow

### 1. Splash & Authentication
- App splash screen with branding
- Email/Phone login with password validation
- OTP verification via email
- Google OAuth integration (LinkedIn stub)

### 2. Onboarding
- 4-slide carousel explaining the app
- Goal selection (startup owner, idea stage, looking to join)
- Multi-step profile creation with validation

### 3. Discovery
- Swipe-based card interface
- Distance-based filtering
- Mutual matching creates connections
- "Connection Established" modal on match

### 4. Matches & Chat
- List of matched profiles with online status
- Real-time messaging with Socket.IO
- Message status indicators (sent/delivered/read)
- Chat actions (remove connection, block user)

### 5. Settings & Profile
- Document management and verification
- Discover preferences and filters
- Help & support with WhatsApp integration
- Feedback system with email notifications

## 🎨 Design System

### Color Palette (Light Mode Only)
- **App Background**: #F7F7F7
- **Card Background**: #EFE9E1
- **Primary Text**: #4A4A4A
- **Secondary Text**: #7A7A7A
- **CTA Button**: #1155ccff
- **CTA Text**: #ffffff
- **Online Green**: #00b000
- **Offline Grey**: #b7b7b7

### UI Components
- Clean, minimal card-based design
- Swipe gestures with visual feedback
- Consistent typography and spacing
- Proper accessibility considerations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user

### Profile
- `POST /api/profile` - Create/update profile
- `GET /api/profile/me` - Get current user profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/photo` - Update profile photo

### Discovery
- `GET /api/discovery/next` - Get next profile
- `POST /api/discovery/action` - Like/pass profile
- `GET /api/discovery/stats` - Discovery statistics

### Matches
- `GET /api/match` - Get user matches
- `GET /api/match/:matchId` - Get match details
- `DELETE /api/match/:matchId` - Remove connection
- `POST /api/match/:matchId/block` - Block user

### Chat
- `GET /api/chat/:matchId` - Get chat messages
- `POST /api/chat/:matchId` - Send message
- `PUT /api/chat/:matchId/read` - Mark messages as read
- `DELETE /api/chat/:matchId/:messageId` - Delete message

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `DELETE /api/documents/:documentId` - Delete document

### Settings
- `POST /api/settings/feedback` - Submit feedback
- `GET /api/settings/verification` - Get verification status
- `GET /api/settings/discover` - Get discover settings
- `PUT /api/settings/discover` - Update discover settings

## 🔒 Security Features

- **Authentication**: JWT tokens with secure storage
- **Password Security**: Bcrypt hashing with salt rounds
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Express-rate-limit for API protection
- **File Security**: Multer with file type and size validation
- **Content Sanitization**: XSS prevention
- **CORS**: Proper cross-origin resource sharing

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Set up file storage (S3 for production)
4. Configure email service
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the Expo app: `expo build:android` or `expo build:ios`
2. Submit to app stores or use OTA updates
3. Configure production API endpoints

## 📊 Database Schema

### Key Models
- **User**: Authentication and basic user info
- **Profile**: Comprehensive user profile with location, skills, etc.
- **Match**: Mutual connections between users
- **Message**: Chat messages with status tracking
- **Document**: File uploads with metadata
- **OTP**: One-time passwords for verification

### Indexes
- Geospatial index for location queries
- Compound indexes for efficient filtering
- User ID indexes for fast lookups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@found.com
- WhatsApp: +91 98765 43210
- Check the Help & Support section in the app

## 🎯 Future Enhancements

- Video calling integration
- Advanced matching algorithms
- Team collaboration features
- Investment matching
- Event management
- Advanced analytics dashboard

---

**Built with ❤️ for entrepreneurs worldwide**
