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

        youtube: String,
        twitter: String, // поменяю на discord когда выйдет blackTea от партура

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

mongoose.model('blocks',
    new Schema({
        blockedID: Number,
        blockerID: Number
    })
);

module.exports = {
    mongoose: mongoose
}