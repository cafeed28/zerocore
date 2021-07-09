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
	songID: Number,
	name: String,
	authorID: Number,
	authorName: String,
	size: Number,
	download: String
})

SongSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'songID' })

export const SongModel = mongoose.model<ISongModel>('songs', SongSchema)