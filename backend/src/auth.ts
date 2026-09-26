import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
export const hashPassword=(p:string)=>bcrypt.hash(p,12);
export const verifyPassword=(p:string,h:string)=>bcrypt.compare(p,h);
export const signToken=(id:string,role:string)=>jwt.sign({sub:id,role},process.env.JWT_SECRET!,{expiresIn:'7d'});
export const verifyToken=(token:string)=>jwt.verify(token,process.env.JWT_SECRET!) as {sub:string;role:string};
