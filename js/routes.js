const { db } = require("./User.js");
const Item = require('./Item');
const Order = require('./Order');
const products = [];

module.exports = function (app, path, passport) {
  /* Home page routes */
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views/index.html"));
  });

  app.get("/users", (req, res) => {
    db.collection('users').find().toArray(function(err, docs) {
      res.json(docs);
    })
  });

  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views/login.html"));
  });

  app.post(
    "/local-login",
    passport.authenticate("local-login", {
      successRedirect: "/",
      failureRedirect: "/401",
    })
  );

  app.post(
    "/local-signup",
    passport.authenticate("local-signup", {
      successRedirect: "/",
      failureRedirect: "/401",
    })
  );

  app.get("/401", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views/401.html"));
  });

  app.post("/logout", (req, res, next) => {
    req.logout();
    req.redirect("/");
  });

  // Login with google
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/401",
    })
  );

  /* admin/add-product GET method */
  app.get("/admin/add-product", (req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "views", "add-product.html"));
  });

  // /* admin/add-product POST method */
  // app.post("/admin/add-product", (req, res, next) => {
  //   products.push({
  //     title: req.body.title,
  //     description: req.body.description,
  //     price: req.body.Price,
  //   });
  //   res.redirect("/");
  // });

  /* /products store added products */
  app.get("/products", (req, res) => {
    res.json(products);
  });

  /* CREATE => items stored in db cluster */  
  app.post("/admin/add-product", async (req, res) =>{
    let body = req.body;
    const newItem = new Item(body)

    try{
        const savedItem = await newItem.save();
        res.status(200).json(savedItem);

    }catch(err){
        res.status(500).json(err)
    }
})

  /*  404 page if a user typed the wrong URL   */
  app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
  });
};

/* Check if user is logged in */

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
