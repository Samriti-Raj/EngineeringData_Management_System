const express = require("express");
const {loginUser,forgetPassword} = require("../controllers/userControllers");
const router = express.Router();


router.post("/userlog",loginUser);
router.post("/reset-password",forgetPassword);

module.exports = router;