import { NextFunction, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler.js";
const prisma = new PrismaClient();

export const userRegister = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username or email already taken."
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            },
        });
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ success: true, message: "User registered successfully.", user: userWithoutPassword });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
})

export const userLogin = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid username or password." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid username or password." });
        }

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!);
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).cookie("token", token, options).json({ success: true, message: "Login successful.", token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
})

export const userlogout = asyncHandler(async (req: Request, res: Response) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
})

export const currentuser = asyncHandler(async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found.",
            });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
})

export const forgotpassword = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, username, newPassword } = req.body;

        if (!email || !newPassword || !username) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        const user = await prisma.user.findFirst({
            where: {
                AND: [{ username }, { email }],
            },
        });
        if (!user) {
            return res.status(400).json({ success: false, error: "User with this email and username does not exist." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        res.status(200).json({ success: true, message: "Password updated successfully." });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
})