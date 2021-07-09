import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IGauntlet {
	packID: number,
	levelID1: number,
	levelID2: number,
	levelID3: number,
	levelID4: number,
	levelID5: number
}

interface IGauntletModel extends IGauntlet, Document { }

const GauntletSchema: Schema = new Schema({
	packID: Number,
	levelID1: Number,
	levelID2: Number,
	levelID3: Number,
	levelID4: Number,
	levelID5: Number
})

GauntletSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'packID' })

export const GauntletModel = mongoose.model<IGauntletModel>('gauntlets', GauntletSchema)