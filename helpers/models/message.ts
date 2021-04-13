import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
	userName: string,
	senderID: number,
	recipientID: number,
	body: string,
	subject: string,
	messageID?: number,
	uploadDate: number,
	isUnread?: boolean
}

interface IMessageModel extends IMessage, Document { }

const MessageSchema: Schema = new Schema({
	userName: String,
	senderID: Number,
	recipientID: Number,
	body: String,
	subject: String,
	messageID: Number,
	uploadDate: Number,
	isUnread: { type: Boolean, default: true }
});

export const MessageModel = mongoose.model<IMessageModel>('messages', MessageSchema);