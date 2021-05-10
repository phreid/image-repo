const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.statics.login = async function (username, password) {
    let foundUser = null;
    const user = await this.findOne({username});
    if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
            foundUser = user;
        }
    }

    return foundUser;
}

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User', userSchema);