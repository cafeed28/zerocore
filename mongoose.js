const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountModel = mongoose.model('accounts',
    new Schema({
        accountID: Number,
        userName: String,
        password: String,
        email: String,
        secret: String
    })
);

const userModel = mongoose.model('users',
    new Schema({
        accountID: Number,
        coins: Number,
        userCoins: Number,
        stars: Number,
        diamonds: Number,
        orbs: Number,
        special: Number,
        demons: Number,
        creatorPoints: Number,

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

        youtube: String,
        twitter: String,
        twitch: String,

        IP: String,
        lastPlayed: String,
        isBanned: Boolean,
    })
);

const postModel = mongoose.model('posts',
    new Schema({
        userName: String,
        comment: String,
        accountID: String,
        uploadDate: String
    })
);

const blockModel = mongoose.model('blocks',
    new Schema({
        blockedID: Number,
        blockerID: Number
    })
);

module.exports = {
    mongoose: mongoose
}