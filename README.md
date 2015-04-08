# ServerNode

Server REST permettant d'accèder à la base de données, backend de notre application "Carnet de Voyage".

Authentificate
---------------

Authentification avec un POST : **/authenticate**

Paramètre : 
 * emailutilisateur 
 * motdepasse 

Retour :
 * token à inclure dans les prochaines requètes.

GET : READ
----------
Retourne la liste des textes d'un theme : /themes/textes/id/:id (id du theme)
Retourne la liste des images d'un theme : /themes/images/id/:id (id du theme)
Retourne les commentaires du theme : /themes/commentaires/id/:id (id du theme)
Retourne la liste des themes du carnet : /carnet/themes/id/:id (id du carnet)
Retourne l'id et le nom du carnet du users :/carnet/email/:email (email utilisateur)


POST : CREATE
-------------
Ajout d'un utilisateur et d'un carnet lié à l'utilisateur : /utilisateur (emailutilisateur, motdepasse, nomcarnet) - Retourne l'id du carnet.

Ajout d'un theme : /theme : var nomtheme;
    var emailutilisateur;
    var idcarnetvoyage = '';

Ajout d'un nouveau texte : /texte : var titretexte;
    var contenutexte;
    var datetexte;
    var idtheme;

Ajout d'un commentaire : /commenter
var idtheme;
    var emailtutilisateur;
    var commentaire;
    var datecommentaire
    
Ajout d'une nouvelle image : /image 
var idtheme;
    var emailtutilisateur;
    var commentaire;
    var datecommentaire
    
    
PUT : UPDATE
------------
Modification du texte : /texte : var titretexte;
    var contenutexte;
    var datetexte;
    var idtexte;
    
Modification de l'image : /image : var pathimage;
    var legendeimage;
    var titreimage;
    var idimage;
    
Modification du nom du theme : /theme
var nomtheme;
    var idtheme;


DELETE : DELETE
---------------
Suppression d'un texte : /texte : var idtexte;
Suppression d'une image : /image :  var idimage
Suppression d'un commentaire : /commenter :  var idtheme;
    var emailutilisateur;
Suppression d'un theme : /theme : var idtheme
Suppression d'un carnet : /carnet : var idcarnet



