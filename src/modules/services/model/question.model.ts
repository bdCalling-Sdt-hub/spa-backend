import mongoose, { Schema, Types } from "mongoose";

interface IQuestion {
  serviceId: Types.ObjectId;
  question: string;
  questionValue: string;
  inputType: string;
}

const questionSchema: Schema<IQuestion> = new mongoose.Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Services",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    questionValue: {
      type: String,
      required: true,
    },
    inputType: {
      type: String,
      enum: ["INPUT", "CHECKBOX"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
