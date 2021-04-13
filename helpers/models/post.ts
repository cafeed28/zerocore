import mongoose, { Schema, Document } from "mongoose";

export interface IPost {
	userName: string,
	post: string,
	accountID: number,
	uploadDate: number,
	likes?: number,
	isSpam?: number,
	postID: number,
}

interface IPostModel extends IPost, Document { }

const PostSchema: Schema = new Schema({
	userName: String,
	post: String,
	accountID: Number,
	uploadDate: Number,
	likes: { type: Number, default: 0 },
	isSpam: { type: Number, default: 0 },
	postID: { type: Number, default: 0 }
});

export const PostModel = mongoose.model<IPostModel>('accounts', PostSchema);