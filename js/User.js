var mongoose = require('mongoose');
const bcrypt = require("bcrypt");

var userSchema = mongoose.Schema({
    local: {
        id:         String,
        email:      String,
        username:   String,
        password:   String
    },
    google: {
        id:         String,
        token:      String,
        email:      String,
        username:   String,
    },
    resetPasswordToken: String
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
}

module.exports = mongoose.model('User', userSchema)