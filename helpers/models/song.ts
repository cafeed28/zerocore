import mongoose, { Schema, Document } from "mongoose";

export interface ISong extends Document {
	songID: number,
	name: string,
	authorID: number,
	authorName: string,
	size: number,
	download: string
}

const SongSchema: Schema = new Schema({
	songID: Number,
	name: String,
	authorID: Number,
	authorName: String,
	size: Number,
	download: String
});

export default mongoose.model<ISong>('songs', SongSchema);