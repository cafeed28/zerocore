import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
	userName: string,
	comment: string,
	accountID: number,
	levelID: number,
	percent: number,
	uploadDate: number,
	likes?: number,
	isSpam?: number,
	commentID: number
}

interface ICommentModel extends IComment, Document { }

const CommentSchema: Schema = new Schema({
	userName: String,
	comment: String,
	accountID: Number,
	levelID: Number,
	percent: Number,
	uploadDate: Number,
	likes: { type: Number, default: 0 },
	isSpam: { type: Number, default: 0 },
	commentID: Number
});

export const CommentModel = mongoose.model<ICommentModel>('comments', CommentSchema);