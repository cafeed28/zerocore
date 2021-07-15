import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IComment {
	commentID: number,
	userName: string,
	comment: string,
	accountID: number,
	levelID: number,
	percent: number,
	uploadDate: number,
	likes: number,
	isSpam: number
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
	commentID: { type: Number, unique: true }
})

CommentSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'commentID' })

export const CommentModel = mongoose.model<ICommentModel>('comments', CommentSchema)