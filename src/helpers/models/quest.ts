import mongoose, { Schema, Document } from "mongoose";

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
});

export const QuestModel = mongoose.model<IQuestModel>('quests', QuestSchema);