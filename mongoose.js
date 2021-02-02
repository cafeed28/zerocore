const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('accounts',
	new Schema({
		accountID: Number,
		userName: String,
		password: String,
		email: String,
		secret: String
	})
);

mongoose.model('users',
	new Schema({
		userName: String,
		accountID: Number,
		coins: Number,
		userCoins: Number,
		stars: Number,
		diamonds: Number,
		orbs: Number,
		special: Number,
		demons: Number,
		creatorPoints: {
			type: Number,
			default: 0
		},

		chest1Time: Number,
		chest2Time: Number,
		chest1Count: Number,
		chest2Count: Number,

		color1: Number,
		color2: Number,
		icon: Number,
		iconType: Number,

		accIcon: Number,
		accShip: Number,
		accBall: Number,
		accBird: Number,
		accDart: Number,
		accRobot: Number,
		accSpider: Number,
		accGlow: Number,
		accExplosion: Number,

		mS: {
			type: Number,
			default: 0
		},
		frS: {
			type: Number,
			default: 0
		},
		cS: {
			type: Number,
			default: 0
		},
		youtube: {
			type: String,
			default: ''
		},
		twitter: {
			type: String,
			default: ''
		},
		twitch: {
			type: String,
			default: ''
		}, // поменяю на discord когда выйдет blackTea от партура

		IP: String,
		lastPlayed: String,
		isBanned: Boolean,
	})
);

mongoose.model('posts',
	new Schema({
		userName: String,
		post: String,
		accountID: String,
		uploadDate: Number,
		likes: {
			type: Number,
			default: 0
		},
		isSpam: {
			type: Number,
			default: 0
		},
		postID: {
			type: Number,
			default: 0
		}
	})
);

mongoose.model('comments',
	new Schema({
		userName: String,
		comment: String,
		accountID: String,
		uploadDate: Number,
		likes: {
			type: Number,
			default: 0
		},
		isSpam: {
			type: Number,
			default: 0
		},
		commentID: {
			type: Number,
			default: 0
		}
	})
);

mongoose.model('blocks',
	new Schema({
		accountID1: Number,
		accountID2: Number
	})
);

mongoose.model('friendrequests',
	new Schema({
		requestID: Number,
		isUnread: {
			type: Number,
			default: 1
		},
		fromAccountID: Number,
		toAccountID: Number,
		message: String
	})
);

mongoose.model('friends',
	new Schema({
		ID: Number,
		accountID1: Number,
		accountID2: Number,
		isUnread1: {
			type: Number,
			default: 1
		},
		isUnread2: {
			type: Number,
			default: 1
		}
	})
);

mongoose.model('levels',
	new Schema({
		accountID: Number,
		levelID: Number,
		levelName: String,
		levelLength: {
			type: Number,
			default: 0
		},
		levelVersion: {
			type: Number,
			default: 0
		},
		levelDesc: {
			type: String,
			default: ''
		},
		extraString: String,

		audioTrack: Number,
		auto: Number,
		password: Number,
		original: Number,
		twoPlayer: Number,
		songID: {
			type: Number,
			default: 0
		},
		objects: Number,
		coins: Number,
		starCoins: {
			type: Number,
			default: 0
		},
		requestedStars: Number,
		unlisted: Number,
		ldm: Number,

		starDifficulty: {
			type: Number,
			default: 0
		},
		starDemon: {
			type: Number,
			default: 0
		},
		starStars: {
			type: Number,
			default: 0
		},
		starFeatured: {
			type: Number,
			default: 0
		},
		starAuto: {
			type: Number,
			default: 0
		},
		starEpic: {
			type: Number,
			default: 0
		},
		starDemonDiff: {
			type: Number,
			default: 0
		},
		downloads: {
			type: Number,
			default: 0
		},
		likes: {
			type: Number,
			default: 0
		},

		IP: String
	})
);

mongoose.model('songs',
	new Schema({
		songID: Number,
		name: String,
		authorID: Number,
		authorName: String,
		size: Number,
		download: String
	})
);

module.exports = {
	mongoose: mongoose
}