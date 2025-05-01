import jwt from "jsonwebtoken";
import { IUserDocument } from "../models/user.model";
import { Response } from "express";

interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none' | false;
    maxAge: number;
    path: string;
}

export const generateToken = (res: Response, user: IUserDocument) => {
    // Include additional user info in the payload (but avoid sensitive data)
    const payload = {
        userId: user._id,
        provider: user.authProvider || 'local',
        isAdmin: user.admin || false
    };
    
    // Sign the token with expiration
    const token = jwt.sign(
        payload, 
        process.env.SECRET_KEY!, 
        { expiresIn: '1d' }
    );
    
    // Create secure cookie options
    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/' // Accessible from all paths
    };
    
    // Set the cookie
    res.cookie("token", token, cookieOptions);
    
    return token;
}                                                   