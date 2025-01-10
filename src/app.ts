import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from './routes/user.route.js';


if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();
app.use(
    cors({
        credentials: true,
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use('/api/v1',router)

export default app;