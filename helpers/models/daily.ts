import mongoose, { Schema, Document } from "mongoose";

export interface IDaily extends Document {
	levelID: number,
	timestamp: number,
	type: number
}

const DailySchema: Schema = new Schema({
	levelID: Number,
	timestamp: Number,
	type: Number
});

export default mongoose.model<IDaily>('dailys', DailySchema);