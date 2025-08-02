import { Request } from "express";

export interface CookieUserType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    type: 'BUYER' | 'SELLER';
}

export interface CookieAdminType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    role: { [key: string]: any }
}

export interface AuthenticatedRequest extends Request {
    user?: CookieUserType;
    admin?: CookieAdminType;
}