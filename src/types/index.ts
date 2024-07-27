import { Request } from "express";

export interface Userdata {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}
export interface RegisterUserRequest extends Request {
  body: Userdata;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
  };
}

export interface AuthCookies {
  accessToken: string;
  refreshToken: string;
}

export interface IrefrshToeknPayload {
  id: string;
}
