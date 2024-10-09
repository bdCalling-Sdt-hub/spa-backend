import mongoose, { Schema } from "mongoose";
import IService from "./services.interface";


const serviceSchema:Schema<IService> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        publicFileURL: {
            type: String,
            required: true,
            default: "images/users/service.png"
        },
        path: {
            type: String,
            required: true,
            default: "public\\images\\users\\service.png"
        }
    },
    type:{
        type: String,
        required: true,
        enum: ["POOL_CLEANING", "POOL_REMODELING", "SPA_SERVICE","OTHERS"]
    },
    isDelete: {
        type: Boolean,
        default: false
    }
},

{
    timestamps: true
}

)

export default mongoose.model<IService>("Services", serviceSchema);