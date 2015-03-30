/*var mysql = require('mysql');

var mySqlClient = mysql.createConnection({
  host     : "localhost",
  user     : "root",
  password : "",
  database : "carnetvoyage"
});

mySqlClient.connect();

mySqlClient.query('SELECT * from utilisateur', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
});

mySqlClient.end();*/

var express    = require("express");
var mysql      = require('mysql');
var http       = require('http');
var url = require('url');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'carnetvoyage'
});

/*var server = http.createServer(function(req, res) {
  var page = url.parse(req.url).pathname;
  console.log(page);
  
  if (page == '/authenticate') {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify({ a: 1 }));
  }
  else {
    res.writeHead(404, {"Content-Type": "text/plain"});
  }
  res.end();
});

server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});*/

var app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... \n\n");  
} else {
    console.log("Error connecting database ... \n\n");  
}
});

app.get("/users",function(req,res){
connection.query('SELECT * from utilisateur LIMIT 2', function(err, rows, fields) {
connection.end();
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
  });
});

app.post("/authenticate",function(req,res){
  var email;

  req.on('data', function(data) {
    data = JSON.parse(data.toString());
    email = data.email;
  });

  req.on('end', function() {
    connection.query('SELECT * from utilisateur WHERE email = ?', [email], function(err, rows, fields) {
      if (err || rows.length == 0) {
        res.writeHead(401);
        res.end();
      }
      else {
        res.writeHead(200);
        res.end(JSON.stringify(rows[0]));
      }
    });
  });
});

app.listen(3000);