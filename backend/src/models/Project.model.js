import mongoose from "mongoose";
import { User } from "./User.model";

const ProjectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
    },
    files: [ // we are storing path, on frontend we will files.path.split('/') then we make the folders as well
        {
            path: String,
            content: String
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : User,
        required : true,
    },
    collaborators : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : User,
            },
            permission : {
                type : String,
                enum : ["read","write"],
                default : "write",
            }
        }
    ]
},{
    timestamps : true
})

export const Project = mongoose.model("Project", ProjectSchema)
