//jshint esversion:6


const passport = require("passport");


exports.login_controller_get = function(req, res){

  if (req.isAuthenticated()) {
    res.render("home", {logmethod: "Log Out"});
  } else {
    res.render("login", {logmethod: "Log In"});
  }

};

const Usuario = require(__dirname+"/../models/Usuario");





exports.login_controller_post = function(req, res){
  const user = new Usuario({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        if (req.user.esAdmin === true) {
          res.redirect("/admin");
        } else if (req.user.esAdmin === false) {
          res.redirect("/usrhome");
        }

      });
    }
  });

};

exports.logout_controller_get = function(req, res){
  req.logout();
  res.redirect("/");
};
