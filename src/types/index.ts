import { Request } from "express";

export interface Userdata {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface RegisterUserRequest extends Request {
  body: Userdata;
}
