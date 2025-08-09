# 🏥 Clinic Front Desk Management System

A comprehensive clinic management system built with Next.js 15, TypeScript, MongoDB Atlas, and shadcn/ui. This application provides a complete solution for managing clinic operations including patient queue management, doctor profiles, appointment scheduling, and more.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Receptionist, Doctor, Patient)
- Secure password hashing with bcryptjs

### 👥 User Management
- **Admin**: Full system access, manage all users and data
- **Receptionist**: Manage patients, queue, and appointments
- **Doctor**: View patients, queue, and appointments
- **Patient**: View own records and appointments

### 🏥 Core Functionality
- **Patient Management**: Registration, medical history, contact information
- **Doctor Management**: Profiles, specializations, availability, qualifications
- **Queue Management**: Real-time patient queue with priority levels
- **Appointment Scheduling**: Conflict detection, automated scheduling
- **Dashboard**: Real-time statistics and activity monitoring

### 🎨 Modern UI/UX
- Built with shadcn/ui components
- Responsive design with Tailwind CSS v4
- Dark/light mode support
- Intuitive navigation and user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- npm/yarn/pnpm

### 1. Clone and Install
```bash
git clone <repository-url>
cd clinic-frontdesk
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-frontdesk
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Database Setup
Your MongoDB Atlas database will be automatically set up when you first run the application. The models will create the necessary collections.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### 5. Initial Setup
1. Register the first admin user through the UI
2. Create doctor profiles
3. Start adding patients and managing the queue

## 📁 Project Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── doctors/              # Doctor management
│   │   ├── patients/             # Patient management
│   │   ├── queue/                # Queue management
│   │   ├── appointments/         # Appointment scheduling
│   │   └── dashboard/            # Dashboard statistics
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── doctors/              # Doctor management components
│   │   ├── patients/             # Patient management components
│   │   ├── queue/                # Queue management components
│   │   └── appointments/         # Appointment components
│   └── pages/                    # Application pages
├── lib/                          # Utility libraries
│   ├── db/                       # Database models and connection
│   │   ├── models/               # Mongoose models
│   │   └── connect.ts            # Database connection
│   ├── dto/                      # Data Transfer Objects with validation
│   ├── middleware/               # Authentication middleware
│   ├── auth.ts                   # Authentication utilities
│   ├── validation.ts             # Validation utilities
│   └── utils.ts                  # General utilities
```

## 🔌 API Documentation

The API provides comprehensive RESTful endpoints for all clinic operations. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed documentation.

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/doctors` - List doctors with filtering
- `POST /api/patients` - Create new patient
- `GET /api/queue` - Get current queue status
- `POST /api/appointments` - Schedule new appointment
- `GET /api/dashboard/stats` - Dashboard statistics

## 🧪 Testing

Test the API endpoints:
```bash
node test-api.js
```

This script will test basic API functionality including user registration, login, and data retrieval.

## 🗄️ Database Models

### User Model
- Email/password authentication
- Role-based permissions
- Account status management

### Doctor Model
- Personal information and contact details
- Medical qualifications and specializations
- Availability scheduling
- Consultation fees

### Patient Model  
- Personal and contact information
- Medical history and allergies
- Emergency contact details
- Current medications

### Queue Model
- Real-time queue management
- Priority levels (normal, high, urgent)
- Status tracking (waiting, in-progress, completed)
- Automatic queue numbering

### Appointment Model
- Scheduling with conflict detection
- Appointment types and reasons
- Status management
- Doctor-patient associations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permission levels for each user type
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: class-validator with DTOs for all API inputs
- **CORS Protection**: Configured for production deployment
- **Environment Variables**: Sensitive data stored securely

## 🎨 UI Components

Built with shadcn/ui providing:
- Form components with validation
- Data tables with sorting/filtering
- Modal dialogs for actions
- Toast notifications
- Loading states and skeletons
- Responsive navigation

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interface
- Accessible navigation

## 🚀 Deployment

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-production-secret
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
```

### Deployment Platforms
- **Vercel**: Optimized for Next.js applications
- **Railway**: Easy database and app deployment
- **DigitalOcean**: Custom server deployment
- **AWS**: Enterprise-grade deployment

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
1. Check the API documentation
2. Review the test scripts
3. Ensure environment variables are correctly set
4. Verify MongoDB Atlas connection

## 🔄 Recent Updates

- ✅ Complete backend API implementation
- ✅ JWT authentication with role-based access
- ✅ MongoDB Atlas integration
- ✅ Comprehensive validation system
- ✅ Real-time queue management
- ✅ Appointment scheduling with conflict detection
- ✅ Dashboard with statistics and activity monitoring

---

Built with ❤️ using Next.js 15, TypeScript, MongoDB Atlas, and shadcn/ui.
