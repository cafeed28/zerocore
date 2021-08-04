import mongoose, { Schema, Document } from 'mongoose'

export interface IClanAssign {
    accountID: number,
    clanName: string
}

interface IClanAssignModel extends IClanAssign, Document { }

const ClanSchema: Schema = new Schema({
    accountID: { type: Number },
    clanName: { type: String }
})

export const ClanAssignModel = mongoose.model<IClanAssignModel>('clanassigns', ClanSchema)