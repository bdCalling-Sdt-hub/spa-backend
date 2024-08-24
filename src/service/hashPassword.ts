
import { compare, genSaltSync, hash } from "bcrypt";
import config from "../config";


const salt = genSaltSync(Number(config.bcryptSaltRounds));
console.log("config.bcryptSaltRounds: ", salt) ;


export async function hashPassword(password: string) {
    return await hash(password, salt);
}

export async function comparePassword(password: string, hashPassword: string) {
    return await compare(password, hashPassword);
}