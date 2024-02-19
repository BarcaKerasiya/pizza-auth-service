import { body, checkSchema } from "express-validator";

// export default [body("email").notEmpty().withMessage("Email is required!")];

export default checkSchema({
  email: {
    errorMessage: "Email is required!",
    notEmpty: true,
  },
});
