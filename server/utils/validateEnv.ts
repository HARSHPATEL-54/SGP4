/**
 * Utility function to validate required environment variables
 * Helps prevent server startup with missing critical configuration
 */

export const validateEnv = (): boolean => {
  const requiredEnvVars = [
    'PORT', 
    'MONGO_URI', 
    'SECRET_KEY',
    'FRONTEND_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL'
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingEnvVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    console.error('Please set these variables in your .env file');
    return false;
  }

  // Validate the JWT secret key strength
  if (process.env.SECRET_KEY && process.env.SECRET_KEY.length < 32) {
    console.warn('Warning: SECRET_KEY should be at least 32 characters long for better security');
  }

  // Validate Google OAuth URLs
  if (!process.env.GOOGLE_CALLBACK_URL?.includes('/auth/google/callback')) {
    console.warn('Warning: GOOGLE_CALLBACK_URL should contain /auth/google/callback');
  }

  return true;
};

export default validateEnv;
