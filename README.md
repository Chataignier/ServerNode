# ServerNode

Server REST permettant d'accèder à la base de données, backend de notre application "Carnet de Voyage".  
Executer dans un terminale "node mysql.js" 
Une base de données MySQL "carnetvoyage" doit être creer. Importé ensuite sa structure (fichier carnetvoyage.sql)


Authentificate
---------------

###Authentification avec un POST -check: 
**/authenticate**  
Paramètre : 
 * emailutilisateur 
 * motdepasse  

Retour :
 * token à inclure dans les prochaines requètes.
 * users avec (email, idcarnetvoyage)

GET : READ
----------
###Retourne la liste des themes du carnet -check
**/carnets/:idCarnet/themes**

##Retourne le contenu d'un theme -check
**/carnets/:idCarnet/themes/:idTheme**

###Retourne la liste des textes d'un theme -check:
**/carnets/:idCarnet/themes/:idTheme/textes** (id du theme)

###Retourne la liste des images d'un theme -check: 
**/carnets/:idCarnet/themes/:idTheme/images** (id du theme)

###Retourne les commentaires du theme -check: 
**/carnets/:idCarnet/themes/:idTheme/commentaires** (id du theme)

###Retourne l'id et le nom du carnet du users -check: 
**/users/:idUsers/carnet** (email utilisateur)


POST : CREATE
-------------
###Ajout d'un utilisateur -check: 
**/users/:idUser**  
Paramètre :
* emailutilisateur 
* motdepasse
* nomcarnet

Retour :
* id du carnet.

###Ajout d'un carnet -check
**/users/:idUser/carnet**

###Ajout d'un theme -check : 
**/carnets/:idCarnet/theme**  
Paramètre : 
* nomtheme
* emailutilisateur
* idcarnetvoyage  

Retour :
* id du theme


###Ajout d'un nouveau texte : 
**/carnets/:idCarnet/themes/:idTheme/texte**  
Paramètre :
* titretexte
* contenutexte
* datetexte
* idtheme  

Retour :
* id du texte


###Ajout d'un commentaire : 
**/carnets/:idCarnet/themes/:idTheme/commenter**  
Paramètre :
* idtheme
* emailtutilisateur
* commentaire
* datecommentaire  

Retour :
* id commentaire
    

###Ajout d'une nouvelle image :
**/carnets/:idCarnet/themes/:idTheme/image**  
Paramètre :
* idtheme
* emailtutilisateur
* commentaire
* datecommentaire  

Retour :
* id image
    
    
PUT : UPDATE
------------
###Modification du texte : 
**/carnets/:idCarnet/themes/:idTheme/texte/:idTexte**  
Paramètre :
* titretexte
* contenutexte
* datetexte
* idtexte
    

###Modification de l'image : 
**/carnets/:idCarnet/themes/:idTheme/images/:idImage**  
Paramètre :
* pathimage
* legendeimage
* titreimage
* idimage
    

###Modification du nom du theme : 
**/carnets/:idCarnet/themes/:idTheme**  
Paramètre :
* nomtheme
* idtheme

DELETE : DELETE
---------------
###Suppression d'un texte : 
**/carnets/:idCarnet/themes/:idTheme/textes/:idTexte**  
Paramètre :
* idtexte


###Suppression d'une image : 
**/carnets/:idCarnet/themes/:idTheme/images/:idImage**  
Paramètre :
* idimage


###Suppression d'un commentaire : 
**/carnets/:idCarnet/themes/:idTheme/commentaire/:idCommentaire**  
Paramètre :
* idtheme
* emailutilisateur
    

###Suppression d'un theme : 
**/carnets/:idCarnet/themes/:idTheme**  
Paramètre :
* idtheme


Suppression d'un carnet : 
**/carnets/:idCarnet**  
Paramètre :
* idcarnet
