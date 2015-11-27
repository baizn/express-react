let Mongoose = require('mongoose');

let characterSchema = new Mongoose.Schema({
    characterId: {
        type: String,
        unique: true,
        index: true
    },
    name: String,
    race: String,
    gender: String,
    bloodline: String,
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    reports: {
        type: Number,
        default: 0
    },
    random: {
        type: [Number],
        index: '2d'
    },
    voted: {
        type: Boolean,
        default: false
    }
});

export default Mongoose.model('Character', characterSchema);
