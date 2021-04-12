import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest extends Document {
	requestID: number,
	isUnread: { type: number, default: 1 },
	fromAccountID: number,
	toAccountID: number,
	message: string
}

const FriendRequestSchema: Schema = new Schema({
	requestID: Number,
	isUnread: { type: Number, default: 1 },
	fromAccountID: Number,
	toAccountID: Number,
	message: String
});

export default mongoose.model<IFriendRequest>('friendRequest', FriendRequestSchema);