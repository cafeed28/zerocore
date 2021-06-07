import mongoose, { Schema, Document } from "mongoose"

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
	packID: Number,
	packName: String,
	levels: String,
	stars: Number,
	coins: Number,
	difficulty: Number,
	color: String,
	colors2: { type: String, default: 'none' }
})

export const MapPackModel = mongoose.model<IMapPackModel>('mappacks', MapPackSchema)