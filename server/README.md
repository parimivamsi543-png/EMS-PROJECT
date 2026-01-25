# Employee Management System - Backend

This is the backend API for the Employee Management System, built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
NODE_ENV=development
```

3. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Employee Endpoints

#### Get All Employees
```http
GET /api/employees
```
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `department` (string): Filter by department
- `status` (string): Filter by status

**Response:**
```json
{
  "employees": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

#### Get Employee by ID
```http
GET /api/employees/:id
```

#### Create Employee
```http
POST /api/employees
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "position": "Software Engineer",
  "department": "Engineering",
  "salary": 75000,
  "hireDate": "2023-01-15"
}
```

#### Update Employee
```http
PUT /api/employees/:id
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "salary": 80000
}
```

#### Delete Employee
```http
DELETE /api/employees/:id
```

#### Get Employee Statistics
```http
GET /api/employees/stats/overview
```

### Department Endpoints

#### Get All Departments
```http
GET /api/departments
```

#### Get Department by ID
```http
GET /api/departments/:id
```

#### Create Department
```http
POST /api/departments
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Software development team",
  "budget": 500000,
  "location": "San Francisco"
}
```

#### Update Department
```http
PUT /api/departments/:id
```

#### Delete Department
```http
DELETE /api/departments/:id
```

#### Get Department Employees
```http
GET /api/departments/:id/employees
```

## 🗄️ Database Models

### Employee Schema
```javascript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true, min: 0 },
  hireDate: { type: Date, required: true, default: Date.now },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  skills: [String],
  status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  profilePicture: String,
  notes: String
}
```

### Department Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  description: String,
  manager: { type: ObjectId, ref: 'Employee' },
  budget: { type: Number, min: 0 },
  location: String,
  establishedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

### MongoDB Connection
The application connects to MongoDB using Mongoose. Make sure MongoDB is running locally or provide a cloud connection string.

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee_management
```

## 🛠️ Development

### Project Structure
```
server/
├── models/           # MongoDB models
│   ├── Employee.js
│   └── Department.js
├── routes/           # API routes
│   ├── employees.js
│   └── departments.js
├── config.js         # Configuration
├── index.js          # Server entry point
└── package.json
```

### Adding New Features

1. **Create a new model** in `models/`
2. **Create routes** in `routes/`
3. **Add validation** using express-validator
4. **Update the main server** in `index.js`

### Error Handling
The server includes comprehensive error handling:
- Input validation errors
- Database connection errors
- Duplicate key errors
- Not found errors

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure CORS for your domain
4. Set up proper logging

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security

- Input validation using express-validator
- CORS configuration
- Error handling without sensitive data exposure
- MongoDB injection prevention through Mongoose

## 📊 Performance

- Database indexing for search functionality
- Pagination for large datasets
- Efficient queries with proper projections
- Connection pooling with Mongoose

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [...] // Validation errors if any
}
```

## 🔄 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:3000` (React development server)
- Your production frontend domain

Update CORS settings in `index.js` for production deployment.

---

**Backend API for Employee Management System**
