import mongoose, { Schema, Document } from "mongoose";

export interface IBlock {
	accountID1: number,
	accountID2: number,
	isUnread1?: boolean,
	isUnread2?: boolean
}

interface IBlockModel extends IBlock, Document { }

const BlockSchema: Schema = new Schema({
	accountID1: Number,
	accountID2: Number,
	isUnread1: Boolean,
	isUnread2: Boolean
});

export const BlockModel = mongoose.model<IBlockModel>('blocks', BlockSchema);