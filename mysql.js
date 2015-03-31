/**
 * Serveur Node.js en REST pour la connexion à la base de données et son intérogation.
 *
 *  - GET : retour de donnée (SELECT)
 *  - POST : creation de nouveau champs (INSERT)
 *  - PUT : modification de champs (UPDATE)
 *  - DELETE : suppression de champs (DELETE)
 *
 * Besoin :
 *  - GET : /users/:email
 *          /carnets/:carnet/themes/:themes/textes                      Retourne la liste des textes d'un thème
 *          /carnets/:carnet/themes/:themes/images                      Retourne la liste des images d'un thème
 *          /carnets/:carnet/themes/:themes/commentaires                Retourne les commentaires du theme
 *          /carnets/:carnet/themes/:themes/                            Retourne la liste des themes du carnet
 *          /carnets/:carnet/                                           Retourne l'id du carnet du users
 *
 *  - POST: /carnets/:carnet/themes/:themes/textes                      Ajout d'un nouveau texte
 *          /carnets/:carnet/themes/:themes/images                      Ajout d'une nouvelle image
 *          /carnets/:carnet/themes/:themes/commentaires                Ajout d'un commentaire sur le theme
 *
 *  - PUT : /carnets/:carnet/themes/:themes/textes/:textes              Modification du textes
 *          /carnets/:carnet/themes/:themes/images/:images              Modification de l'images
 *          /carnets/:carnet/themes/:themes/                            Modification du nom du theme
 *
 *  - DEL : /carnets/:carnet/themes/:themes/textes/:textes              Suppression d'un texte
 *          /carnets/:carnet/themes/:themes/image/:images               Suppresion d'une image
 *          /carnets/:carnet/themes/:themes/commentaires/:commentaire   Suppression d'un com
 *          /carnets/:carnet/themes/:themes/                            Suppresion d'un theme
 *          /carnets/:carnet/                                           Suppresion d'un carnet
 */

/*Information de Connection*/
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

/* Configuration */
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

/**
 * Authentificate
 */
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

/**
 * GET
 * Retourne l'id du carnet du users
 * /carnets/:carnet/
 */
app.get("/users/carnet/:id",function(req,res){
    var user = "aurelie.jollet@carnet.fr";

    connection.query('SELECT * FROM `carnetvoyage` WHERE emailutilisateur = ?',[user], function(err, rows, fields) {
        connection.end();
        if (err) {
            res.writeHead(401);
            res.end();
            console.log("401 : GET : /users/carnet \n");
        }
        else {
            res.writeHead(200);
            res.end(rows[0]);
            console.log("200 : GET : /users/carnet \n");
        }
    });
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


/**
 * POST
 */

/**
 * PUT
 */

/**
 * DELETE
 */

/**
 * Liste des Users
 */
app.get("/users",function(req,res){
    connection.query('SELECT * from utilisateur LIMIT 2', function(err, rows, fields) {
        connection.end();
        if (!err)
            console.log('The solution is: ', rows);
        else
            console.log('Error while performing Query.');
    });
});



/**
 * Theme
 * Retour du theme dans un JSON
 *
 * SELECT * FROM `theme` INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme INNER JOIN `image` ON `image`.idtheme = `theme`.idtheme WHERE `theme`.idtheme = 1
 *
 * SELECT * FROM `theme` INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme WHERE `theme`.idtheme = 1
 *
 * SELECT * FROM `theme` INNER JOIN `image` ON `image`.idtheme = `theme`.idtheme WHERE `theme`.idtheme = 1
 */
app.get("/themes/:id",function(req, res){
    var id = req.params.id;
    var images;
    var head = 200;
    var retour = new Array();

    connection.query('SELECT * FROM `theme` WHERE `theme`.idtheme = ?', [id], function (err, rows, fields) {
        connection.end();
        if (err || rows.length == 0) {
            res.writeHead(401);
            res.end();
        }
        else {
            /*retour.push(rows[0]);*/
            var theme = new Array();
            retour.push(theme);
            console.log(retour);
            res.writeHead(200);
            res.end();
        }
    });

    connection.query('SELECT * FROM `theme` INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme WHERE `theme`.idtheme = ?', [id], function (err, rows, fields) {
        connection.end();
        if (err || rows.length == 0) {
            res.writeHead(401);
            res.end();
        }
        else {
            for (var key in rows){
                retour.push(key);
            }
            console.log(retour);
            res.writeHead(200);
            res.end();
        }
    });

});



app.listen(3000);