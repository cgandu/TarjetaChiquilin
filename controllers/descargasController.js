//jshint esversion:6
const Movimiento = require(__dirname+"/../models/Movimiento");
const fs = require("fs");
const json2csv = require("json2csv").parse;
const path = require("path");
const fields = ["numeroCliente", "nombreCliente", "fecha", "hora", "accion", "comprobante", "_id"];

exports.descargas_controller_get = function(req, res) {
  Movimiento.find({}, function (err, movimientos) {
    if (err) {
      return res.status(500).json({ err });
    }
    else {
      let csv;
      try {
        csv = json2csv(movimientos, { fields });
      } catch (err) {
        return res.status(500).json({ err });
      }
      const filePath = __dirname + "/../public/exports/movimientos.csv";
      fs.writeFile(filePath, csv, function (err) {
        if (err) {
          return res.json(err).status(500);
        }
        else {
          setTimeout(function () {
            fs.unlinkSync(filePath); // delete this file after 30 seconds
          }, 30000);
          //res.json("/exports/csv-TODOS.csv");
          return res.render("descargas", {linkdescarga: "/exports/movimientos.csv"});

        }
      });

    }
  });
};
