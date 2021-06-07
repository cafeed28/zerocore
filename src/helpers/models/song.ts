import mongoose, { Schema, Document } from "mongoose"

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

export const SongModel = mongoose.model<ISongModel>('songs', SongSchema)