const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username : {
        type: String,
        required: [true,"Please add the user name"],
    },
    fullName : {
        type: String,
        required: [true,"Please add the user full name"],
    },
    password : {
        type: String,
        required: [true,"Please add the password"],
    },
    confirmPassword : {
        type: String,
        required: [true,"Please add the password"],
    },
    hostName : {
        type: String,
        required: [true,"Please add the host name"],
    },
    email : {
        type: String,
        required: [true,"Please add the email"],
        unique: [true,"Email already registered"],
    },
    phoneNumber : {
        type: String,
        required: [true,"Please add the phone number"],
    },
}, {
    timestamps: true,
   }
);

module.exports=mongoose.model("User",userSchema);