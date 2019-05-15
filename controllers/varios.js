//jshint esversion:6

const Producto = require(__dirname+"/../models/Producto");


exports.comofunciona_controller_get = function(req, res) {
  if (req.isAuthenticated()) {
    return res.render("comofunciona", {logmethod: "Logout"});
  } else {
    return res.render("comofunciona", {logmethod: "Login"});
  }
};

exports.beneficios_controller_get = function(req, res) {
  if (req.isAuthenticated()) {
    return res.render("beneficios", {logmethod: "Logout"});
  } else {
    return res.render("beneficios", {logmethod: "Login"});
  }
};

exports.canjea_controller_get = function(req, res){
    Producto.find({}, function(err, docs){
      if (err) {
        return err;
      } else if (req.isAuthenticated()) {
        return res.render("canjea", {docs: docs, logmethod: "Logout"});
      } else{
        return res.render("canjea", {docs: docs, logmethod: "Login"});
      }
    });
};

exports.canjeaesp_controller_get = function(req, res){

  Producto.findById(req.params.idObjeto, function(err, doc){
    if (err) {
      console.log(err);
      return err;
    } else if (!doc) {
      return "Doc was not found";
    } else {
        if (req.isAuthenticated()) {
          return res.render("canjeaesp", {doc: doc, logmethod: "Logout"});
        } else {
          return res.render("canjeaesp", {doc: doc, logmethod: "Login"});
        }
    }
  });
};
