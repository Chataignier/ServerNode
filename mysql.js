/**
 * Serveur Node.js en REST pour la connexion à la base de données et son intérogation.
 *
 *  - GET : retour de donnée (SELECT)
 *  - POST : creation de nouveau champs (INSERT)
 *  - PUT : modification de champs (UPDATE)
 *  - DELETE : suppression de champs (DELETE)
 *
 * Besoin :
 *  - GET : /utilisateurs/:email
 *          /carnets/:carnet/themes/:themes/textes                      Retourne la liste des textes d'un thème
 *          /carnets/:carnet/themes/:themes/images                      Retourne la liste des images d'un thème
 *          /carnets/:carnet/themes/:themes/commentaires                Retourne les commentaires du theme
 *          /carnets/:carnet/themes/:themes/                            Retourne la liste des themes du carnet
 *          /carnets/:carnet/                                           Retourne l'id du carnet du utilisateurs
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
var qs = require('querystring');


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
    var token;
    var user;
    var retour;

    var body = '';
    req.on('data', function(data) {

        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();

        var post = qs.parse(body);

        console.log(post);
    });

    req.on('end', function() {
        var post = qs.parse(body);

        emailutilisateur = post['emailutilisateur'];
        console.log(emailutilisateur);
        motdepasse = post['motdepasse'];
        console.log(motdepasse);

        connection.query('SELECT `utilisateur`.emailutilisateur, `carnetvoyage`.idcarnetvoyage ' +
        'FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur` ' +
        'WHERE `utilisateur`.motdepasse = "'+ motdepasse +'" AND ' +
        '`utilisateur`.emailutilisateur = "'+ emailutilisateur +'"', function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(401);
                res.end();
            }
            else {
                user = ('"user":'+JSON.stringify(rows[0])+'');
                console.log(user);
            }
        });

        connection.query('SELECT `utilisateur`.token ' +
        'FROM `utilisateur`' +
        'WHERE `utilisateur`.motdepasse = "'+ motdepasse +'" AND ' +
        '`utilisateur`.emailutilisateur = "'+ emailutilisateur +'"', function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(500);
                res.end();
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);

                token = '{"token":'+JSON.stringify(rows[0].token)+',';
                retour = '{"auth":'+token + user+'}}';
                res.end(retour);
            }
        });

    });
});

/**
 * Retourne un theme
 * /carnets/:idCarnet/themes/:idTheme
 */
app.get("/carnets/:idCarnet/themes/:idTheme",function(req,res){
    var idCarnet = req.params.idCarnet;
    var idTheme = req.params.idTheme;

    var nomTheme;
    var textes;
    var images;
    var commentaires;
    var retour;

    /**
     * Selection du theme
     */
    connection.query(
        'SELECT nomtheme FROM `theme` ' +
        'WHERE idtheme = ?',
        [idTheme], function(err, rows, fields) {

            if (err) {
                res.writeHead(500);
                res.end();
                console.log("500 : GET : theme \n");
            }
            else {
                nomTheme = rows[0].nomtheme;
                console.log("200 : GET : theme \n");
            }
        });

    /**
     * Selection des textes
     */
    connection.query(
        'SELECT idtexte, titretexte, contenutexte, datetexte FROM `texte` ' +
        'WHERE idtheme = ?',
        [idTheme], function(err, rows, fields) {
            if (err) {
                res.writeHead(500);
                res.end();
                console.log("500 : GET : textes \n");
            }
            else {
                textes = JSON.stringify(rows);
                console.log("200 : GET : textes \n");
            }
        });

    /**
     * Selection des images
     */
    connection.query(
        'SELECT idimage, pathimage, legendeimage, titreimage FROM `image` ' +
        'WHERE idtheme = ?',
        [idTheme], function(err, rows, fields) {

            if (err) {
                res.writeHead(500);
                res.end();
                console.log("500 : GET : images \n");
            }
            else {
                images = JSON.stringify(rows);
                console.log("200 : GET : images \n");
            }
        });

    /**
     * Selection des commentaires
     */
    connection.query(
        'SELECT idcommentaire, idtheme, emailutilisateur, commentaire, datecommentaire FROM `commenter` ' +
        'WHERE idtheme = ?',
        [idTheme], function(err, rows, fields) {

            if (err) {
                res.writeHead(500);
                res.end();
                console.log("500 : GET : commentaires \n");
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                commentaires = JSON.stringify(rows);
                retour = '{"theme":{"idtheme":'+idTheme+',' +
                '"nomtheme":"'+ nomTheme +'",' +
                '"textes":'+textes+',' +
                '"images":'+images+',' +
                '"commentaires":'+commentaires+'}}';
                res.end(retour);
                console.log("200 : GET : commentaires \n");
            }
        });
});

/**
 * Retourne la liste de carnet
 *
 */
app.get("/carnets",function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT * FROM `carnetvoyage`',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(500);
                res.end();
                console.log("500 : GET : /carnet \n");
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /carnet \n");
            }
        });
});

/**
 * Retourne la liste des textes d'un theme
 * paramètre id du theme
 */
app.get("/carnets/:idCarnet/themes/:idTheme/textes",function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT idtexte, titretexte, contenutexte, datetext, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /utilisateurs/carnet \n");
            }
            else {
                res.writeHead(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});

/**
 * Retourne la liste des images d'un theme
 * id theme
 */
app.get("/carnets/:idCarnet/themes/:idTheme/images",function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT idimage, pathimage, legendeimage, titreimage, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `image` ON `theme`.idtheme = `image`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function(err, rows, fields) {

            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /utilisateurs/carnet \n");
            }
            else {
                res.writeHead(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});

/**
 * Retourne les commentaires du theme
 * SELECT * FROM `commenter` WHERE idtheme = ?;
 */
app.get("/carnets/:idCarnet/themes/:idTheme/commentaires",function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT * ' +
        'FROM `commenter` ' +
        'WHERE idtheme = ?',
        [theme], function(err, rows, fields) {
            if (err) {
                res.writeHead(401);
                res.end();
                console.log("401 : GET : /utilisateurs/carnet \n");
            }
            else {
                res.writeHead(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});

/**
 * Retourne la liste des themes du carnet
 * SELECT * FROM `theme` WHERE idcarnetvoyage = ?;
 */
app.get("/carnets/:id/themes",function(req,res){
    var theme = req.params.id;
    var retour;

    connection.query(
        'SELECT * ' +
        'FROM `theme` ' +
        'WHERE idcarnetvoyage = ?;',
        [theme], function(err, rows, fields) {
            if (err) {
                res.writeHead(500);
                res.end();
                console.log("500 : GET : /utilisateurs/carnet \n");
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);

                retour = '{"themes":'+JSON.stringify(rows)+'}';
                res.end(retour);
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});

/**
 * Retourne l'id du carnet du utilisateurs
 * SELECT idcarnetvoyage, nomcarnetvoyage FROM `carnetvoyage` WHERE emailutilisateur = ?;
 */
app.get("/utilisateurs/:idutilisateurs/carnet",function(req,res){
    var email = req.params.idutilisateurs;

    connection.query(
        'SELECT idcarnetvoyage, nomcarnetvoyage ' +
        'FROM `carnetvoyage` ' +
        'WHERE emailutilisateur = ?;',
        [email], function(err, rows, fields) {
            if (err) {
                res.writeHead(500);
                res.end();
                console.log("401 : GET : /utilisateurs/carnet \n");
            }
            else {
                res.writeHead(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(rows));
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});



/**
 * Ajout d'un utilisateur
 */
app.post("/utilisateurs/:idUser",function(req,res){

    var emailutilisateur = req.params.idUser;
    var motdepasse;
    var retour;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });

    req.on('end', function() {
        var post = qs.parse(body);

        console.log(emailutilisateur);
        motdepasse = post['motdepasse'];
        console.log(motdepasse);

        connection.query('INSERT INTO `utilisateur`(`emailutilisateur`, `motdepasse`) ' +
            'VALUES (' +
            '"'+ emailutilisateur +'",' +
            '"'+ motdepasse +'")',
        function(err, rows, fields) {
                if (err) {
                    res.writeHead(500);
                    res.end();
                    console.log(err.toString());
                }
                else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    retour = '{"utilisateur":[{"emailutilisateur":"'+emailutilisateur+'"}]}';
                    res.end(retour);
                    console.log("200 : POST : /carnet \n");
                }
            });
    });
});

/**
 * Ajout d'un carnet
 */
app.post("/users/:idUser/carnet",function(req,res){

    var emailutilisateur = req.params.idUser;
    var nomcarnet;
    var retour;

    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });

    req.on('end', function() {
        var post = qs.parse(body);

        console.log(emailutilisateur);
        nomcarnet = post['nomcarnet'];
        console.log(nomcarnet);

        connection.query('INSERT INTO `carnetvoyage`(`nomcarnetvoyage`, `emailutilisateur`)' +
            'VALUES (' +
            '"'+ nomcarnet +'",' +
            '"'+ emailutilisateur +'")'
        );

        connection.query("SELECT * FROM `carnetvoyage` WHERE " +
            "emailutilisateur = '" + emailutilisateur +"';",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(500);
                    res.end();
                    console.log("500 : POST : /carnet \n");
                }
                else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    retour = '{"carnets":'+JSON.stringify(rows)+'}';
                    res.end(retour);
                    console.log("200 : POST : /carnet \n");
                }
            });
    });
});


/**
 * Ajout d'un theme
 */
app.post("/carnets/:idCarnet/theme",function(req,res){

    var idcarnetvoyage = req.params.idCarnet;
    var nomtheme;
    var retour;


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
        console.log(idcarnetvoyage);

        connection.query('INSERT INTO `theme`(`nomtheme`, `idcarnetvoyage`) ' +
            'VALUES (' +
            '"'+ nomtheme +'", ' +
            ''+ idcarnetvoyage +')'
        );

        connection.query("SELECT * FROM `theme` WHERE " +
            "nomtheme = '" + nomtheme +"' AND " +
            "idcarnetvoyage = " + idcarnetvoyage +" ;",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(500);
                    res.end();
                    console.log("500 : POST : /theme \n");
                }
                else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    retour = '{"themes":'+JSON.stringify(rows)+'}';
                    res.end(retour);
                    console.log("200 : POST : /theme \n");
                }
            });
    });
});

/**
 * Ajout d'un nouveau texte
 * INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) VALUES ([value-2],[value-3],[value-4],[value-5])
 */
app.post("/carnets/:idCarnet/themes/:idTheme/texte",function(req,res){

    var titretexte;
    var contenutexte;
    var datetexte;
    var retour;
    var idtheme = req.params.idTheme;

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
        console.log(idtheme);

        connection.query('' +
        'INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) ' +
        'VALUES (' +
        '"'+ titretexte +'",' +
        '"'+ contenutexte +'",' +
        '"'+ datetexte +'",' +
        ''+ idtheme +')'
            );

        connection.query("SELECT * FROM `texte` WHERE " +
            "titretexte = '" + titretexte +"'AND " +
            "contenutexte = '" + contenutexte +"' AND " +
            "datetexte = '" + datetexte +"' AND " +
            "idtheme = " + idtheme +" ;",
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(500);
                res.end();
                console.log("500 : POST : /texte \n");
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                retour = '{"textes":'+JSON.stringify(rows)+'}';
                res.end(retour);
                console.log("200 : POST : /texte \n");
            }
        });
    });
});

/**
 * Ajout d'un commentaire sur le theme
 * INSERT INTO `commenter`(`idtheme`, `emailutilisateur`, `commentaire`, `datecommentaire`) VALUES ([value-1],[value-2],[value-3],[value-4])
 */
app.post("/carnets/:idCarnet/themes/:idTheme/commenter",function(req,res){

    var idtheme = req.params.idTheme;
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
        '"'+ datecommentaire +'")');

        connection.query("SELECT * FROM `commenter` WHERE " +
            "emailutilisateur = '" + emailtutilisateur +"' AND " +
            "commentaire = '" + commentaire +"' AND " +
            "datecommentaire = '" + datecommentaire +"' AND " +
            "idtheme = " + idtheme +" ;",
            function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(500);
                res.end();
                console.log("500 : POST : /com \n");
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                retour = '{"commentaires":'+JSON.stringify(rows)+'}';
                res.end(retour);
                console.log("200 : POST : /com \n");
            }
        });
    });
});


/**
 * Ajout d'une nouvelle image
 * INSERT INTO `image`(`pathimage`, `legendeimage`, `idtheme`, `titreimage`) VALUES ([value-2],[value-3],[value-4],[value-5])
 */
app.post("/carnets/:idCarnet/themes/:idTheme/image",function(req,res){

    var pathimage;
    var legendeimage;
    var titreimage;
    var idtheme = req.params.idTheme;

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
        console.log(idtheme);

        connection.query('' +
        'INSERT INTO `image`(`pathimage`, `legendeimage`, `titreimage`, `idtheme`) ' +
        'VALUES (' +
        '"'+ pathimage +'",' +
        '"'+ legendeimage +'",' +
        '"'+ titreimage +'",' +
        ''+ idtheme +')');

        connection.query("SELECT * FROM `image` WHERE " +
            "pathimage = '" + pathimage +"' AND " +
            "legendeimage = '" + legendeimage +"' AND " +
            "titreimage = '" + titreimage +"' AND " +
            "idtheme = " + idtheme +"",
            function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.writeHead(500);
                res.end();
                console.log("500 : POST : /img \n");
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                retour = '{"images":'+JSON.stringify(rows)+'}';
                res.end(retour);
                console.log("200 : POST : /img \n");
            }
        });
    });
});

/**
 * Modification du texte
 * UPDATE `texte` SET `titretexte`=[value-2],`contenutexte`=[value-3] WHERE idtexte = ?
 */
app.put("/carnets/:idCarnet/themes/:idTheme/texte/:idTexte",function(req,res){

    var titretexte;
    var contenutexte;
    var datetexte;
    var idtexte = req.params.idTexte;

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
        console.log(idtexte);

        connection.query('UPDATE `texte` ' +
            'SET `titretexte`= "'+ titretexte +'",' +
            '`contenutexte`= "'+ contenutexte +'" ' +
            'WHERE idtexte = '+ idtexte +'');

        connection.query("SELECT * FROM `texte` WHERE " +
        "idtexte = " + idtexte +" ;",function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(500);
                    res.end();
                    console.log("500 : PUT : /texte \n");
                }
                else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    retour = '{"textes":'+JSON.stringify(rows)+'}';
                    res.end(retour);
                    console.log("200 : PUT : /texte \n");
                }
            });
    });
});

/**
 * Modification de l'image
 * UPDATE `image` SET `pathimage`=[value-2],`legendeimage`=[value-3],`titreimage`=[value-5] WHERE idimage = ?
 */
app.put("/carnets/:idCarnet/themes/:idTheme/images/:idImage",function(req,res){

    var pathimage;
    var legendeimage;
    var titreimage;
    var idimage = req.params.idImage;

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
        console.log(idimage);

        connection.query('UPDATE `image` SET ' +
        '`pathimage`= "'+ pathimage +'",' +
        '`legendeimage`= "'+ legendeimage +'",' +
        '`titreimage`= "'+ titreimage +'" ' +
        'WHERE idimage = '+ idimage +'');

            connection.query("SELECT * FROM `image` WHERE " +
                "idimage = " + idimage +" ;",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.writeHead(401);
                    res.end();
                    console.log("401 : POST : /texte \n");
                }
                else {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    retour = '{"images":'+JSON.stringify(rows)+'}';
                    res.end(retour);
                    console.log("200 : POST : /image \n");
                }
            });
    });
});

/**
 * Modification du nom du theme
 * UPDATE `theme` SET `nomtheme`=[value-2] WHERE idtheme = ?;
 */
app.put("/carnets/:idCarnet/themes/:idTheme",function(req,res){

    var nomtheme;
    var idtheme = req.params.idTheme;

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
        console.log(idtheme);

        connection.query('UPDATE `theme` SET ' +
            '`nomtheme`= "'+ nomtheme +'" ' +
            'WHERE idtheme = '+ idtheme +'');

            connection.query("SELECT * FROM `theme` WHERE " +
                "idtheme = " + idtheme +" ;",
                function(err, rows, fields) {
                    if (err || rows.length == 0) {
                        res.writeHead(500);
                        res.end();
                        console.log("500 : PUT : /texte \n");
                    }
                    else {
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(200);
                        retour = '{"themes":'+JSON.stringify(rows)+'}';
                        res.end(retour);
                        console.log("200 : PUT : /theme \n");
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

app.get("/utilisateurs",function(req,res){
    connection.query('SELECT * from utilisateur LIMIT 2', function(err, rows, fields) {
        connection.end();
        if (!err)
            console.log('The solution is: ', rows);
        else
            console.log('Error while performing Query.');
    });
});

/**
 * Liste des utilisateurs
 */
app.get("/utilisateurs",function(req,res){
    connection.query('SELECT * from utilisateur LIMIT 2', function(err, rows, fields) {
        connection.end();
        if (!err)
            console.log('The solution is: ', rows);
        else
            console.log('Error while performing Query.');
    });
});

app.listen(3000);