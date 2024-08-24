import mongoose, { Schema } from "mongoose";

interface ISettings {
    content: string
}

const privacySchema : Schema<ISettings> = new mongoose.Schema({
     content: { type: String, required: [true, 'Content is must be Required'] },
},
{
    timestamps: true,
}
);

export default mongoose.model<ISettings>('Privacy', privacySchema);