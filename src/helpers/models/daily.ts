import mongoose, { Schema, Document } from "mongoose"

export interface IDaily {
	levelID: number,
	feaID: number,
	timestamp: number,
	type: number
}

interface IDailyModel extends IDaily, Document { }

const DailySchema: Schema = new Schema({
	levelID: Number,
	feaID: Number,
	timestamp: Number,
	type: Number
})

export const DailyModel = mongoose.model<IDailyModel>('dailys', DailySchema)