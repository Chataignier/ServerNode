/**
 * Serveur Node.js en REST pour la connexion à la base de données et son intérogation.
 *
 *  - GET : retour de donnée (SELECT)
 *  - POST : creation de nouveau champs (INSERT)
 *  - PUT : modification de champs (UPDATE)
 *  - DELETE : suppression de champs (DELETE)
 *
 *
 * */

/**
 * Connexion
 */
/*Information de Connection*/
var express = require("express");
var mysql = require('mysql');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var url = require('url');
var multer = require('multer');
var cors = require('cors');
var basepath = "http://localhost:3000";

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'carnetvoyage'
});

/* Configuration */
var app = express();
var done = false;

app.set('json spaces', 0);

var qs = require('querystring');
var jsonParser = bodyParser.json();

/*app.use(function (req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTION");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
 });*/
app.use(cors());

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ... \n\n");
    } else {
        console.log("Error connecting database ... \n\n");
    }
});

/**
 * Connexion avec motdepasse
 * @method /connexion
 * @param {String} emailutilisateur
 * @param {String} motdepasse
 * @return {JSON} {"emailutilsateur":"", "token":"", "idcarnetvoyage":""}
 */
app.post("/connexion", jsonParser, function (req, res) {

    //Génération d'un token
    var token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

    if (req.body && req.body.emailutilisateur && req.body.motdepasse) {

        //Insertion du token dans la base
        connection.query('UPDATE `utilisateur` ' +
        'SET `token`= "' + token + '" ' +
        'WHERE `emailutilisateur` = "' + req.body.emailutilisateur + '" AND `motdepasse` = "' +
        req.body.motdepasse + '"', function (err, rows, fields) {
            if (err) {
                console.log("500 : Insert : authenticate");
                res.sendStatus(500);
            }
        });

        //Retour
        connection.query('SELECT `utilisateur`.emailutilisateur, `utilisateur`.token, `carnetvoyage`.idcarnetvoyage ' +
        'FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur` ' +
        'WHERE `utilisateur`.motdepasse = "' + req.body.motdepasse + '" AND ' +
        '`utilisateur`.emailutilisateur = "' + req.body.emailutilisateur + '"', function (err, rows,
                                                                                          fields) {
            if (err || rows.length == 0 || rows.length >= 2) {
                console.log("500 : select : authenticate");
                res.sendStatus(500);
            }
            else {
                res.json(rows[0]);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

/**
 * Connexion avec token
 *
 * @method /authentification
 * @param {String} emailutilisateur
 * @param {String} token
 * @return {JSON} {"emailutilsateur":"", "token":"", "idcarnetvoyage":""}
 */
app.post("/authentification", jsonParser, function (req, res) {
    if (req.body && req.body.emailutilisateur && req.headers.token) {

        //Retour
        connection.query('SELECT `utilisateur`.emailutilisateur, `utilisateur`.token, `carnetvoyage`.idcarnetvoyage ' +
        'FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur` ' +
        'WHERE `utilisateur`.token = "' + req.headers.token + '" AND ' +
        '`utilisateur`.emailutilisateur = "' + req.body.emailutilisateur + '"', function (err, rows,
                                                                                          fields) {
            if (err || rows.length == 0 || rows.length >= 2) {
                console.log("500 : select : authenticate");
                res.sendStatus(500);
            }
            else {
                res.json(rows[0]);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

/**
 * Deconnexion *
 * @method /deconnexion
 * @param {String} emailutilisateur
 * @return {200} return 200 on success
 */
app.post("/deconnexion", jsonParser, function (req, res) {
    if (req.body && req.body.emailutilisateur) {
        connection.query('UPDATE `utilisateur` SET `token`= null WHERE emailutilisateur = "' +
        req.body.emailutilisateur + '"', function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("logout 500");
            } else {
                res.sendStatus(200);
                console.log("logout 200");
            }
        });
    } else {
        res.sendStatus(400);
        console.log("logout 500");
    }
});

/**
 * Vérifie que l'email n'existe pas dans la base de données
 * @method /exists/utilisateur/:emailutilisateur
 * @return {200} return 200 on success
 */
app.get("/exists/utilisateurs/:emailutilisateur", jsonParser, function (req, res) {
    connection.query('SELECT * FROM `utilisateur` WHERE emailutilisateur = "' +
    req.params.emailutilisateur + '";', function (err, rows, fields) {
        if (rows.length == 0) {
            res.sendStatus(200);
            console.log("200 : GET : Utilisateur inexistant");
        } else {
            res.sendStatus(500);
            console.log("500 : GET : Utilisateur existant");
        }
    });
});


//GET

/**
 * Retourne un theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme
 * @return {JSON} theme
 */
app.get("/carnets/:idcarnetvoyage/themes/:idtheme", jsonParser, function (req, res) {
    var idtheme = req.params.idtheme;
    var idcarnetvoyage = req.params.idcarnetvoyage;

    var nomtheme;
    var textes;
    var images;
    var commentaires;
    var retour;

    /**
     * Selection du theme
     */
    connection.query('SELECT nomtheme FROM `theme` WHERE idtheme = ? AND idcarnetvoyage = ?', [idtheme, idcarnetvoyage], function (err, rows, fields) {
        if (err || rows.length == 0) {
            res.sendStatus(500);
            console.log("500 : GET : theme \n");
        }
        else {
            //console.log(rows.length);
            nomtheme = rows[0].nomtheme;
            console.log("200 : GET : theme \n");

            /**
             * Selection des textes
             */
            connection.query(
                'SELECT idtexte, titretexte, contenutexte, datetexte FROM `texte` ' +
                'WHERE idtheme = ?',
                [idtheme], function (err, rows, fields) {
                    if (err) {
                        res.sendStatus(500);
                        console.log("500 : GET : textes \n");
                    }
                    else {
                        textes = JSON.stringify(rows);
                        console.log("200 : GET : textes \n");

                        /**
                         * Selection des images
                         */
                        connection.query(
                            'SELECT idimage, pathimage, legendeimage, titreimage FROM `image` ' +
                            'WHERE idtheme = ?',
                            [idtheme], function (err, rows, fields) {

                                if (err) {
                                    res.sendStatus(500);
                                    console.log("500 : GET : images \n");
                                }
                                else {
                                    images = JSON.stringify(rows);
                                    console.log("200 : GET : images \n");

                                    /**
                                     * Selection des commentaires
                                     */
                                    connection.query(
                                        'SELECT idcommentaire, idtheme, emailutilisateur, commentaire, datecommentaire FROM `commenter` ' +
                                        'WHERE idtheme = ?',
                                        [idtheme], function (err, rows, fields) {
                                            if (err) {
                                                res.sendStatus(500);
                                                console.log("500 : GET : commentaires \n");
                                            }
                                            else {
                                                res.setHeader('Content-Type', 'application/json');
                                                res.writeHead(200);
                                                commentaires = JSON.stringify(rows);
                                                retour = '{"idtheme":' + idtheme + ',' +
                                                '"nomtheme":"' + nomtheme + '",' +
                                                '"textes":' + textes + ',' +
                                                '"images":' + images + ',' +
                                                '"commentaires":' + commentaires + '}';
                                                res.end(retour);
                                                console.log("200 : GET : commentaires \n");
                                            }
                                        });

                                }
                            });

                    }
                });


        }
    });
});

/**
 * Retourne la liste de carnets
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme
 * @return {JSON} theme
 */
app.get("/carnets", jsonParser, function (req, res) {
    connection.query(
        'SELECT * FROM `carnetvoyage`', function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("500 : GET : /carnets \n");
            }
            else {
                res.json(rows);
                console.log("200 : GET : /carnet \n");
            }
        });
});

/**
 * Retourne la liste des textes d'un theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/textes
 * @return {JSON} textes
 */
app.get("/carnets/:idcarnetvoyage/themes/:idtheme/textes", jsonParser, function (req, res) {
    var theme = req.params.idtheme;

    connection.query(
        'SELECT idtexte, titretexte, contenutexte, datetexte, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("500 : GET : /carnets/themes/textes \n");
            }
            else {
                res.json(rows);
                console.log("200 : GET : /carnets/themes/textes \n");
            }
        });
});

/**
 * Retourne la liste des images d'un theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/images
 * @return {JSON} images
 */
app.get("/carnets/:idcarnetvoyage/themes/:idtheme/images", jsonParser, function (req, res) {
    var theme = req.params.idtheme;

    connection.query(
        'SELECT idimage, pathimage, legendeimage, titreimage, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `image` ON `theme`.idtheme = `image`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("500 : GET : /carnets/themes/images \n");
            }
            else {
                res.json(rows);
                console.log("200 : GET : /carnets/themes/images \n");
            }
        });
});

/**
 * Retourne les commentaires du theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/commentaires
 * @return {JSON} commentaire
 */
app.get("/carnets/:idcarnetvoyage/themes/:idtheme/commentaires", jsonParser, function (req, res) {
    var theme = req.params.idtheme;

    connection.query(
        'SELECT * ' +
        'FROM `commenter` ' +
        'WHERE idtheme = ?',
        [theme], function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("500 : GET : carnets/themes/commenter \n");
            }
            else {
                res.json(rows);
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});

/**
 * Retourne la liste des themes du carnet
 *
 * @method /carnets/:idtheme/themes
 * @return {JSON} themes
 */
app.get("/carnets/:idcarnet/themes", jsonParser, function (req, res) {
    var theme = req.params.idcarnet;

    connection.query(
        'SELECT * ' +
        'FROM `theme` ' +
        'WHERE idcarnetvoyage = ?;',
        [theme], function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("500 : GET : /carnets/themes \n");
            }
            else {
                res.json(rows);
                console.log("200 : GET : /carnets/themes \n");
            }
        });
});

/**
 * Retourne l'id du carnet de utilisateurs
 *
 * @method /utilisateurs/:emailutilisateur/carnet
 * @return {JSON} idcarnetvoyage, nomcarnetvoyage
 */
app.get("/utilisateurs/:emailutilisateur/carnet", jsonParser, function (req, res) {
    var emailutilisateur = req.params.emailutilisateur;

    connection.query(
        'SELECT idcarnetvoyage, nomcarnetvoyage ' +
        'FROM `carnetvoyage` ' +
        'WHERE emailutilisateur = ?;',
        [emailutilisateur], function (err, rows, fields) {
            if (err) {
                res.sendStatus(500)
                console.log("500 : GET : /utilisateurs/carnet \n");
            }
            else {
                res.json(rows[0]);
                console.log("200 : GET : /utilisateurs/carnet \n");
            }
        });
});

/**
 * Retourne un utilisateur
 *
 * @method /utilisateurs/:emailutilisateur
 * @return {JSON} utilisateur
 */
app.get("/utilisateurs/:emailutilisateur", jsonParser, function (req, res) {
    var emailutilisateur = req.params.emailutilisateur;

    connection.query(
        'SELECT * ' +
        'FROM `utilisateur` ' +
        'WHERE emailutilisateur = ?;',
        [emailutilisateur], function (err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("500 : GET : /utilisateurs \n");
            } else {
                if (rows.length == 0) {
                    res.sendStatus(204);
                    console.log("pas de donnée");
                }
                else {
                    res.json(rows[0]);
                    console.log("200 : GET : /utilisateurs/carnet \n");
                }
            }
        });
});

/**
 * Retourne une image
 *
 * @method /uploads/:idcarnetvoyage/:idtheme/:idimage
 * @return {JSON} image
 */
app.get("/uploads/:idcarnetvoyage/:idtheme/:idimage", jsonParser, function (req, res) {
    var img = fs.readFileSync('uploads/' + req.params.idcarnetvoyage + '/' + req.params.idtheme + '/'
    + req.params.idimage);
    res.writeHead(200, {'Content-Type': 'image/*'});
    res.end(img, 'binary');
});


//POST

/**
 * Ajout d'un utilisateur
 *
 * @method /utilisateurs/:emailutilisateur
 * @param {String} motdepasse
 * @param {String} nomcarnetvoyage
 * @return {JSON} utilisateur
 */
app.post("/utilisateurs", jsonParser, function (req, res) {
    var user;

    //Génération d'un token
    var token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

    if (req.body && req.body.motdepasse) {
        connection.query('INSERT INTO `utilisateur`(`emailutilisateur`, `motdepasse`, `token`) ' +
            'VALUES (' +
            '"' + req.body.emailutilisateur + '",' +
            '"' + req.body.motdepasse + '",' +
            '"' + token + '")',
            function (err, rows, fields) {
                if (err) {
                    res.sendStatus(500);
                    console.log("500 : POST : /utilsateur/");
                } else {
                    user = '{"emailutilisateur":"' + req.body.emailutilisateur + '"}';

                    var nomCarnet;
                    if (req.body.nomcarnetvoyage) {
                        nomCarnet = req.body.nomcarnetvoyage;
                    } else {
                        nomCarnet = "Carnet de " + req.body.emailutilisateur;
                    }
                    connection.query('INSERT INTO `carnetvoyage`(`nomcarnetvoyage`, `emailutilisateur`)' +
                        'VALUES (' +
                        '"' + nomCarnet + '",' +
                        '"' + req.body.emailutilisateur + '")'
                    );

                    connection.query('SELECT `utilisateur`.emailutilisateur, `utilisateur`.token, `carnetvoyage`.idcarnetvoyage ' +
                    'FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur` ' +
                    'WHERE `utilisateur`.motdepasse = "' + req.body.motdepasse + '" AND ' +
                    '`utilisateur`.emailutilisateur = "' + req.body.emailutilisateur + '"', function
                        (err, rows, fields) {
                        if (err || rows.length == 0 || rows.length >= 2) {
                            console.log("500 : select : authenticate");
                            res.sendStatus(500);
                        }
                        else {
                            res.json(rows[0]);
                        }
                    });
                }
            });
    }
    else {
        res.sendStatus(400);
    }
});

/**
 * Ajout d'un carnet
 *
 * @method /utilisateur/:emailutilisateur/carnet
 * @param {String} token
 * @param {String} nomcarnetvoyage
 * @return {JSON} carnet
 */
app.post("/utilisateurs/:emailutilisateur/carnet", jsonParser, function (req, res) {

    if (req.body && req.headers.token && req.body.nomcarnetvoyage) {

        connection.query("SELECT * FROM `utilisateur` WHERE " +
            "emailutilisateur = '" + req.params.emailutilisateur + "' AND " +
            "token = '" + req.headers.token + "';",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /token - carnet \n");
                }
                else {
                    //Execution
                    connection.query('INSERT INTO `carnetvoyage`(`nomcarnetvoyage`, `emailutilisateur`)' +
                        'VALUES (' +
                        '"' + req.body.nomcarnetvoyage + '",' +
                        '"' + req.params.emailutilisateur + '")'
                    );

                    connection.query("SELECT * FROM `carnetvoyage` WHERE " +
                        "emailutilisateur = '" + req.params.emailutilisateur + "';",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : POST : /carnet \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : POST : /carnet \n");
                            }
                        });
                }
            });
    } else {
        res.sendStatus(400);
    }

});

/**
 * Ajout d'un theme
 *
 * @method /carnets/:idcarnetvoyage/theme
 * @param {String} token
 * @param {String} nomtheme
 * @return {JSON} theme
 */
app.post("/carnets/:idcarnetvoyage/themes", jsonParser, function (req, res) {
    if (req.body && req.headers.token && req.body.nomtheme) {

        //Verification token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    //Execution
                    connection.query('INSERT INTO `theme`(`nomtheme`, `idcarnetvoyage`) ' +
                        'VALUES (' +
                        '"' + req.body.nomtheme + '", ' +
                        '' + req.params.idcarnetvoyage + ')'
                    );

                    connection.query("SELECT * FROM `theme` WHERE " +
                        "nomtheme = '" + req.body.nomtheme + "' AND " +
                        "idcarnetvoyage = " + req.params.idcarnetvoyage + " ;",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : POST : /theme \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : POST : /theme \n");
                            }
                        });
                }
            });


    } else {
        res.sendStatus(400);
    }
});

/**
 * Ajout d'un nouveau texte
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/textes
 * @param {String} token
 * @param {String} titretexte
 * @param {String} contenutexte
 * @param {String} datetexte "AAAA-MM-DD HH:MM:SS"
 * @return {JSON} texte
 */
app.post("/carnets/:idcarnetvoyage/themes/:idtheme/textes", jsonParser, function (req, res) {

    if (req.body && req.headers.token && req.params.idcarnetvoyage) {
        //Verification du Token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    //Execution
                    connection.query('' +
                        'INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) '
                        +
                        'VALUES (' +
                        '"' + req.body.titretexte + '",' +
                        '"' + req.body.contenutexte + '",' +
                        '"' + req.body.datetexte + '",' +
                        '' + req.params.idtheme + ')'
                    );

                    connection.query("SELECT * FROM `texte` WHERE " +
                        "titretexte = '" + req.body.titretexte + "'AND " +
                        "contenutexte = '" + req.body.contenutexte + "' AND " +
                        "datetexte = '" + req.body.datetexte + "' AND " +
                        "idtheme = " + req.params.idtheme + " ;",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : POST : /texte \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : POST : /texte \n");
                            }
                        });
                }
            });
    } else {
        req.sendStatus(400);
    }
});

/**
 * Ajout d'un commentaire sur le theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/commentaires
 * @param {String} token
 * @param {String} emailutilisateur
 * @param {String} commentaire
 * @param {String} datecommentaire "AAAA-MM-DD HH:MM:SS"
 * @return {JSON} commentaire
 */
app.post("/carnets/:idcarnetvoyage/themes/:idtheme/commentaires", jsonParser, function (req, res) {

    if (req.body && req.body.emailutilisateur && req.headers.token) {

        //verification Token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            /*"`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +*/
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    //execution
                    connection.query('' +
                    'INSERT INTO `commenter`(`idtheme`, `emailutilisateur`, `commentaire`, `datecommentaire`) ' +
                    'VALUES (' +
                    '' + req.params.idtheme + ',' +
                    '"' + req.body.emailutilisateur + '",' +
                    '"' + req.body.commentaire + '",' +
                    '"' + req.body.datecommentaire + '")');

                    connection.query("SELECT * FROM `commenter` WHERE " +
                        "emailutilisateur = '" + req.body.emailutilisateur + "' AND " +
                        "commentaire = '" + req.body.commentaire + "' AND " +
                        "datecommentaire = '" + req.body.datecommentaire + "' AND " +
                        "idtheme = " + req.params.idtheme + " ;",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : POST : /com \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : POST : /com \n");
                            }
                        });
                }
            });


    }
    else {
        res.sendStatus(400);
    }
});

/**
 * Ajout d'une nouvelle image
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/images
 * @param {String} token
 * @param {String} legendeimage
 * @return {JSON} image
 */
app.post('/carnets/:idcarnetvoyage/themes/:idtheme/images', multer({
    dest: 'uploads/',
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    changeDest: function (dest, req, res) {
        var newDestination = dest + req.params.idcarnetvoyage + "/" + req.params.idtheme;
        var stat = null;

        try {
            fs.mkdirSync(dest + req.params.idcarnetvoyage);
        } catch (err) {
        }

        try {
            fs.mkdirSync(dest + req.params.idcarnetvoyage + "/" + req.params.idtheme);
        } catch (err) {
        }

        try {
            stat = fs.statSync(newDestination);
            console.log("newDest");
        } catch (err) {
            /*fs.mkdirSync(dest + req.params.idcarnetvoyage);
             fs.mkdirSync(dest + req.params.idcarnetvoyage + "/" + req.params.idtheme);*/
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }
        return newDestination;
    }

}), function (req, res) {
    if (req.body && req.files && req.headers.token) {
        //Verification
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - image \n");
                }
                else {
                    //Execution
                    connection.query('INSERT INTO `image`(`pathimage`, `legendeimage`, `titreimage`, `idtheme`) ' +
                    'VALUES ("' + basepath + '/uploads/' + req.params.idcarnetvoyage + '/' +
                    req.params.idtheme + '/' + req.files.file.name + '","' +
                    req.body.legendeimage + '","' +
                    req.files.file.name + '",' +
                    req.params.idtheme + ')');

                    connection.query("SELECT * FROM `image` WHERE " +
                            /*"pathimage = '" + req.body.path +"' AND " +*/
                        "legendeimage = '" + req.body.legendeimage + "' AND " +
                        "titreimage = '" + req.files.file.name + "' AND " +
                        "idtheme = " + req.params.idtheme + "",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : POST : /img \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : POST : /img \n");
                            }
                        });
                }
            });
    }
    else {
        res.sendStatus(400);
        console.log("400 : POST : /img \n");
    }
});


//PUT

/**
 * Modification du texte
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/textes/:idtexte
 * @param {String} token
 * @param {String} titretexte
 * @param {String} contenutexte
 * @param {String} datetexte "AAAA-MM-DD HH:MM:SS"
 * @return {JSON} texte
 */
app.put("/carnets/:idcarnetvoyage/themes/:idtheme/textes/:idtexte", jsonParser, function (req, res) {
    if (req.body && req.body.titretexte && req.body.contenutexte && req.headers.token) {

        //VerifToken
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    //Execution
                    connection.query('UPDATE `texte` ' +
                    'SET `titretexte`= "' + req.body.titretexte + '",' +
                    '`contenutexte`= "' + req.body.contenutexte + '" ' +
                    'WHERE idtexte = ' + req.params.idtexte + '');

                    connection.query("SELECT * FROM `texte` WHERE " +
                    "idtexte = " + req.params.idtexte + " ;", function (err, rows, fields) {
                        if (err || rows.length == 0) {
                            res.sendStatus(500);
                            console.log("500 : PUT : /texte \n");
                        }
                        else {
                            res.json(rows[0]);
                            console.log("200 : PUT : /texte \n");
                        }
                    });
                }
            });
    }
    else {
        res.sendStatus(400);
    }
});

/**
 * Modification de l'image
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/images
 * @param {String} token
 * @param {String} pathimage
 * @param {String} legendeimage
 * @param {String} titreimage
 * @return {JSON} image
 */
app.put("/carnets/:idcarnetvoyage/themes/:idtheme/images/:idimage", jsonParser, function (req, res) {
    if (req.body && req.headers.token && req.params.idcarnetvoyage) {

        //Verification du Token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    connection.query('UPDATE `image` SET ' +
                    '`pathimage`= "' + req.body.pathimage + '",' +
                    '`legendeimage`= "' + req.body.legendeimage + '",' +
                    '`titreimage`= "' + req.body.titreimage + '" ' +
                    'WHERE idimage = ' + req.params.idimage + '');

                    connection.query("SELECT * FROM `image` WHERE " +
                        "idimage = " + req.params.idtmage + " ;",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : POST : /texte \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : POST : /image \n");
                            }
                        });
                }
            });
    }
    else {
        res.sendStatus(400);
    }
});

/**
 * Modification du nom du theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme
 * @param {String} token
 * @param {String} nomtheme
 * @return {JSON} theme
 */
app.put("/carnets/:idcarnetvoyage/themes/:idtheme", jsonParser, function (req, res) {

    if (req.body && req.body.nomtheme && req.headers.token) {

        //Verification token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    connection.query('UPDATE `theme` SET ' +
                    '`nomtheme`= "' + req.body.nomtheme + '" ' +
                    'WHERE idtheme = ' + req.params.idtheme + '');

                    connection.query("SELECT * FROM `theme` WHERE " +
                        "idtheme = " + req.params.idtheme + " ;",
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : PUT : /theme \n");
                            }
                            else {
                                res.json(rows[0]);
                                console.log("200 : PUT : /theme \n");
                            }
                        });
                }
            });
    } else {
        res.sendStatus(400);
    }
});


//DELETE

/**
 * Suppression d'un texte
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/textes/:idtexte
 * @param {String} token
 * @return {200} return 200 on success
 */
app.delete("/carnets/:idcarnetvoyage/themes/:idtheme/textes/:idtexte", jsonParser, function (req,
                                                                                             res) {
    if (req.body && req.headers.token) {
        //Verification token
        //console.log(req.headers.token);
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    connection.query('DELETE FROM `texte` WHERE idtexte = ' + req.params.idtexte,
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : DEL : /texte \n");
                            }
                            else {
                                res.sendStatus(200);
                                console.log("200 : DEL : /texte \n");
                            }
                        });
                }
            });
    } else {
        res.sendStatus(400);
    }
});

/**
 * Suppression d'une image
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/images/:idimage
 * @param {String} token
 * @return {200} return 200 on success
 */
app.delete("/carnets/:idcarnetvoyage/themes/:idtheme/images/:idimage", jsonParser, function (req,
                                                                                             res) {
    if (req.body && req.headers.token) {
        //Verification token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : DEL : /verifToken - image \n");
                }
                else {
                    connection.query('DELETE FROM `image` ' +
                        'WHERE idimage = ' + req.params.idimage,
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : DEL : /image \n");
                            }
                            else {
                                res.sendStatus(200);
                                console.log("200 : DEL : /image \n");
                            }
                        });
                }
            });
    } else {
        res.sendStatus(400);
    }
});

/**
 * Suppression d'un commentaire
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme/commentaires/:idcommentaire
 * @param {String} token
 * @return {200} return 200 on success
 */
app.delete("/carnets/:idcarnetvoyage/themes/:idtheme/commentaires/:idcommentaire", jsonParser,
    function (req, res) {

        if (req.body && req.headers.token) {
            //Verification token
            connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
                "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
                " `utilisateur`.`token` = '" + req.headers.token + "'",
                function (err, rows, fields) {
                    if (err || rows.length == 0) {
                        res.sendStatus(500);
                        console.log("500 : POST : /verifToken - theme \n");
                    }
                    else {
                        connection.query('DELETE FROM `commenter` ' +
                            'WHERE idcommentaire = ' + req.params.idcommentaire + '',
                            function (err, rows, fields) {
                                if (err || rows.length == 0) {
                                    res.sendStatus(500);
                                    console.log("500 : DEL : /commenter \n");
                                }
                                else {
                                    res.sendStatus(200);
                                    console.log("200 : DEL : /commenter \n");
                                }
                            });
                    }
                });
        } else {
            res.sendStatus(400);
        }
    });

/**
 * Suppression d'un theme
 *
 * @method /carnets/:idcarnetvoyage/themes/:idtheme
 * @param {String} token
 * @return {200} return 200 on success
 */
app.delete("/carnets/:idcarnetvoyage/themes/:idtheme", jsonParser, function (req, res) {

    if (req.body && req.headers.token) {
        //Verification token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : DEL /verifToken - theme \n");
                }
                else {
                    connection.query('DELETE FROM `theme` ' +
                        'WHERE idtheme = ' + req.params.idtheme + '',
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : DEL : /theme \n");
                            }
                            else {
                                res.sendStatus(200);
                                console.log("200 : DEL : /theme \n");
                            }
                        });
                }
            });
    } else {
        res.sendStatus(400);
    }
});

/**
 * Suppression d'un carnet
 *
 * @method /carnets/:idcarnetvoyage
 * @param {String} token
 * @return {200} return 200 on success
 */
app.delete("/carnets/:idcarnetvoyage", jsonParser, function (req, res) {

    if (req.body && req.headers.token) {
        //verification token
        connection.query("SELECT * FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur`  WHERE " +
            "`carnetvoyage`.`idcarnetvoyage` = " + req.params.idcarnetvoyage + " AND " +
            " `utilisateur`.`token` = '" + req.headers.token + "'",
            function (err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /verifToken - theme \n");
                }
                else {
                    connection.query('DELETE FROM `carnetvoyage` ' +
                        'WHERE idcarnetvoyage = ' + req.params.idcarnetvoyage + '',
                        function (err, rows, fields) {
                            if (err || rows.length == 0) {
                                res.sendStatus(500);
                                console.log("500 : DEL : /carnet \n");
                            }
                            else {
                                res.sendStatus(200);
                                console.log("200 : DEL : /carnet \n");
                            }
                        });
                }
            });
    } else {
        res.sendStatus(400);
    }
});

app.listen(3000);