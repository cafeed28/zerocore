import mongoose, { Schema, Document } from "mongoose";

export interface IBlock extends Document {
	accountID1: number,
	accountID2: number
}

const BlockSchema: Schema = new Schema({
	accountID1: Number,
	accountID2: Number
});

export default mongoose.model<IBlock>('blocks', BlockSchema);