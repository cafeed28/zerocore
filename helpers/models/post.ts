import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
	userName: string,
	post: string,
	accountID: string,
	uploadDate: number,
	likes: { type: number, default: 0 },
	isSpam: { type: number, default: 0 },
	postID: { type: number, default: 0 }
}

const PostSchema: Schema = new Schema({
	userName: String,
	post: String,
	accountID: String,
	uploadDate: Number,
	likes: { type: Number, default: 0 },
	isSpam: { type: Number, default: 0 },
	postID: { type: Number, default: 0 }
});

export default mongoose.model<IPost>('accounts', PostSchema);