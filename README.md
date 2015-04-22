# ServerNode

Server REST permettant d'accèder à la base de données de notre application "Carnet de Voyage".

Pour installer et exécuter, suivez les trois étapes dans l'ordre :
Installation, Importation de la base de données et Exécution.

Pré-requis
----------
Installation de nodeJS : https://nodejs.org/download/

Installation
------------
Pour installer l'application, il faut simplement récupérer ce répertoire Git (git clone)

Importation de la base de données
---------------------------------
Créer une base de données MySQL appelée "carnetvoyage".
Importer la structure de la base de données avec le fichier carnetvoyage.sql

Exécution
---------
Pour lancer le serveur, il suffit d'exécuter la commande "node mysql.js" dans le répertoire d'installation du serveur.

Si l'application affiche "Database is connected", le serveur est en fonctionnement.

NB: La configuration de base de données par défaut est :
{	
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'carnetvoyage'
}