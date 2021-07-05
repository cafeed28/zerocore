import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IPost {
	userName: string,
	post: string,
	accountID: number,
	uploadDate: number,
	likes: number,
	isSpam: boolean,
	postID: number,
}

interface IPostModel extends IPost, Document { }

const PostSchema: Schema = new Schema({
	userName: String,
	post: String,
	accountID: Number,
	uploadDate: Number,
	likes: { type: Number, default: 0 },
	isSpam: { type: Boolean, default: false },
	postID: Number
})

PostSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'postID' })

export const PostModel = mongoose.model<IPostModel>('posts', PostSchema)