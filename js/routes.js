const { db } = require('./User.js');
const Item = require('./Item');
const Order = require('./Order');
const Cart = require('./Cart');
const itemRequests = require('./itemRequests');
const userRequests = require('./userRequests');
const {ObjectId} = require("mongodb");

module.exports = function (app, path, passport, upload) {
    /* Home page routes */
    app.get('/', async (req, res) => {
        const allItems = await itemRequests.getRandomItems(4);
        res.render('index.ejs', {items: allItems, user: req.user});
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
        res.render('add-item.ejs', { user: req.user });
    });

    app.get('/edit/:id', isLoggedIn, async (req, res) => {
        const item = await itemRequests.getItemById(req.params.id);
        res.render('edit-item.ejs', {user: req.user, item: item})
    })

    /* CREATE => items stored in db cluster */
    app.post('/add-item', isLoggedIn, upload.single('image'), async (req, res) => {
        try {
            let body = req.body;
            const newItem = await new Item({
                title: body.title,
                desc: body.desc,
                size: body.size,
                color: body.color,
                price: body.price,
                url: body.url,
                image: 'https://imgbucket-nwen304.s3.ap-southeast-2.amazonaws.com/'.concat(body.url)
            }).save();
            res.status(200).json({ message: 'New item added to the database' });
        } catch (err) {
            res.status(500);
        }
    });

    app.post('/edit-item/:id', isLoggedIn, upload.single('image'), async (req, res) => {
        var { id } = req.params;
        let body = req.body;

        console.log(body.title)
        db.collection("items").findOneAndUpdate({ _id: ObjectId(id) }, {$set : {
                title: body.title,
                desc: body.desc,
                size: body.size,
                color: body.color,
                price: body.price,
                url: body.url,
                image: 'https://imgbucket-nwen304.s3.ap-southeast-2.amazonaws.com/'.concat(body.url)
            }})
        res.redirect("/");
    });

    app.get('/browse', async (req, res) => {
        const allItems = await itemRequests.getAll();
        res.render('browse.ejs', {items: allItems, user: req.user});
    });

    /* delete/:id it removes an item in the db by it is ID */
    app.get("/delete/:id", isLoggedIn , function(req, res) {
        const ObjectId = require("mongodb").ObjectId;
        var { id } = req.params;
        console.log(id);
        db.collection("items").findOneAndDelete({ _id: ObjectId(id) }, function(error,response){
          if (error){
            throw err;
          } else {
            return res.redirect("/");
          }
        });
      });

    app.get('/401', (req, res) => {
        res.render('401.ejs');
    });

    app.get('/403', (req, res) => {
        res.render('403.ejs');
    });

    // Cart
    app.get('/cart', isLoggedIn, (req, res, next) => {
        res.render('cart.ejs', { user: req.user });
    });

    // order
    app.get('/order', isLoggedIn, (req, res, next) => {
        res.render('order.ejs', { user: req.user });
    });

    // api routes
    app.get('/api/items', async (req, res) => {
        const items = await itemRequests.getAll();
        res.json(items);
    });
    
    app.get('/api/users', async (req, res) => {
        const users = await userRequests.getAll();
        res.json(users);
    })

    app.get('/api/items/:size', async (req, res) => {
        var { size } = req.params;
        const items = await itemRequests.getRandomItems(size);
        res.json(items);
    });
    
    app.get('/api/users/:size', async (req, res) => {
        var { size } = req.params;
        const users = await userRequests.getRandomUsers(size);
        res.json(users);
    })
    
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
    res.status(403).redirect('/403');
}
