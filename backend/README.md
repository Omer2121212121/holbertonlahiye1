# Holberton Project Backend

Professional Node.js/Express backend with MongoDB for the Holberton Dashboard application.

## Features

- ✅ User authentication (JWT-based)
- ✅ User registration and login
- ✅ MongoDB database integration
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for frontend integration
- ✅ RESTful API design

## Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

## Quick Start (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values:
     ```
     PORT=3000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     ```

3. **Run the server**:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "john",
  "password": "secure123",
  "name": "John Doe",
  "discord": "john#1234" (optional)
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "john",
  "password": "secure123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### Get User Profile
```http
GET /api/me
Authorization: <jwt_token>
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Render.

### Quick Deployment Steps:
1. Set up MongoDB Atlas
2. Deploy to Render
3. Configure environment variables
4. Update frontend with backend URL

## Project Structure

```
backend/
├── models/
│   └── User.js          # User schema
├── routes/
│   └── auth.js          # Authentication routes
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore file
├── build.sh            # Render build script
├── database.sql        # Database schema reference
├── package.json        # Dependencies
└── server.js           # Main server file
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/holberton` |
| `JWT_SECRET` | Secret key for JWT signing | `my-secret-key-2024` |

## Development

For development with auto-reload:
```bash
npm run dev
```

## License

ISC
