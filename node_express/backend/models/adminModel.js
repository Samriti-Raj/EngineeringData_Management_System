const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    username : {
        type: String,
        required: [true,"Please add the user name"],
    },
    email : {
        type: String,
        required: [true,"Please add the email"],
        unique: [true,"Email already registered"],
    },
    password : {
        type: String,
        required: [true,"Please add the password"],
    },
}, {
    timestamps: true,
   }
);

module.exports=mongoose.model("Admin",adminSchema);