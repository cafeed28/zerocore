import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest {
	requestID: number,
	isUnread?: number,
	fromAccountID: number,
	toAccountID: number,
	message: string,
	uploadDate: number
}

interface IFriendRequestModel extends IFriendRequest, Document { }

const FriendRequestSchema: Schema = new Schema({
	requestID: Number,
	isUnread: { type: Number, default: 1 },
	fromAccountID: Number,
	toAccountID: Number,
	message: String,
	uploadDate: Number
});

export const FriendRequestModel = mongoose.model<IFriendRequestModel>('friendRequest', FriendRequestSchema);