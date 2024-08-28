import mongoose, { Schema, Types } from "mongoose";

interface IWorkSubmit {
  workNote: string;
  inputField: {
    question: Types.ObjectId;
    answer: string;
  }[];
  checkBoxField: {
    question: Types.ObjectId;
    answer: string;
  }[];
  assignAppointmentId: Types.ObjectId;
  images: {
    publicFileURL: string;
    path: string;
  }[];
}

const workSubmitSchema: Schema<IWorkSubmit> = new mongoose.Schema(
  {
    workNote: {
      type: String,
      required: true,
    },
    inputField: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    checkBoxField: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    assignAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: "AssignEmployee",
      required: true,
    },
    images: [
      {
        type: Object,
        required: false,
        default: {
          publicFileURL:"images/users/user.png",
          path: "public\\images\\users\\user.png",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWorkSubmit>("WorkSubmit", workSubmitSchema);
