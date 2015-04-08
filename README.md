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
Retourne la liste des textes d'un theme : **/themes/textes/id/:id** (id du theme)

Retourne la liste des images d'un theme : **/themes/images/id/:id** (id du theme)

Retourne les commentaires du theme : **/themes/commentaires/id/:id** (id du theme)

Retourne la liste des themes du carnet : **/carnet/themes/id/:id** (id du carnet)

Retourne l'id et le nom du carnet du users : **/carnet/email/:email** (email utilisateur)


POST : CREATE
-------------
Ajout d'un utilisateur et d'un carnet lié à l'utilisateur : **/utilisateur**  
Paramètre :
* emailutilisateur 
* motdepasse
* nomcarnet  
Retour :
* id du carnet.

Ajout d'un theme : **/theme**  
Paramètre : 
* nomtheme
* emailutilisateur
* idcarnetvoyage  
Retour :
* id du theme

Ajout d'un nouveau texte : **/texte**  
Paramètre :
* titretexte
* contenutexte
* datetexte
* idtheme  
Retour :
* id du texte

Ajout d'un commentaire : **/commenter**  
Paramètre :
* idtheme
* emailtutilisateur
* commentaire
* datecommentaire  
Retour :
* id commentaire
    
Ajout d'une nouvelle image : **/image**  
Paramètre :
* idtheme
* emailtutilisateur
* commentaire
* datecommentaire  
Retour :
* id image
    
    
PUT : UPDATE
------------
Modification du texte : **/texte**  
Paramètre :
* titretexte
* contenutexte
* datetexte
* idtexte
    
Modification de l'image : **/image**  
Paramètre :
* pathimage
* legendeimage
* titreimage
* idimage
    
Modification du nom du theme : **/theme**  
Paramètre :
* nomtheme
* idtheme


DELETE : DELETE
---------------
Suppression d'un texte : **/texte**  
Paramètre :
* idtexte

Suppression d'une image : **/image**  
Paramètre :
* idimage

Suppression d'un commentaire : **/commenter**  
Paramètre :
* idtheme
* emailutilisateur
    
Suppression d'un theme : **/theme**  
Paramètre :
* idtheme

Suppression d'un carnet : **/carnet**  
Paramètre :
* idcarnet



