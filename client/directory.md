# Client-side Directory Structure

## Overview
The client side of the Food Delivery application is built with React, TypeScript, and Vite, using a modern component-based architecture. It features a responsive UI built with Tailwind CSS and Radix UI components.

## Key Directories

### `/src`
Contains all source code for the application.

- **`/admin`**: Admin panel components
  - `Restaurant.tsx`: Restaurant management for owners
  - `AddMenu.tsx`: Menu item creation and management
  - `Orders.tsx`: Order processing and status updates

- **`/auth`**: Authentication components
  - `Login.tsx`: User login functionality
  - `Signup.tsx`: New user registration
  - `ForgotPassword.tsx`: Password recovery flow
  - `ResetPassword.tsx`: Password reset implementation
  - `VerifyEmail.tsx`: Email verification process

- **`/components`**: UI components
  - `HeroSection.tsx`: Main landing page component
  - `Cart.tsx`: Shopping cart functionality
  - `Profile.tsx`: User profile management
  - `RestaurantDetail.tsx`: Individual restaurant view
  - `SearchPage.tsx`: Restaurant search functionality
  - Other UI components including loading indicators, success messages, etc.

- **`/layout`**: Layout components
  - `MainLayout.tsx`: Main application layout wrapper

- **`/lib`**: Utility functions and shared code

- **`/schema`**: Zod validation schemas
  - `userSchema.ts`: User data validation

- **`/store`**: Zustand state management
  - `useUserStore.ts`: User authentication and profile state
  - `useRestaurantStore.ts`: Restaurant data handling
  - `useMenuStore.ts`: Menu items management
  - `useCartStore.ts`: Shopping cart functionality
  - `useOrderStore.ts`: Order processing and tracking
  - `useThemeStore.ts`: Theme preferences

- **`/types`**: TypeScript type definitions

### Root files
- `App.tsx`: Main application component with routing
- `main.tsx`: Application entry point
- `index.css`: Global CSS styles

## State Management
The application uses Zustand for state management with persistent storage for user sessions and cart data. Each feature has its own store for better separation of concerns.

## Routing
React Router DOM handles client-side routing with protected routes for authenticated users and special routes for admin users.

## API Integration
Axios is used for HTTP requests to the backend, with consistent error handling and response processing.

## Styling
The application uses Tailwind CSS with custom configuration and Radix UI components for a consistent and responsive design.

## Form Validation
Zod is used for form validation with custom schemas for different data types.

## Client-side Bugs and Issues

1. Route for reset password is incorrectly defined (missing token parameter)
2. Forgot password link is commented out in Login.tsx
3. Some components lack proper loading indicators during API calls
4. Hardcoded API URLs in store files instead of using environment variables
5. Potential memory leaks in useEffect hooks due to missing cleanup functions
6. Missing form validation in several components
7. Inconsistent error handling across components
8. No client-side caching strategy for frequently accessed data
9. Missing type definitions for some function parameters (using 'any')
10. No comprehensive error boundary implementation
11. Some API endpoints have inconsistent naming between client and server
12. Lack of proper state management for deeply nested components
