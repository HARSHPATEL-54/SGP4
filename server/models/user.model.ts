import mongoose, { Document, Model } from "mongoose";

export interface IUser {
    fullname:string;
    email:string;
    password?:string;
    contact:number;
    address:string;
    city:string;
    country:string;
    profilePicture:string;
    admin:boolean;
    lastLogin?: Date;
    isVerified?: boolean;
    resetPasswordToken?:string;
    resetPasswordTokenExpiresAt?:Date;
    verificationToken?:string;
    verificationTokenExpiresAt?:Date;
    googleId?:string;
    authProvider?:string;
}

export interface IUserDocument extends IUser, Document {
    createdAt:Date;
    updatedAt:Date;
}

const userSchema = new mongoose.Schema<IUserDocument>({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not using Google OAuth
        }
    },
    contact: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        default: "Update your address"
    },
    city:{
        type:String,
        default:"Update your city"
    },
    country:{
        type:String,
        default:"Update your country"
    },
    profilePicture:{
        type:String,
        default:"",
    },
    admin:{type:Boolean, default:false},
    // advanced authentication
    lastLogin:{
        type:Date,
        default:Date.now
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken:String,
    resetPasswordTokenExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt:Date,
    googleId: String,
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
},{timestamps:true});

export const User : Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema);