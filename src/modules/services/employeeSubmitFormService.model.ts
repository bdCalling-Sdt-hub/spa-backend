import mongoose, { Schema, Types } from "mongoose";
import IService from "./services.interface";

interface IEmployeeSubmitFormService {
  serviceId: Types.ObjectId;
  chemicalList: {
    inputType: string;
    chemical: string[];
  };
  providerList: {
    inputType: string;
    provider: string[];
  };
}

const employeeSubmitFormServiceSchema: Schema<IEmployeeSubmitFormService> =
  new mongoose.Schema(
    {
      serviceId: {
        type: Schema.Types.ObjectId,
        ref: "Services",
        required: true,
      },

      chemicalList: {
        inputType: {
          type: String,
          enum:"INPUT",
          default:"INPUT"
        },
        chemical: {
          type: [String],
          required: true,
        },
      },

      providerList: {
        inputType: {
            type: String,
            enum:"CHECKBOX",
            default:"CHECKBOX"
          },
        provider: {
          type: [String],
          required: true,
        },
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IEmployeeSubmitFormService>(
  "EmployeeSubmitFormService",
  employeeSubmitFormServiceSchema
);
