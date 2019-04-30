//jshint esversion:6
const passport = require("passport");
const Usuario = require(__dirname+"/../models/Usuario");
const Movimiento = require(__dirname+"/../models/Movimiento");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const GoogleStrategy = require("passport-google-oauth20").Strategy;



// DEFINO Y CREO ESTRATEGIA DE AUTENTICACION CON GOOGLE
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://www.tarjetachiquilin.com/auth/google/usrhome",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {

    const nuevaDate = new Date();
    const fechaRegistro = fechaAString(nuevaDate);
    const horaRegistro = horaAString(nuevaDate);


    //Busco en usuarios a alguien con mismo googleid
    Usuario.findOne({googleId: profile.id}, function(err, doc){
              if (err) {
                return cb(err);
              } else if (!doc) {
                //Si No encuentra usuario alguno con ese google id....creo nuevo usuario

                //Pero primero chequeo que mail no exita en base usuarios
                var promise1 = new Promise(function(resolve, reject){

                  Usuario.findOne({email: profile.emails[0].value}, function(err, doc){
                    if (!err) {
                      if (doc) {
                        return reject("E-mail de cliente ya existe //");
                      } else {
                        resolve("Mail OK");
                      }
                    } else {
                      console.log(err);
                      return cb(err);
                    }
                  });
                });

                promise1.then(function(resultado){
                  const nuevoMovimiento = new Movimiento({
                    accion: "Usuario registrado",
                    fecha: fechaRegistro,
                    hora: horaRegistro,
                    email: profile.emails[0].value,
                    username: "Usuario google: " + profile.displayName
                  });

                  const nuevoUsuario = new Usuario({
                    username: "Usuario google: " + profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    accionesCliente: [{
                      accion: "Usuario registrado",
                      fecha: fechaRegistro,
                      hora: horaRegistro
                    }],
                    esAdmin: false,
                    activado: true,
                    asignado: false,
                    fechaCreado: fechaRegistro
                  });
                  //guardo nuevo usuario y lo devuelvo a passport
                  nuevoUsuario.save(function(err){
                    if (err) {
                      return console.log(err);
                    }

                    return cb(err, nuevoUsuario);
                  });



                })
                .catch(function(errorArrojado){
                    console.log(errorArrojado);
                });





              } else {
                //Si googleId ya existe devuelvo a passport el doc/usuario con googleId correspondiente verificado
                return cb (err, doc);
              }
            }
        );
    }
  )
);

exports.google_controller_verificar = passport.authenticate("google", { scope: ["profile", "email"] });

exports.google_controller_verificado = passport.authenticate("google", { failureRedirect: "/login" });
