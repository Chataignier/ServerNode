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
 *          /carnets/:carnet/themes/                                    Ajout d'un theme
 *
 *
 *  - PUT : /carnets/:carnet/themes/:themes/textes/:textes              Modification du textes
 *          /carnets/:carnet/themes/:themes/images/:images              Modification de l'images
 *          /carnets/:carnet/themes/:themes/                            Modification du nom du theme
 *
 *  - DEL : /carnets/:carnet/themes/:themes/textes/:textes              Suppression d'un texte
 *          /carnets/:carnet/themes/:themes/image/:images               Suppresion d'une image
 *          /carnets/:carnet/themes/:themes/commentaires/:commentaire   Suppression d'un com
 *          /carnets/:carnet/themes/:themes/                            Supppresion d'un theme
 *          /carnets/:carnet/                                           Suppresion d'un carnet
 */

/**
 * Connexion
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
    var emailutilisateur;
    var motdepasse;

    var body = '';
    req.on('data', function(data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();

        var post = qs.parse(body);
    });

    req.on('end', function() {
        var post = qs.parse(body);

        emailutilisateur = post['emailutilisateur'];
        console.log(emailutilisateur);
        motdepasse = post['motdepasse'];
        console.log(motdepasse);

        connection.query('SELECT * ' +
        'FROM `utilisateur` ' +
        'WHERE motdepasse = "'+ motdepasse +'" AND ' +
        'emailutilisateur = "'+ emailutilisateur +'"', function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(401);
                res.end();
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows[0].motdepasse));
            }
        });
    });
});

/**
 * Retourne la liste des textes d'un theme
 * paramètre id du theme
 */
app.get("/themes/textes/id/:id",function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT idtexte, titretexte, contenutexte, datetext, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

/**
 * Retourne la liste des textes d'un theme
 * paramètre nom du theme
 */
app.get("/themes/textes/nom/:id",function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT idtexte, titretexte, contenutexte, datetext, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme ' +
        'WHERE `theme`.nomtheme = ?',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

/**
 * Retourne la liste des images d'un theme
 * id theme
 */
app.get("/themes/images/id/:id",function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT idimage, pathimage, legendeimage, titreimage, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `image` ON `theme`.idtheme = `image`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

/**
 * Retourne la liste des images d'un theme
 * nom du theme
 */
app.get("/themes/images/nom/:id",function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT idimage, pathimage, legendeimage, titreimage, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme ' +
        'WHERE `theme`.nomtheme = ?',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

/**
 * Retourne les commentaires du theme
 * SELECT * FROM `commenter` WHERE idtheme = ?;
 */
app.get("/themes/commentaires/id/:id",function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT * ' +
        'FROM `commenter` ' +
        'WHERE idtheme = ?',
        [theme], function(err, rows, fields) {
            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

/**
 * Retourne la liste des themes du carnet
 * SELECT * FROM `theme` WHERE idcarnetvoyage = ?;
 */
app.get("/carnet/themes/id/:id",function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT * ' +
        'FROM `theme` ' +
        'WHERE idcarnetvoyage = ?;',
        [theme], function(err, rows, fields) {
            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

/**
 * Retourne l'id du carnet du users
 * SELECT idcarnetvoyage, nomcarnetvoyage FROM `carnetvoyage` WHERE emailutilisateur = ?;
 */
app.get("/carnet/email/:id",function(req,res){
    var email = req.params.id;

    connection.query(
        'SELECT idcarnetvoyage, nomcarnetvoyage ' +
        'FROM `carnetvoyage` ' +
        'WHERE emailutilisateur = ?;',
        [email], function(err, rows, fields) {
            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /users/carnet \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /users/carnet \n");
            }
        });
});

var qs = require('querystring');

/**
 * Ajout d'un utilisateur/carnet
 */
app.post("/utilisateur",function(req,res){

    var emailutilisateur;
    var motdepasse;
    var nomcarnet;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });

    req.on('end', function() {
        var post = qs.parse(body);

        emailutilisateur = post['emailutilisateur'];
        console.log(emailutilisateur);
        motdepasse = post['motdepasse'];
        console.log(motdepasse);
        nomcarnet = post['nomcarnet'];
        console.log(nomcarnet);

        connection.query('INSERT INTO `utilisateur`(`emailutilisateur`, `motdepasse`) ' +
            'VALUES (' +
            '"'+ emailutilisateur +'",' +
            '"'+ motdepasse +'")'
        );

        connection.query('INSERT INTO `carnetvoyage`(`nomcarnetvoyage`, `emailutilisateur`)' +
            'VALUES (' +
            '"'+ nomcarnet +'",' +
            '"'+ emailutilisateur +'")'
        );

        connection.query("SELECT idcarnetvoyage FROM `carnetvoyage` WHERE " +
            "emailutilisateur = '" + emailutilisateur +"';",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : POST : /carnet \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows));
                    console.log("200 : POST : /carnet \n");
                }
            });
    });
});


/**
 * Ajout d'un theme
 */
app.post("/theme",function(req,res){

    var nomtheme;
    var emailutilisateur;
    var idcarnetvoyage = '';


    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();

        var post = qs.parse(body);

        /*connection.query('SELECT idcarnetvoyage ' +
            'FROM `carnetvoyage` ' +
            'WHERE emailutilisateur = "'+  post['emailutilisateur'] +'"',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : POST : /theme \n");
                }
                else {
                    idcarnetvoyage = rows[0].idcarnetvoyage;
                }
            });*/
    });


    req.on('end', function() {
        var post = qs.parse(body);

        nomtheme = post['nomtheme'];
        emailutilisateur = post['emailutilisateur'];
        idcarnetvoyage = post['idcarnetvoyage'];

        console.log(nomtheme);
        console.log(idcarnetvoyage);

        connection.query('INSERT INTO `theme`(`nomtheme`, `idcarnetvoyage`) ' +
            'VALUES (' +
            '"'+ nomtheme +'", ' +
            ''+ idcarnetvoyage +')'
        );

        connection.query("SELECT idtheme FROM `theme` WHERE " +
            "nomtheme = '" + nomtheme +"' AND " +
            "idcarnetvoyage = " + idcarnetvoyage +" ;",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : POST : /theme \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows));
                    console.log("200 : POST : /theme \n");
                }
            });
    });
});

/**
 * Ajout d'un nouveau texte
 * INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) VALUES ([value-2],[value-3],[value-4],[value-5])
 */
app.post("/texte",function(req,res){

    var titretexte;
    var contenutexte;
    var datetexte;
    var idtheme;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });

    req.on('end', function() {
        var post = qs.parse(body);

        titretexte = post['titretexte'];
        console.log(titretexte);
        contenutexte = post['contenutexte'];
        console.log(contenutexte);
        datetexte = post['datetexte'];
        console.log(datetexte);
        idtheme = post['idtheme'];
        console.log(idtheme);

        connection.query('' +
        'INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) ' +
        'VALUES (' +
        '"'+ titretexte +'",' +
        '"'+ contenutexte +'",' +
        '"'+ datetexte +'",' +
        ''+ idtheme +')'
            );

        connection.query("SELECT idtexte FROM `texte` WHERE " +
            "titretexte = '" + titretexte +"'AND " +
            "contenutexte = '" + contenutexte +"' AND " +
            "datetexte = '" + datetexte +"' AND " +
            "idtheme = " + idtheme +" ;",
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(401);
                res.end();
                console.log("401 : POST : /texte \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : POST : /texte \n");
            }
        });
    });
});

/**
 * Ajout d'un commentaire sur le theme
 * INSERT INTO `commenter`(`idtheme`, `emailutilisateur`, `commentaire`, `datecommentaire`) VALUES ([value-1],[value-2],[value-3],[value-4])
 */
app.post("/commenter",function(req,res){

    var idtheme;
    var emailtutilisateur;
    var commentaire;
    var datecommentaire;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        idtheme = post['idtheme'];
        console.log(idtheme);
        emailtutilisateur = post['emailtutilisateur'];
        console.log(emailtutilisateur);
        commentaire = post['commentaire'];
        console.log(commentaire);
        datecommentaire = post['datecommentaire'];
        console.log(datecommentaire);

        connection.query('' +
        'INSERT INTO `commenter`(`idtheme`, `emailutilisateur`, `commentaire`, `datecommentaire`) ' +
        'VALUES (' +
        ''+ idtheme +',' +
        '"'+ emailtutilisateur +'",' +
        '"'+ commentaire +'",' +
        '"'+ datecommentaire +'")',
            function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(401);
                res.end();
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows));
            }
        });
    });
});


/**
 * Ajout d'une nouvelle image
 * INSERT INTO `image`(`pathimage`, `legendeimage`, `idtheme`, `titreimage`) VALUES ([value-2],[value-3],[value-4],[value-5])
 */
app.post("/image",function(req,res){

    var pathimage;
    var legendeimage;
    var titreimage;
    var idtheme;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        pathimage = post['pathimage'];
        console.log(pathimage);
        legendeimage = post['legendeimage'];
        console.log(legendeimage);
        titreimage = post['titreimage'];
        console.log(titreimage);
        idtheme = post['idtheme'];
        console.log(idtheme);

        connection.query('' +
        'INSERT INTO `image`(`pathimage`, `legendeimage`, `titreimage`, `idtheme`) ' +
        'VALUES (' +
        '"'+ pathimage +'",' +
        '"'+ legendeimage +'",' +
        '"'+ titreimage +'",' +
        ''+ idtheme +')');

        connection.query("SELECT idimage FROM `image` WHERE " +
            "pathimage = '" + pathimage +"' AND " +
            "legendeimage = '" + legendeimage +"' AND " +
            "titreimage = '" + titreimage +"' AND " +
            "idtheme = " + idtheme +"",
            function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(401);
                res.end();
                console.log("401 : POST : /texte \n");
            }
            else {
                res.writeHead(200);
                res.end(JSON.stringify(rows[0]));
                console.log("200 : POST : /texte \n");
            }
        });
    });
});

/**
 * Modification du texte
 * UPDATE `texte` SET `titretexte`=[value-2],`contenutexte`=[value-3] WHERE idtexte = ?
 */
app.put("/texte",function(req,res){

    var titretexte;
    var contenutexte;
    var datetexte;
    var idtexte;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });

    req.on('end', function() {
        var post = qs.parse(body);

        titretexte = post['titretexte'];
        console.log(titretexte);
        contenutexte = post['contenutexte'];
        console.log(contenutexte);
        datetexte = post['datetexte'];
        console.log(datetexte);
        idtexte = post['idtexte'];
        console.log(idtexte);

        connection.query('UPDATE `texte` ' +
            'SET `titretexte`= "'+ titretexte +'",' +
            '`contenutexte`= "'+ contenutexte +'" ' +
            'WHERE idtexte = '+ idtexte +''
        , function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : POST : /texte \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows));
                    console.log("200 : POST : /texte \n");
                }
            });
    });
});

/**
 * Modification de l'image
 * UPDATE `image` SET `pathimage`=[value-2],`legendeimage`=[value-3],`titreimage`=[value-5] WHERE idimage = ?
 */
app.put("/image",function(req,res){

    var pathimage;
    var legendeimage;
    var titreimage;
    var idimage;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        pathimage = post['pathimage'];
        console.log(pathimage);
        legendeimage = post['legendeimage'];
        console.log(legendeimage);
        titreimage = post['titreimage'];
        console.log(titreimage);
        idimage = post['idimage'];
        console.log(idimage);

        connection.query('UPDATE `image` SET ' +
        '`pathimage`= "'+ pathimage +'",' +
        '`legendeimage`= "'+ legendeimage +'",' +
        '`titreimage`= "'+ titreimage +'" ' +
        'WHERE idimage = '+ idimage +'',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : POST : /texte \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : POST : /texte \n");
                }
            });
    });
});

/**
 * Modification du nom du theme
 * UPDATE `theme` SET `nomtheme`=[value-2] WHERE idtheme = ?;
 */
app.put("/theme",function(req,res){

    var nomtheme;
    var idtheme;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        nomtheme = post['nomtheme'];
        console.log(nomtheme);
        idtheme = post['idtheme'];
        console.log(idtheme);

        connection.query('UPDATE `theme` SET ' +
            '`nomtheme`= "'+ nomtheme +'" ' +
            'WHERE idtheme = '+ idtheme +'',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : PUT : /texte \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : PUT : /texte \n");
                }
            });
    });
});

/**
 * Suppression d'un texte
 * DELETE FROM `texte` WHERE idtexte = ?;
 */
app.delete("/texte",function(req,res){

    var idtexte;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        idtexte = post['idtexte'];
        console.log(idtexte);

        connection.query('DELETE FROM `texte` ' +
            'WHERE idtexte = '+ idtexte +'',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : DEL : /texte \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : DEL : /texte \n");
                }
            });
    });
});

/**
 * Suppression d'une image
 * DELETE FROM `image` WHERE idimage = ?;
 */
app.delete("/image",function(req,res){

    var idimage;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        idimage = post['idimage'];
        console.log(idimage);

        connection.query('DELETE FROM `image` ' +
            'WHERE idimage = '+ idimage +'',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : DEL : /texte \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : DEL : /texte \n");
                }
            });
    });
});

/**
 * Suppression d'un commentaire
 * DELETE FROM `commenter` WHERE idtheme = ? AND emailutilisateur = ?;
 */
app.delete("/commenter",function(req,res){

    var idtheme;
    var emailutilisateur;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        idtheme = post['idtheme'];
        console.log(idtheme);
        emailutilisateur = post['emailutilisateur'];
        console.log(emailutilisateur);

        connection.query('DELETE FROM `commenter` ' +
            'WHERE idtheme = '+ idtheme +'' +
            'AND emailutilisateur = "'+ emailutilisateur +'"',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : DEL : /commenter \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : DEL : /commenter \n");
                }
            });
    });
});

/**
 * Suppression d'un theme
 * DELETE FROM `theme` WHERE idtheme = ?;
 */
app.delete("/theme",function(req,res){

    var idtheme;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        idtheme = post['idtheme'];
        console.log(idtheme);

        connection.query('DELETE FROM `theme` ' +
            'WHERE idtheme = '+ idtheme +'',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : DEL : /commenter \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : DEL : /commenter \n");
                }
            });
    });
});

/**
 * Suppression d'un carnet
 * DELETE FROM `carnetvoyage` WHERE idcarnetvoyage = ?;
 */
app.delete("/carnet",function(req,res){

    var idcarnet;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });


    req.on('end', function() {
        var post = qs.parse(body);

        idcarnet = post['idcarnet'];
        console.log(idcarnet);

        connection.query('DELETE FROM `carnetvoyage` ' +
            'WHERE idcarnetvoyage = '+ idcarnet +'',
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : DEL : /carnet \n");
                }
                else {
                    res.writeHead(200);
                    res.end(JSON.stringify(rows[0]));
                    console.log("200 : DEL : /carnet \n");
                }
            });
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

app.listen(3000);