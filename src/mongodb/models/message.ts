import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IMessage {
	messageID: number,
	userName: string,
	senderID: number,
	recipientID: number,
	body: string,
	subject: string,
	uploadDate: number,
	isUnread: boolean
}

interface IMessageModel extends IMessage, Document { }

const MessageSchema: Schema = new Schema({
	messageID: Number,
	userName: String,
	senderID: Number,
	recipientID: Number,
	body: String,
	subject: String,
	uploadDate: Number,
	isUnread: { type: Boolean, default: true }
})

MessageSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'messageID' })

export const MessageModel = mongoose.model<IMessageModel>('messages', MessageSchema)