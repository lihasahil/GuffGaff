import { Response } from "express";
import jwt from "jsonwebtoken";
interface GenerateTokenProps {
  userId: string;
  res: Response;
}

export const generateToken = ({ userId, res }: GenerateTokenProps): string => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return token;
};
