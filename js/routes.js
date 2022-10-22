const { db } = require('./User.js');
const Item = require('./Item');
const User = require('./User');
const Order = require('./Order');
const Cart = require('./Cart');
const itemRequests = require('./itemRequests');
const userRequests = require('./userRequests');
const {ObjectId} = require("mongodb");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");

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

    app.get('/forgotPassword',async (req, res) => {
        res.render('forgotPassword')
    })

    app.post('/sendForgotPasswordEmail', upload.single('image'), async(req, res) => {
        let body = req.body.email;
        const token = crypto.randomBytes(20).toString('hex');
        await User.findOneAndUpdate({'local.email': body}, {$set : {'resetPasswordToken': token}})
        const user = await User.findOne({'local.email': body})
        if(user === null){
            res.render('500');
        } else {
            const transporter = nodemailer.createTransport({
                service: 'outlook',
                auth: {
                    user: 'NWEN304@outlook.com',
                    pass: 'CoolAsCode12!'
                }
            });

            const mailOptions = {
                from: 'NWEN304@outlook.com',
                to: `${user.local.email}`,
                subject: 'Reset Email',
                text: `localhost:3000/resetPassword/${user._id}/${user.resetPasswordToken}`
            };

            await transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.render('404')
                } else {
                    console.log('Email sent: ' + info.response);
                    res.render('emailSent.ejs')
                }
            });
        }
    })

    app.get('/resetPassword/:id/:resetToken', async (req, res) => {
        const user = await User.findOne({_id: req.params.id})
        if(user.resetPasswordToken === req.params.resetToken){
            res.render('resetPassword.ejs', {id:req.params.id, resetToken:req.params.resetToken})
        }else{
            res.render('403.ejs')
        }
    })

    app.post('/changePassword/:id/:resetToken', async (req, res) => {
        await User.findOneAndUpdate({_id: req.params.id}, {$set : {'local.password': bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)}})
        await User.findOneAndUpdate({_id: req.params.id}, {$set : {resetPasswordToken: null}})
        const c = User.findOne({_id: req.params.id})
        res.redirect('/');
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
