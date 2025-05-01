# Food Delivery Application Structure

## Client Side

The client is a React application built with TypeScript and Vite, using modern UI components from Radix UI and styled with Tailwind CSS.

### Key Directories:
- `/src`: Main source code
  - `/admin`: Admin panel components for restaurant management, menu addition, and order processing
  - `/auth`: Authentication-related components (Login, Signup, Password Reset, Email Verification)
  - `/components`: Reusable UI components including HeroSection, Cart, Restaurant listings, etc.
  - `/layout`: Layout components for consistent UI structure across the application
  - `/lib`: Utility functions and shared libraries
  - `/schema`: Zod validation schemas for form validation and type safety
  - `/store`: State management using Zustand for users, restaurants, menus, cart, and orders
  - `/types`: TypeScript type definitions ensuring type safety throughout the app

### Key Features:
- User authentication with email verification
- Restaurant search and filtering by cuisine types
- Food ordering system with cart management
- Order tracking and history
- Admin dashboard for restaurant owners
- Profile management
- Responsive design using Tailwind CSS

### State Management:
- User state (authentication, profile)
- Restaurant state (listings, details, search)
- Menu state (items by restaurant)
- Cart state (items, quantities)
- Order state (checkout, history)
- Theme state (light/dark mode)

## Server Side

The server is built with Express.js and TypeScript, using MongoDB as the database with a RESTful API architecture.

### Key Directories:
- `/controller`: API endpoint controllers for users, restaurants, menus, and orders
- `/db`: Database connection setup using Mongoose
- `/mailtrap`: Email service implementation for verification and notifications
- `/middlewares`: Express middlewares for authentication, file uploads, etc.
- `/models`: MongoDB schemas defining data structure
- `/routes`: API route definitions with appropriate HTTP methods
- `/utils`: Utility functions for token generation, image uploads, etc.

### API Endpoints:
- User: Registration, authentication, profile management
- Restaurant: CRUD operations, search functionality
- Menu: CRUD operations for restaurant menus
- Order: Placement, status tracking, history

### Integration Points:
- Cloudinary for image uploads and storage
- Stripe for payment processing
- Mailtrap for email delivery
- MongoDB Atlas for database hosting

## Potential Bugs and Issues:

### Security Issues:
1. MongoDB connection credentials are exposed in comments in connectDB.ts (line 1-2)
2. API keys and secrets are directly stored in .env file and committed to the repository
3. JWT secret key is too simple/weak ("jncedbvjeiuv")
4. No CSRF protection implemented
5. Missing input sanitization for user inputs
6. No rate limiting for authentication attempts or API calls

### Authentication Issues:
7. ResetPassword route in App.tsx is missing the token parameter (should be 'reset-password/:token')
8. No token refresh mechanism for long user sessions
9. resetPassword API endpoint in useUserStore.ts sends to incorrect endpoint (missing token in path)
10. No proper error handling if JWT verification fails

### Implementation Bugs:
11. Inconsistent error handling throughout controllers
12. No error handling for Cloudinary uploads in updateProfile and restaurant creation
13. Missing form validation in several components
14. Hardcoded URLs in CORS configuration and API endpoints (not using environment variables)
15. Potential memory leaks in useEffect hooks due to missing cleanup functions
16. No loading indicators in some components during API calls
17. Profile picture upload has no size or type validation

### Database Issues:
18. No indexing defined on frequently queried fields
19. Missing cascade deletion for related documents (e.g., when a restaurant is deleted)
20. No validation for uniqueness in some models (except for user email)

### UX/UI Issues:
21. Forgot password link is commented out in Login.tsx
22. Inconsistent error messaging for users
23. No client-side caching strategy for frequently accessed data
24. Missing feedback on form submission in some components
