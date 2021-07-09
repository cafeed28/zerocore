import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IQuest {
	questID: number,
	questName: string,
	type: number,
	amount: number,
	reward: number
}

interface IQuestModel extends IQuest, Document { }

const QuestSchema: Schema = new Schema({
	questID: Number,
	questName: String,
	type: Number,
	amount: Number,
	reward: Number
})

QuestSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'questID' })

export const QuestModel = mongoose.model<IQuestModel>('quests', QuestSchema)