import express from "express";
import authController from "../controllers/auth.js";
import User from "../models/user.js";
import { check, body } from "express-validator";
const router = express.Router();

router.get("/login", authController.getLoginPage);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter valid email"),

    body("password", "password is to be valid")
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDocs) => {
          if (userDocs) {
            return Promise.reject(
              "Email exist Already, please pick different one"
            );
          }
        });
      }),
    body("name", "please enter valid name")
      .isLength({ min: 3 })
      .isAlphanumeric(),
    body("contact", "please enter only 10 digites contact no.").isLength({
      min: 10,
      max: 10,
    }),
    body("address", "Please Enter valid Address").isLength({ min: 10 }),
    body(
      "password",
      "please enter a password Only Alphanumeric and atleast 5 character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.get("/reset/:token", authController.getpasswordform);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.post("/new-password", authController.postNewPassword);

export default { router };
