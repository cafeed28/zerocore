import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IDaily {
	levelID: number,
	feaID: number,
	timestamp: number,
	type: number
}

interface IDailyModel extends IDaily, Document { }

const DailySchema: Schema = new Schema({
	levelID: Number,
	feaID: { type: Number, unique: true },
	timestamp: Number,
	type: Number
})

DailySchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'feaID' })

export const DailyModel = mongoose.model<IDailyModel>('dailys', DailySchema)