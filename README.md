# ServerNode

Server REST permettant d'accèder à la base de données de notre application "Carnet de Voyage".
Une base de données MySQL "carnetvoyage" doit être creer. Importé ensuite sa structure (fichier carnetvoyage.sql)  

Pour installer et executer, suivez les trois étapes dans l'ordre :
Installation, Import de la base, Execution.

Installation
------------

Vous devez tout d'abord installer les dépendances suivantes pour pouvoir executer l'application ServerNode.  

Installation de nodeJS : https://nodejs.org/download/

Import de la base de données
----------------------------
Installation de WAMP.

Creer une base de données appelée "carnetvoyage".

Importer la base de données avec le fichier carnetvoyage.sql

Execution
---------
Apres avoir installé le projet (git clone sur votre ordinateur), et la base de données vous pouvez à présent l'executer.

Placez-vous à la racine du projet (C:/.../../ServerNode/) avec un console windows (cmd). Puis executer la commande suivante "node mysql.js".

Si l'application s'executer bien vous devriez voir afficher "Database is connected".

Les identifiants de notre base de données en local sont : user:"root" password: Pas de password
