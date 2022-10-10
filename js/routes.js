const { db } = require('./User.js');
const Item = require('./Item');
const Order = require('./Order');
const Cart = require('./Cart');
const products = [];

module.exports = function (app, path, passport) {
    /* Home page routes */
    app.get('/', (req, res) => {
        res.render('index.ejs', { user: req.user });
    });

    app.get('/users', (req, res) => {
        db.collection('users')
            .find()
            .toArray(function (err, docs) {
                res.json(docs);
            });
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs');
    });

    app.post(
        '/local-login',
        passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/401',
        })
    );

    app.post(
        '/local-signup',
        passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: '/401',
        })
    );

    app.get('/logout', function (req, res, next) {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });

    // Login with google
    app.get(
        '/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get(
        '/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/401',
        })
    );

    /* Add items and save into database */
    app.get('/add-item', isLoggedIn, (req, res, next) => {
        res.render('add-product.ejs');
    });

    /* CREATE => items stored in db cluster */
    app.post('/add-item', isLoggedIn, async (req, res) => {
        let body = req.body;
        const newItem = new Item(body);

        try {
            const savedItem = await newItem.save();
            res.status(200).json(savedItem);
        } catch (err) {
            res.status(500).json(err);
        }
    });

    /* /items store added products */
    app.get('/items', (req, res) => {
        res.json(products);
    });

    app.get('/401', (req, res) => {
        res.render('401.ejs');
    });

    app.get('/403', (req, res) => {
        res.render('403.ejs');
    });

    // Cart
    app.get('/cart', isLoggedIn, (req, res, next) => {
        res.render('cart.ejs');
    });

    /*  404 page if a user typed the wrong URL   */
    app.use((req, res, next) => {
        res.status(404).render('404.ejs');
    });
};

/* Check if user is logged in */

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/403');
}
