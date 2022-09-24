const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialise(passport, getUserByName, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = getUserByName(username)
        if (user == null) {
            return done(null, false, { message: 'No user with the username' })
        }

        try {
            if (await bcrypt.compare((password), user.password)) {
                return done(null, user, { message: 'Login successful' })
            } else {
                return done(null, false, { message: 'Password or username are incorrect' })
            }
        } catch (error) {
            return done(error)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser))
    passport.serializeUser((user, done) => { done(null, user.id) })
    passport.deserializeUser((id, done) => { 
        return done(null, getUserById(id))
    })
}

module.exports = initialise