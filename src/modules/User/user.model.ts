import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import IUser from "./user.interface";
import config from "../../config";

const userSchema: Schema<IUser> = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Name is required"],
        minlength: 3,
        maxlength: 30,
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        minlength: 3,
        maxlength: 30,
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
          validator: function (v: string) {
            return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
          },
          message: "Please enter a valid Email",
        },
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 3,
        set: (v: string) => bcrypt.hashSync(v, bcrypt.genSaltSync(Number(config.bcryptSaltRounds))),
      },
      dateOfBirth: { type: String, required: false },
      phone: { type: String, required: false },
      address: { type: String, required: false },
      privacyPolicyAccepted: { type: Boolean, default: false, required: false },
      isAdmin: { type: Boolean, default: false },
      isProfileCompleted: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      isDeleted: { type: Boolean, default: false },
      isBlocked: { type: Boolean, default: false },
      image: {
        type: Object,
        required: false,
        default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" },
      },
      licenceFront:{
        type: Object,
        required: false,
        default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" },
      },
      licenceBack: {
        type: Object,
        required: false,
        default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" },
      },
      role: { type: String, required: false, enum: ["USER", "EMPLOYEE", "ADMIN", "MANAGER"], default: "ADMIN" },
      oneTimeCode: { type: Number, required: false, default: null },
    },
    {
      toJSON: {
        transform(doc, ret) {
          delete ret.password;
        },
      },
      timestamps: true,
    }
  );
  
  export default mongoose.model<IUser>("User", userSchema);