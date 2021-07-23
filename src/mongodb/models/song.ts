import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface ISong {
	songID: number,
	name: string,
	authorID: number,
	authorName: string,
	size: number,
	download: string
}

interface ISongModel extends ISong, Document { }

const SongSchema: Schema = new Schema({
	songID: { type: Number, unique: true },
	authorID: Number,
	size: Number,
	name: { type: String, required: true },
	authorName: { type: String, required: true },
	download: { type: String, required: true }
})

SongSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'songID', start_seq: 500000 })

export const SongModel = mongoose.model<ISongModel>('songs', SongSchema)