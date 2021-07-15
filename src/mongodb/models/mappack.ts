import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IMapPack {
	packID: number,
	packName: string,
	levels: string,
	stars: number,
	coins: number,
	difficulty: number,
	color: string,
	colors2: string
}

interface IMapPackModel extends IMapPack, Document { }

const MapPackSchema: Schema = new Schema({
	packID: { type: Number, unique: true },
	packName: String,
	levels: String,
	stars: Number,
	coins: Number,
	difficulty: Number,
	color: String,
	colors2: { type: String, default: 'none' }
})

MapPackSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'packID', exclusive: false })

export const MapPackModel = mongoose.model<IMapPackModel>('mappacks', MapPackSchema)