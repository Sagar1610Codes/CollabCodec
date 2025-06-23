import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    githubId : {    // for github OAuth
        type : String
    },
    googleId : {    // for google OAuth
        type : String
    },
    avatarUrl : {
        type : String
    }
},{
    timestamps : true
})

export const User = mongoose.model("User", UserSchema)