var express               = require("express"),
    mongoose              = require("mongoose");
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    methodOverride        = require("method-override"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/algoscale");
var app = express()

app.set('view engine','ejs');
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(require("express-session")({
    secret:"Rusty is the best og in the world",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=======================================================
//                   ROUTES
//=======================================================
app.get("/",function(req,res){
    res.redirect("/register");
});
app.get("/register",function(req,res){
    res.render("signup");
});
app.post("/register",function(req,res){
    User.register(new User({ name : req.body.name,username:req.body.username, email: req.body.email}),req.body.password,  function (err, user) {
        if (err) {
            console.log(err);
            return res.render('signup');
        } //user stragety
        passport.authenticate("local")(req, res, function () {
            res.redirect("/users"); //once the user sign up
        });
    });
});
app.get("/users",isLoggedIn,function(req,res){
    User.find({},function(err,allUsers){
        if(err){
            console.log(err);
        }else{
            res.render("users",{users: allUsers});
        }
    });
});
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/login"
}), function (req, res) {
    res.send("User is " + req.user.id);
});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
app.delete("/users/:id",function(req,res){
    User.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/users");
        }else{
            res.redirect("/users");
        }
    });
});
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

app.listen(4000,function(req,res){
    console.log("Server started at 4000...")
});