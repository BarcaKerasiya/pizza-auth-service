import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: ["Email is required!", "Invalid email format!"],
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  password: {
    errorMessage: "Password is required!",
    notEmpty: true,
    // isLength: {
    //   options: {
    //     min: 8,
    //   },
    //   errorMessage: "Password length should be at least 8 chars!",
    // },
  },
});
