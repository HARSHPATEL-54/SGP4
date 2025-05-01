import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cloudinary from "../utils/cloudinary";
import { generateVerificationCode } from "../utils/generateVerificationCode";
import { generateToken } from "../utils/generateToken";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email";
import passport from '../utils/passport';
import { Order } from "../models/order.model";

// User Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullname, email, password, contact } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ success: false, message: "User already exists with this email" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationCode();

        user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            contact: Number(contact),
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        generateToken(res, user);
        await sendVerificationEmail(email, verificationToken);

        const userWithoutPassword = await User.findOne({ email }).select("-password");
        res.status(201).json({ success: true, message: "Account created successfully", user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// User Login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ success: false, message: "Incorrect email or password" });
            return;
        }

        // Check if this is a Google OAuth user
        if (user.authProvider === 'google') {
            res.status(400).json({ 
                success: false, 
                message: "This account uses Google Sign-In. Please login with Google.",
                isGoogleUser: true
            });
            return;
        }

        // For regular users, verify password
        if (!user.password || !(await bcrypt.compare(password, user.password))) {
            res.status(400).json({ success: false, message: "Incorrect email or password" });
            return;
        }

        generateToken(res, user);
        user.lastLogin = new Date();
        await user.save();

        const userWithoutPassword = await User.findOne({ email }).select("-password");
        res.status(200).json({ success: true, message: `Welcome back ${user.fullname}`, user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Email Verification
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { verificationCode } = req.body;
        const user = await User.findOne({
            verificationToken: verificationCode,
            verificationTokenExpiresAt: { $gt: Date.now() },
        }).select("-password");

        if (!user) {
            res.status(400).json({ success: false, message: "Invalid or expired verification token" });
            return;
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.fullname);
        res.status(200).json({ success: true, message: "Email verified successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// User Logout
export const logout = async (_: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token").status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ success: false, message: "User doesn't exist" });
            return;
        }

        const resetToken = crypto.randomBytes(40).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        await sendPasswordResetEmail(user.email, `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordTokenExpiresAt: { $gt: Date.now() } });

        if (!user) {
            res.status(400).json({ success: false, message: "Invalid or expired reset token" });
            return;
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Check Authentication
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.id).select("-password");

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.id;
        const { fullname, email, address, city, country, profilePicture } = req.body;

        let cloudResponse: any;
        if (profilePicture) {
            cloudResponse = await cloudinary.uploader.upload(profilePicture);
        }

        const updatedData = {
            fullname,
            email,
            address,
            city,
            country,
            profilePicture: cloudResponse?.secure_url || profilePicture,
        };

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");

        res.status(200).json({ success: true, user, message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Google OAuth Login - This initiates the Google OAuth flow
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth Callback - This is where Google redirects after authentication
export const googleCallback = (req: Request, res: Response): void => {
    passport.authenticate('google', { session: false }, async (err: Error, user: any) => {
        if (err) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=Google authentication failed`);
        }
        
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=User not found`);
        }
        
        try {
            // Generate JWT token
            generateToken(res, user);
            
            // Redirect to frontend with success
            res.redirect(`${process.env.FRONTEND_URL}?googleLoginSuccess=true`);
        } catch (error) {
            console.error('Error during Google authentication callback:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication error`);
        }
    })(req, res);
};

// Get All Orders for Admin Users
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if the requesting user is an admin
        const user = await User.findById(req.id);
        if (!user || !user.admin) {
            res.status(403).json({ success: false, message: "Not authorized to access all orders" });
            return;
        }

        // Fetch all orders with populated data
        const orders = await Order.find({})
            .populate('user', 'fullname email contact')
            .populate('restaurant', 'restaurantName image')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({ 
            success: true, 
            message: "All orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
