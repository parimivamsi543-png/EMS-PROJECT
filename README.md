# Employee Management System

A comprehensive, modern employee management system built with React, Node.js, Express, and MongoDB. This system provides a complete solution for managing employees, departments, and organizational data.

## 🚀 Features

### Authentication & Security
- ✅ Beautiful sign-in and sign-up pages with gradients
- ✅ Secure authentication system
- ✅ Protected routes and user sessions
- ✅ Password strength validation
- ✅ Social login options (Google, Twitter)
- ✅ Remember me functionality
- ✅ Forgot password support

### Employee Management
- ✅ Add, edit, delete, and view employee details
- ✅ Comprehensive employee profiles with contact information
- ✅ Job information (position, department, salary, hire date)
- ✅ Address and emergency contact information
- ✅ Skills tracking and notes
- ✅ Employee status management (active, inactive, terminated)
- ✅ Advanced search and filtering
- ✅ Pagination for large datasets

### Department Management
- ✅ Create and manage departments
- ✅ Assign department managers
- ✅ Budget tracking
- ✅ Location management
- ✅ Department status control

### Dashboard & Analytics
- ✅ Real-time statistics overview
- ✅ Employee count by department
- ✅ Average salary calculations
- ✅ Quick action buttons
- ✅ Visual data representation

### User Experience
- ✅ Modern, responsive design with beautiful gradients
- ✅ Mobile-friendly interface
- ✅ Intuitive navigation
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Professional UI with Tailwind CSS
- ✅ Landing page with feature showcase

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd employee-management-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
NODE_ENV=development
```

### 4. Database Setup
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

### 5. Start the Application

#### Development Mode (Recommended)
```bash
# From the root directory
npm run dev
```
This will start both the backend server (port 5000) and frontend development server (port 3000) concurrently.

#### Manual Start
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 📁 Project Structure

```
employee-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── config.js         # Configuration
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Employees
- `GET /api/employees` - Get all employees (with pagination and search)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats/overview` - Get employee statistics

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `GET /api/departments/:id/employees` - Get department employees

## 🎨 UI Components

### Pages
- **Dashboard** - Overview with statistics and quick actions
- **Employees** - Employee list with search and filtering
- **Employee Form** - Add/edit employee information
- **Employee Details** - Detailed employee view
- **Departments** - Department management
- **Department Form** - Add/edit department information

### Features
- Responsive design for all screen sizes
- Dark/light theme support
- Form validation with error messages
- Loading states and animations
- Search and filter functionality
- Pagination for large datasets

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the React app:
```bash
cd client
npm run build
```

2. Deploy the `build` folder to your hosting service

### Backend Deployment (Heroku/Railway)
1. Set environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

2. Deploy to your hosting service

### Full-Stack Deployment
For production deployment, update the API URL in `client/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## 🔒 Security Features

- Input validation on both frontend and backend
- CORS configuration
- Error handling and logging
- Data sanitization
- Secure API endpoints

## 📊 Database Schema

### Employee Model
```javascript
{
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  phone: String (required)
  position: String (required)
  department: String (required)
  salary: Number (required)
  hireDate: Date (required)
  address: {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }
  emergencyContact: {
    name: String
    relationship: String
    phone: String
  }
  skills: [String]
  status: String (enum: active, inactive, terminated)
  notes: String
}
```

### Department Model
```javascript
{
  name: String (required, unique)
  description: String
  manager: ObjectId (ref: Employee)
  budget: Number
  location: String
  establishedDate: Date
  status: String (enum: active, inactive)
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based access control
- [ ] Advanced reporting and analytics
- [ ] Employee photo upload
- [ ] Email notifications
- [ ] Export to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced search with filters
- [ ] Bulk operations
- [ ] Employee performance tracking
- [ ] Leave management system
- [ ] Payroll integration

---

**Built with ❤️ using modern web technologies**
#   E M S  
 #   E M S  
 "# EMS" 
