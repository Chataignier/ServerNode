var express    = require("express");
var mysql      = require('mysql');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'media'
});

connection.connect(function (err) {
  if(!err) {
    console.log("Database connected\n");
  }
  else {
    console.error("Error connecting database\n");
  }
});

var app = express();
app.set('json spaces', 0);

var jsonParser = bodyParser.json();

app.post("/authenticate", jsonParser, function (req, res) {
  if(req.body && req.body.email && req.body.password) {
    connection.query('SELECT * from users WHERE email = ? and password = ?', [req.body.email, req.body.password], function (err, rows, fields) {
      if (!err) {
        if(rows.length == 1) {
          res.sendStatus(200);
        }
        else {
          res.sendStatus(400);
        }
      }
      else {
        res.sendStatus(500);
      }
    });
  }
  else {
    res.sendStatus(400);
  }
});

app.get("/users", function (req, res) {
  connection.query('SELECT * from users', function (err, rows, fields) {
    if (!err) {
      res.json(rows);
    }
    else {
      res.sendStatus(500);
    }
  });
});

app.listen(8000);