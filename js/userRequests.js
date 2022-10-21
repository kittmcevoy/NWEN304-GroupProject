const User = require('./User');

class UserRequests {
    async getAll() {
        return await User.find();
    }

    async getRandomUsers(size) {
        let users = await User.find();
        users.sort((a, b) => 0.5 - Math.random());
        while (users.length > size) {
            users.pop();
        }
        return users;
    }
}

module.exports = new UserRequests();