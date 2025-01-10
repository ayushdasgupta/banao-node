import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from "../utils/asyncHandler.js";
const prisma = new PrismaClient();

export const isAuth = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Access denied. Please log in." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };


        const user = await prisma.user.findUnique({ where: { id: decoded.id! } });
        if (!user) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }
        
        req.user = user;
        next();
    } catch (error) {

        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
})