const express = require("express");
const {loginAdmin} = require("../controllers/adminControllers");
const router = express.Router();


router.post("/adminlog",loginAdmin);
module.exports = router;