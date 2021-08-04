import mongoose, { Schema, Document } from 'mongoose'
import UniqueValidator from 'mongoose-unique-validator'

export interface IClan {
    clanAccountID: number,
    clanName: string,
    badgeUrl: string
}

interface IClanModel extends IClan, Document { }

const ClanSchema: Schema = new Schema({
    clanAccountID: { type: Number, unique: true },
    clanName: { type: String, unique: true, required: true },
    badgeUrl: String
})

ClanSchema.plugin(UniqueValidator, { message: '{PATH}' })

export const ClanModel = mongoose.model<IClanModel>('clans', ClanSchema)