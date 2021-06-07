import mongoose, { Schema, Document } from "mongoose"
import EActions from "../EActions"

export interface IAction {
    actionType: EActions,
    IP: string,
    timestamp: number,
    accountID?: number,
    itemID?: number,
    itemType?: number
}

interface IActionModel extends IAction, Document { }

const ActionSchema: Schema = new Schema({
    actionType: Number,
    IP: String,
    timestamp: Number,
    accountID: { type: Number, default: 0 },
    itemID: { type: Number, default: 0 },
    itemType: { type: Number, default: 0 }
})

export const ActionModel = mongoose.model<IActionModel>('actions', ActionSchema)