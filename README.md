# Blog Application

A full-stack blog application built with React and Node.js, featuring user authentication, post management, and a modern UI.

## Features

- **User Authentication**: Register, login, and profile management
- **Blog Posts**: Create, read, update, and delete blog posts
- **Categories & Tags**: Organize posts with categories and tags
- **Search & Filter**: Search posts by title/content and filter by category/tag
- **Responsive Design**: Modern UI built with Material-UI
- **Real-time Updates**: Like posts and view counts
- **Admin Panel**: User management and content moderation

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend

- React 18
- Material-UI (MUI)
- React Router
- Axios for API calls
- Context API for state management

## Project Structure

```
Blog application/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── config.env       # Environment variables
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
│   └── public/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `config.env` and update the values:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blog-app
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start MongoDB (if running locally):

   ```bash
   mongod
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   ```bash
   # Create .env file in frontend directory
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Posts

- `GET /api/posts` - Get all published posts
- `GET /api/posts/:slug` - Get single post by slug
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)
- `POST /api/posts/:id/like` - Like/unlike post (authenticated)

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (authenticated)
- `DELETE /api/users/:id` - Delete user (admin)

## Usage

1. **Register/Login**: Create an account or login to access all features
2. **Create Posts**: Write and publish blog posts with categories and tags
3. **Browse Posts**: View all published posts with search and filter options
4. **Interact**: Like posts and view engagement metrics
5. **Manage Content**: Edit or delete your own posts
