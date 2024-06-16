const {Schema, model} = require('mongoose');

const userSchema = Schema({

    name: {
        type: String,
        required: true
    },
    surname: String,
    bio: String,
    nick: {
        type: String,
        required: true, 
        
    },
    email:
    {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'role-user'
    },
    image: {
        type: String,
        default: "default.jpg"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('User', userSchema, 'users');