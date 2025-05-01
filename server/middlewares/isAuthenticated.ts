import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            id?: string;
            admin?: boolean;
        }
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
            return; 
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.SECRET_KEY!) as jwt.JwtPayload;

            if (!decoded || !decoded.userId) {
                res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
                return;
            }
            
            // Set user ID and additional info from token if available
            req.id = decoded.userId;
            
            // Set admin flag if present in the token
            if (decoded.isAdmin === true) {
                (req as any).admin = true;
                console.log(`Setting admin flag to true for user ${req.id}`);
            } else {
                (req as any).admin = false;
                console.log(`User ${req.id} is not an admin`);
            }
            
            // Continue to the next middleware
            next();
        } catch (tokenError) {
            // Handle token verification errors specifically
            if (tokenError instanceof jwt.TokenExpiredError) {
                // Clear the expired token
                res.clearCookie('token');
                res.status(401).json({
                    success: false,
                    message: "Session expired, please log in again"
                });
            } else if (tokenError instanceof jwt.JsonWebTokenError) {
                // Invalid token format or signature
                res.clearCookie('token');
                res.status(401).json({
                    success: false,
                    message: "Invalid authentication token"
                });
            } else {
                // Other JWT errors
                res.status(401).json({
                    success: false,
                    message: "Authentication failed"
                });
            }
        }
    } catch (error) {
        console.error("Authentication Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
