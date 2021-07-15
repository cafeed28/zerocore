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
	postID: { type: Number, unique: true },
	userName: String,
	post: String,
	accountID: Number,
	uploadDate: Number,
	likes: { type: Number, default: 0 },
	isSpam: { type: Boolean, default: false }
})

PostSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'postID' })

export const PostModel = mongoose.model<IPostModel>('posts', PostSchema)