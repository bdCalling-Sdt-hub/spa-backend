import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import config from "../config";
dotenv.config();

export type TokenData = {
  id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};



const secret = config.jwtAccessSecret as string;
if (!secret) throw new Error("JWT_SECRET is not defined");
const expiresInOneHour = 36000; 

export function generateToken({ id, name, email, role }:Omit<TokenData, "iat" | "exp">) {
  return sign({ id,name, email, role }, secret,{expiresIn: expiresInOneHour});
}


export function verifyToken(token: string) {
  try {
    return verify(token, secret) as TokenData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const expiresInOneHourForLogin = 365 * 24 * 60 * 60; 
export function generateTokenForLogin({ id, name, email, role }:Omit<TokenData, "iat" | "exp">) {
  return sign({ id,name, email, role }, secret,{expiresIn: expiresInOneHourForLogin});
}