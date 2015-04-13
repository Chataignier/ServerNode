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
var fs = require('fs');
var bodyParser = require('body-parser');
var url = require('url');
var multer = require('multer');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'carnetvoyage'
});

/* Configuration */
var app = express();
var done = false;


/*app.use(multer({ dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename+Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done=true;
    }
}));*/

app.set('json spaces', 0);

var qs = require('querystring');

var jsonParser = bodyParser.json();

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
 * Authenticate
 */
app.post("/authenticate", jsonParser, function(req,res){
    if(req.body && req.body.email && req.body.password) {
        connection.query('SELECT `utilisateur`.emailutilisateur, `utilisateur`.token, `carnetvoyage`.idcarnetvoyage ' +
        'FROM `utilisateur` INNER JOIN `carnetvoyage` ON `utilisateur`.`emailutilisateur` = `carnetvoyage`.`emailutilisateur` ' +
        'WHERE `utilisateur`.motdepasse = "'+ req.body.password +'" AND ' +
        '`utilisateur`.emailutilisateur = "'+ req.body.email +'"', function(err, rows, fields) {
            if (err || rows.length == 0 || rows.length >= 2) {
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
 * LogOut
 */
app.post("/logout", jsonParser, function(req,res){
    if(req.body && req.body.email) {
        connection.query('UPDATE `utilisateur` SET `token`= null WHERE emailutilisateur = "'+ req.body.email +'"', function(err, rows, fields) {
            if (err) {
                res.sendStatus(500);
                console.log("logout 500");
            }else{
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
 * Verif token
 */
function verificationToken(email, token){
    connection.query('SELECT * FROM `utilisateur` WHERE emailutilisateur = "'+email+'" AND token = "'+token+'"', function(err, rows, fields) {
        if (err || rows.length == 0) {
            return false;
        }
        else {
            return true;
        }
    });
}


//GET

/**
 * Retourne un theme
 * /carnets/:idCarnet/themes/:idTheme
 */
app.get("/carnets/:idCarnet/themes/:idTheme", jsonParser, function(req,res){
    var idTheme = req.params.idTheme;

    var nomTheme;
    var textes;
    var images;
    var commentaires;
    var retour;

    /**
     * Selection du theme
     */
    connection.query('SELECT nomtheme FROM `theme` WHERE idtheme = ?', [idTheme], function(err, rows, fields) {
            if (err) {
                res.sendStatus(500);
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
                res.sendStatus(500);
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
                res.sendStatus(500);
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
                res.sendStatus(500);
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
 */
app.get("/carnets", jsonParser, function(req,res){
    connection.query(
        'SELECT * FROM `carnetvoyage`', function(err, rows, fields) {
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
 * paramètre id du theme
 */
app.get("/carnets/:idCarnet/themes/:idTheme/textes", jsonParser, function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT idtexte, titretexte, contenutexte, datetexte, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `texte` ON `theme`.idtheme = `texte`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function(err, rows, fields) {
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
 * id theme
 */
app.get("/carnets/:idCarnet/themes/:idTheme/images", jsonParser, function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT idimage, pathimage, legendeimage, titreimage, `theme`.idtheme FROM `theme` ' +
        'INNER JOIN `image` ON `theme`.idtheme = `image`.idtheme ' +
        'WHERE `theme`.idtheme = ?',
        [theme], function(err, rows, fields) {
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
 * SELECT * FROM `commenter` WHERE idtheme = ?;
 */
app.get("/carnets/:idCarnet/themes/:idTheme/commentaires", jsonParser, function(req,res){
    var theme = req.params.idTheme;

    connection.query(
        'SELECT * ' +
        'FROM `commenter` ' +
        'WHERE idtheme = ?',
        [theme], function(err, rows, fields) {
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
 * SELECT * FROM `theme` WHERE idcarnetvoyage = ?;
 */
app.get("/carnets/:id/themes", jsonParser, function(req,res){
    var theme = req.params.id;

    connection.query(
        'SELECT * ' +
        'FROM `theme` ' +
        'WHERE idcarnetvoyage = ?;',
        [theme], function(err, rows, fields) {
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
 * SELECT idcarnetvoyage, nomcarnetvoyage FROM `carnetvoyage` WHERE emailutilisateur = ?;
 */
app.get("/utilisateurs/:idUtilisateurs/carnet", jsonParser, function(req,res){
    var email = req.params.idUtilisateurs;

    connection.query(
        'SELECT idcarnetvoyage, nomcarnetvoyage ' +
        'FROM `carnetvoyage` ' +
        'WHERE emailutilisateur = ?;',
        [email], function(err, rows, fields) {
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
 */
app.get("/utilisateurs/:idUtilisateur", jsonParser, function(req,res){
    var email = req.params.idUtilisateurs;

    connection.query(
        'SELECT * ' +
        'FROM `utilisateur` ' +
        'WHERE emailutilisateur = ?;',
        [email], function(err, rows, fields) {
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

app.get("/uploads/:idCarnet/:idTheme/:id", jsonParser, function(req,res){
    var img = fs.readFileSync('uploads/'+req.params.idCarnet+'/'+req.params.idTheme+'/'+req.params.id);
    res.writeHead(200, {'Content-Type': 'image/*' });
    res.end(img, 'binary');
});


//POST

/**
 * Ajout d'un utilisateur
 */
app.post("/utilisateurs/:idUser", jsonParser,function(req,res){
    var user;

    if(req.body && req.body.password){
        connection.query('INSERT INTO `utilisateur`(`emailutilisateur`, `motdepasse`, `token`) ' +
            'VALUES (' +
            '"'+ req.params.idUser +'",' +
            '"'+ req.body.password +'",' +
            '"token")',
            function(err, rows, fields) {
                if (err) {
                    res.sendStatus(500);
                    console.log("500 : POST : /utilsateur/");
                } else
                {
                    user = '{"emailutilisateur":"'+req.params.idUser+'"}';
                }
            });

        var nomCarnet;
        if(req.body.carnet) {
            nomCarnet = req.body.carnet;
        } else {
            nomCarnet = "Default";
        }
            connection.query('INSERT INTO `carnetvoyage`(`nomcarnetvoyage`, `emailutilisateur`)' +
                'VALUES (' +
                '"'+ nomCarnet +'",' +
                '"'+ req.params.idUser +'")'
            );

            connection.query("SELECT * FROM `carnetvoyage` WHERE " +
                "emailutilisateur = '" + req.params.idUser +"';",
                function(err, rows, fields) {
                    if (err || rows.length == 0) {
                        res.sendStatus(500);
                        console.log("500 : POST : /carnet \n");
                    }
                    else {
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(200);
                        res.end('{"utilisateur":'+user+',"carnetvoyage":'+JSON.stringify(rows[0])+'}');
                        console.log("200 : POST : /utilisateur \n");
                    }
                });

    }
    else {
        res.sendStatus(400);
    }
});

/**
 * Ajout d'un carnet
 */
app.post("/users/:idUser/carnet", jsonParser,function(req,res){

    //console.log(verificationToken(req.params.idUser, req.body.token));

    if(req.body && /*verificationToken(req.params.idUser, req.body.token) &&*/ req.body.carnet) {

        /*connection.query("SELECT * FROM `utilisateur` WHERE " +
            "emailutilisateur = '" + req.params.idUser +"' AND " +
            "token = '"+req.body.token+"';",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /carnet \n");
                }
            });*/

        //Execution
        connection.query('INSERT INTO `carnetvoyage`(`nomcarnetvoyage`, `emailutilisateur`)' +
            'VALUES (' +
            '"'+ req.body.carnet +'",' +
            '"'+ req.params.idUser +'")'
        );

        connection.query("SELECT * FROM `carnetvoyage` WHERE " +
            "emailutilisateur = '" + req.params.idUser +"';",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /carnet \n");
                }
                else {
                    res.json(rows[0]);
                    console.log("200 : POST : /carnet \n");
                }
            });

    } else {
        res.sendStatus(400);
    }

});

/**
 * Ajout d'un theme
 */
app.post("/carnets/:idCarnet/theme", jsonParser,function(req,res){
    if(req.body && req.body.token && req.body.theme) {

        //Verification Token

        //Execution
        connection.query('INSERT INTO `theme`(`nomtheme`, `idcarnetvoyage`) ' +
            'VALUES (' +
            '"'+ req.body.theme +'", ' +
            ''+ req.params.idCarnet +')'
        );

        connection.query("SELECT * FROM `theme` WHERE " +
            "nomtheme = '" + req.body.theme +"' AND " +
            "idcarnetvoyage = " + req.params.idCarnet +" ;",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /theme \n");
                }
                else {
                    res.json(rows[0]);
                    console.log("200 : POST : /theme \n");
                }
            });

    } else {
        res.sendStatus(400);
    }
});

/**
 * Ajout d'un nouveau texte
 * INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) VALUES ([value-2],[value-3],[value-4],[value-5])
 */
app.post("/carnets/:idCarnet/themes/:idTheme/texte", jsonParser,function(req,res){

    if(req.body) {
        //Verification du Token

        //Execution
        connection.query('' +
            'INSERT INTO `texte`(`titretexte`, `contenutexte`, `datetexte`, `idtheme`) ' +
            'VALUES (' +
            '"'+ req.body.titre +'",' +
            '"'+ req.body.contenu +'",' +
            '"'+ req.body.date +'",' +
            ''+ req.params.idTheme +')'
        );

        connection.query("SELECT * FROM `texte` WHERE " +
            "titretexte = '" + req.body.titre +"'AND " +
            "contenutexte = '" + req.body.contenu +"' AND " +
            "datetexte = '" + req.body.date +"' AND " +
            "idtheme = " + req.params.idTheme +" ;",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /texte \n");
                }
                else {
                    res.json(rows[0]);
                    console.log("200 : POST : /texte \n");
                }
            });
    } else {
        req.sendStatus(400);
    }
});

/**
 * Ajout d'un commentaire sur le theme
 * INSERT INTO `commenter`(`idtheme`, `emailutilisateur`, `commentaire`, `datecommentaire`) VALUES ([value-1],[value-2],[value-3],[value-4])
 */
app.post("/carnets/:idCarnet/themes/:idTheme/commenter", jsonParser,function(req,res){

    if(req.body && req.body.email) {

        //verif

        //execution
        connection.query('' +
        'INSERT INTO `commenter`(`idtheme`, `emailutilisateur`, `commentaire`, `datecommentaire`) ' +
        'VALUES (' +
        ''+ req.params.idTheme +',' +
        '"'+ req.body.email +'",' +
        '"'+ req.body.commentaire +'",' +
        '"'+ req.body.date +'")');

        connection.query("SELECT * FROM `commenter` WHERE " +
            "emailutilisateur = '" + req.body.email +"' AND " +
            "commentaire = '" + req.body.commentaire +"' AND " +
            "datecommentaire = '" + req.body.date +"' AND " +
            "idtheme = " + req.params.idTheme +" ;",
            function(err, rows, fields) {
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
    else {
        res.sendStatus(400);
    }
});

/**
 * Ajout d'une nouvelle image
 * INSERT INTO `image`(`pathimage`, `legendeimage`, `idtheme`, `titreimage`) VALUES ([value-2],[value-3],[value-4],[value-5])
 */
/*app.post("/carnets/:idCarnet/themes/:idTheme/imag", jsonParser,function(req,res){

    if(req.body && req.body.token) {

        //Verification


        //Execution
        connection.query('' +
        'INSERT INTO `image`(`pathimage`, `legendeimage`, `titreimage`, `idtheme`) ' +
        'VALUES (' +
        '"'+ req.body.path +'",' +
        '"'+ req.body.legende +'",' +
        '"'+ req.body.titre +'",' +
        ''+ req.params.idTheme +')');

        connection.query("SELECT * FROM `image` WHERE " +
            "pathimage = '" + req.body.path +"' AND " +
            "legendeimage = '" + req.body.legende +"' AND " +
            "titreimage = '" + req.body.titre +"' AND " +
            "idtheme = " + req.params.idTheme +"",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : POST : /img \n");
                }
                else {
                    res.json(rows[0]);
                    console.log("200 : POST : /img \n");
                }
            });
    } else {
        res.sendStatus(400);
    }
});*/

/**
 * Ajout d'une nouvelle image
 * idcarnet, idtheme, images, legende
 */
app.post('/carnets/:idCarnet/themes/:idTheme/image', jsonParser, multer({
    dest: 'uploads/',
    rename: function (fieldname, filename) {
        return filename+Date.now();

    },
    changeDest: function(dest, req, res) {
        var newDestination = dest + req.params.idCarnet + "/" + req.params.idTheme;
        var stat = null;
        try {
            stat = fs.statSync(newDestination);
            console.log("newDest");
        } catch (err) {
            fs.mkdirSync(dest + req.params.idCarnet);
            fs.mkdirSync(dest + req.params.idCarnet + "/" + req.params.idTheme);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }
        return newDestination
    }

}), function(req, res) {
    if(req.body) {

        //Verification
        //console.log(req.files.file.name);

        //Execution
        connection.query('' +
        'INSERT INTO `image`(`pathimage`, `legendeimage`, `titreimage`, `idtheme`) ' +
        'VALUES (' +
        '"/uploads/'+ req.params.idCarnet+ '/'+ req.params.idTheme +'/'+ req.files.file.name +'",' +
        '"'+ req.body.legende +'",' +
        '"'+ req.files.file.name +'",' +
        ''+ req.params.idTheme +')');

        connection.query("SELECT * FROM `image` WHERE " +
            /*"pathimage = '" + req.body.path +"' AND " +*/
            "legendeimage = '" + req.body.legende +"' AND " +
            "titreimage = '" + req.files.file.name +"' AND " +
            "idtheme = " + req.params.idTheme +"",
            function(err, rows, fields) {
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
    else {
        res.sendStatus(400);
        console.log("400 : POST : /img \n");
    }
});


//PUT

/**
 * Modification du texte
 *
 */
app.put("/carnets/:idCarnet/themes/:idTheme/texte/:idTexte", jsonParser, function(req,res){
    if(req.body && req.body.titre && req.body.contenu) {

        //VerifToken

        //Execution
        connection.query('UPDATE `texte` ' +
        'SET `titretexte`= "'+ req.body.titre +'",' +
        '`contenutexte`= "'+ req.body.contenu +'" ' +
        'WHERE idtexte = '+ req.params.idTexte +'');

        connection.query("SELECT * FROM `texte` WHERE " +
        "idtexte = " + req.params.idTexte +" ;",function(err, rows, fields) {
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
    else {
        res.sendStatus(400);
    }
});

/**
 * Modification de l'image
 *
 */
app.put("/carnets/:idCarnet/themes/:idTheme/images/:idImage", jsonParser, function(req,res){

    if(req.body) {
        connection.query('UPDATE `image` SET ' +
        '`pathimage`= "'+ req.body.path +'",' +
        '`legendeimage`= "'+ req.body.legende +'",' +
        '`titreimage`= "'+ req.body.titre +'" ' +
        'WHERE idimage = '+ req.params.idImage +'');

        connection.query("SELECT * FROM `image` WHERE " +
            "idimage = " + req.params.idImage +" ;",
            function(err, rows, fields) {
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
    else {
        res.sendStatus(400);
    }
});

/**
 * Modification du nom du theme
 * UPDATE `theme` SET `nomtheme`=[value-2] WHERE idtheme = ?;
 */
app.put("/carnets/:idCarnet/themes/:idTheme", jsonParser, function(req,res){

    if(req.body && req.body.theme) {
        connection.query('UPDATE `theme` SET ' +
        '`nomtheme`= "'+ req.body.theme +'" ' +
        'WHERE idtheme = '+ req.params.idTheme +'');

        connection.query("SELECT * FROM `theme` WHERE " +
            "idtheme = " + req.params.idTheme +" ;",
            function(err, rows, fields) {
                if (err || rows.length == 0) {
                    res.sendStatus(500);
                    console.log("500 : PUT : /texte \n");
                }
                else {
                    res.json(rows[0]);
                    console.log("200 : PUT : /theme \n");
                }
            });
    } else {
        res.sendStatus(400);
    }
});


//DELETE

/**
 * Suppression d'un texte
 * DELETE FROM `texte` WHERE idtexte = ?;
 */
app.delete("/carnets/:idCarnet/themes/:idTheme/textes/:idTexte", jsonParser, function(req,res){
    connection.query('DELETE FROM `texte` ' +
        'WHERE idtexte = '+ req.params.idTexte +'',
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.sendStatus(500);
                console.log("500 : DEL : /texte \n");
            }
            else {
                res.sendStatus(200);
                console.log("200 : DEL : /texte \n");
            }
        });
});

/**
 * Suppression d'une image
 * DELETE FROM `image` WHERE idimage = ?;
 */
app.delete("/carnets/:idCarnet/themes/:idTheme/images/:idImage", jsonParser, function(req,res){
    connection.query('DELETE FROM `image` ' +
        'WHERE idimage = '+ req.params.idImage +'',
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.sendStatus(500);
                console.log("500 : DEL : /texte \n");
            }
            else {
                res.sendStatus(200);
                console.log("200 : DEL : /texte \n");
            }
        });
});

/**
 * Suppression d'un commentaire
 * DELETE FROM `commenter` WHERE idtheme = ? AND emailutilisateur = ?;
 */
app.delete("/carnets/:idCarnet/themes/:idTheme/commentaires/:idCommentaire", jsonParser, function(req,res){
    connection.query('DELETE FROM `commenter` ' +
        'WHERE idcommentaire = '+ req.params.idCommentaire +'',
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.sendStatus(500);
                console.log("500 : DEL : /commenter \n");
            }
            else {
                res.sendStatus(200);
                console.log("200 : DEL : /commenter \n");
            }
        });
});

/**
 * Suppression d'un theme
 * DELETE FROM `theme` WHERE idtheme = ?;
 */
app.delete("/carnets/:idCarnet/themes/:idTheme", jsonParser, function(req,res){
    connection.query('DELETE FROM `theme` ' +
        'WHERE idtheme = '+ req.params.idTheme +'',
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.sendStatus(500);
                console.log("500 : DEL : /commenter \n");
            }
            else {
                res.sendStatus(200);
                console.log("200 : DEL : /commenter \n");
            }
        });
});

/**
 * Suppression d'un carnet
 * DELETE FROM `carnetvoyage` WHERE idcarnetvoyage = ?;
 */
app.delete("/carnets/:idCarnet", jsonParser, function(req,res){
    connection.query('DELETE FROM `carnetvoyage` ' +
        'WHERE idcarnetvoyage = '+ req.params.idCarnet +'',
        function(err, rows, fields) {
            if (err || rows.length == 0) {
                res.sendStatus(500);
                console.log("500 : DEL : /carnet \n");
            }
            else {
                res.sendStatus(200);
                console.log("200 : DEL : /carnet \n");
            }
        });
});

app.listen(3000);