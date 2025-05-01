import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import menuRoute from "./routes/menu.route";
import orderRoute from "./routes/order.route";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./utils/passport";
import validateEnv from "./utils/validateEnv";
// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();

const PORT = process.env.PORT || 3000;

// default middleware for any mern project
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

// Cookie parser with secure settings
app.use(cookieParser(process.env.SECRET_KEY));

// Configure CORS with environment variables
const clientUrls = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:5173", "http://localhost:5174"];
const corsOptions = {
    origin: clientUrls,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions));

// Initialize Passport
app.use(passport.initialize());

// api
app.use("/api/v1/user", userRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/order", orderRoute);

// app.use(express.static(path.join(DIRNAME,"/client/dist")));
// app.use("*",(_,res) => {
//     res.sendFile(path.resolve(DIRNAME, "client","dist","index.html"));
// });

app.listen(PORT, () => {
    // Connect to database
    connectDB();
    
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server listening at port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
})