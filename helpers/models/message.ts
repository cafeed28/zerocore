import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
	userName: string,
	senderID: number,
	recipientID: number,
	body: string,
	subject: string,
	messageID: string,
	isNew: boolean
}

const MessageSchema: Schema = new Schema({
	userName: String,
	senderID: Number,
	recipientID: Number,
	body: String,
	subject: String,
	messageID: String,
	isNew: Boolean
});

export default mongoose.model<IMessage>('messages', MessageSchema);