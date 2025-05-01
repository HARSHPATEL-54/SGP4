//mongopassword=d2gC8yvBs8c4Qh8E
//22cs054

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('mongoDB connected.');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;