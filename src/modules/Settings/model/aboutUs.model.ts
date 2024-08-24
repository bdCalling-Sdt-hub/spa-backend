import mongoose, { Schema } from "mongoose";

interface ISettings {
    content: string
}

const aboutSchema : Schema<ISettings> = new mongoose.Schema({
     content: { type: String, required: [true, 'Content is must be Required'] },
},
{
    timestamps: true,
}
);


export default mongoose.model<ISettings>('About', aboutSchema);