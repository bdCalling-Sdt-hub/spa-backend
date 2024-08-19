import { genSaltSync, hash, compare } from "bcryptjs";
import config from "../config";


const salt = genSaltSync(Number(config.bcryptSaltRounds));

export async function hashPassword(password: string) {
    return await hash(password, salt);
}

export async function comparePassword(password: string, hashPassword: string) {
    return await compare(password, hashPassword);
}