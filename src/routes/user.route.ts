import express from "express";
import { currentuser, forgotpassword, userLogin, userlogout, userRegister } from "../controller/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.route("/register").post(userRegister)
router.route("/login").post(userLogin)
router.route("/logout").get(userlogout)
router.route("/forgot/password").put(forgotpassword)
router.route("/current/user").get(isAuth,currentuser)

export default router;