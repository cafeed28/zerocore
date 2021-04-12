import mongoose, { Schema, Document } from "mongoose";

export interface ICommentAssign extends Document {
	userName: string,
	comment: string,
	accountID: number,
	levelID: number,
	percent: number,
	uploadDate: number,
	likes: { type: number, default: 0 },
	isSpam: { type: number, default: 0 },
	commentID: { type: number, default: 0 }
}

const CommentAssignSchema: Schema = new Schema({
	userName: String,
	comment: String,
	accountID: Number,
	levelID: Number,
	percent: Number,
	uploadDate: Number,
	likes: { type: Number, default: 0 },
	isSpam: { type: Number, default: 0 },
	commentID: { type: Number, default: 0 }
});

export default mongoose.model<ICommentAssign>('comments', CommentAssignSchema);