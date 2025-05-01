# Server-side Directory Structure

## Overview
The server side of the Food Delivery application is built with Express.js and TypeScript, following a structured MVC pattern. It provides a RESTful API for the client application and uses MongoDB as the database.

## Key Directories

### `/controller`
Contains the business logic and request handlers for each route.

- `user.controller.ts`: Authentication and user management functionality
  - User registration with email verification
  - Login/logout
  - Password reset flow
  - Profile management

- `restaurant.controller.ts`: Restaurant management
  - Restaurant CRUD operations
  - Restaurant search functionality
  - Order management for restaurant owners

- `menu.controller.ts`: Menu item management
  - CRUD operations for restaurant menu items

- `order.controller.ts`: Order processing
  - Order creation and management
  - Payment processing with Stripe
  - Order status updates

### `/db`
Database configuration and connection.

- `connectDB.ts`: MongoDB connection setup

### `/mailtrap`
Email service implementation for user verification and notifications.

- `email.ts`: Email template and sending functionality

### `/middlewares`
Express middleware functions.

- `isAuthenticated.ts`: JWT authentication middleware
- `multer.ts`: File upload middleware configuration

### `/models`
Mongoose schemas and model definitions.

- `user.model.ts`: User data structure and methods
- `restaurant.model.ts`: Restaurant data structure
- `menu.model.ts`: Menu item structure
- `order.model.ts`: Order data structure with delivery details

### `/routes`
API route definitions and HTTP method handlers.

- `user.route.ts`: User-related endpoints
- `restaurant.route.ts`: Restaurant management endpoints
- `menu.route.ts`: Menu management endpoints
- `order.route.ts`: Order processing endpoints

### `/utils`
Utility functions for various operations.

- `cloudinary.ts`: Image upload configuration
- `generateToken.ts`: JWT token generation
- `generateVerificationCode.ts`: Email verification code generation
- `imageUpload.ts`: Image upload helper

### Root files
- `index.ts`: Main application entry point with Express configuration
- `.env`: Environment variables (contains sensitive information)
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration

## API Structure
The API follows RESTful conventions with proper status codes and JSON responses. Authentication is handled through JWT tokens stored in cookies.

## Database
MongoDB is used as the database with Mongoose ODM for schema definition and validation.

## Authentication
The application uses JWT-based authentication with password hashing via bcrypt. Email verification is implemented for new user registrations.

## File Storage
Cloudinary is used for image storage (restaurant images, menu items, user profiles).

## Payment Processing
Stripe integration for handling payments in the order process.

## Server-side Bugs and Issues

1. MongoDB credentials exposed in comments in connectDB.ts
2. Weak JWT secret key in environment variables
3. No error handling for Cloudinary uploads in multiple controllers
4. Insufficient input validation before database operations
5. Inconsistent error handling across controllers
6. No rate limiting for authentication attempts
7. Hardcoded URLs in CORS configuration
8. Potential security vulnerabilities in file uploads
9. No transaction support for operations that affect multiple collections
10. Missing data validation in some controller functions
11. No comprehensive logging strategy
12. Error messages expose too much implementation detail
13. Missing schema indexes for frequently queried fields
14. No proper handling for missing environment variables
15. Stripe webhook endpoint lacks proper signature verification
16. Email verification token handling lacks proper expiration enforcement
