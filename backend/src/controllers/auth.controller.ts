import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { loginSchema, registerSchema } from "./../schema/validation-schema";
import { Request, Response } from "express";
import { generateToken } from "../lib/utils";
import z from "zod";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  try {
    const newUser = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: newUser.email });

    if (existingUser) {
      return res.status(409).json({ message: " Email Already Exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashedPassword;

    await User.create(newUser);

    return res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.log("Error is Sign Up controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const loginCredentials = loginSchema.parse(req.body);
    const { email, password } = loginCredentials;

    const user = (await User.findOne({ email })) as typeof User & {
      _id: any;
      password: string;
      fullName: string;
      email: string;
      profilePic?: string;
    };

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    generateToken({ userId: (user._id as any).toString(), res });

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    console.log("Error in logout controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { profilePic } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profilePic", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth route", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
