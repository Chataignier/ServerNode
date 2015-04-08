-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Client :  127.0.0.1
-- Généré le :  Mer 08 Avril 2015 à 15:04
-- Version du serveur :  5.6.17
-- Version de PHP :  5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données :  `carnetvoyage`
--

-- --------------------------------------------------------

--
-- Structure de la table `carnetvoyage`
--

CREATE TABLE IF NOT EXISTS `carnetvoyage` (
  `idcarnetvoyage` int(10) NOT NULL AUTO_INCREMENT,
  `nomcarnetvoyage` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `emailutilisateur` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`idcarnetvoyage`),
  KEY `index` (`emailutilisateur`),
  KEY `emailutilisateur` (`emailutilisateur`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

-- --------------------------------------------------------

--
-- Structure de la table `commenter`
--

CREATE TABLE IF NOT EXISTS `commenter` (
  `idcommentaire` int(10) NOT NULL AUTO_INCREMENT,
  `idtheme` int(10) NOT NULL,
  `emailutilisateur` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `commentaire` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `datecommentaire` datetime NOT NULL,
  PRIMARY KEY (`idcommentaire`),
  KEY `idcommentaire` (`idcommentaire`),
  KEY `idtheme` (`idtheme`),
  KEY `emailutilisateur` (`emailutilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `image`
--

CREATE TABLE IF NOT EXISTS `image` (
  `idimage` int(10) NOT NULL AUTO_INCREMENT,
  `pathimage` varchar(512) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `legendeimage` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `titreimage` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `idtheme` int(10) NOT NULL,
  PRIMARY KEY (`idimage`),
  KEY `index` (`idtheme`),
  KEY `idtheme` (`idtheme`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11 ;

-- --------------------------------------------------------

--
-- Structure de la table `texte`
--

CREATE TABLE IF NOT EXISTS `texte` (
  `idtexte` int(10) NOT NULL AUTO_INCREMENT,
  `titretexte` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `contenutexte` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `datetexte` datetime NOT NULL,
  `idtheme` int(10) NOT NULL,
  PRIMARY KEY (`idtexte`),
  KEY `index` (`idtheme`),
  KEY `idtheme` (`idtheme`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

-- --------------------------------------------------------

--
-- Structure de la table `theme`
--

CREATE TABLE IF NOT EXISTS `theme` (
  `idtheme` int(10) NOT NULL AUTO_INCREMENT,
  `nomtheme` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `idcarnetvoyage` int(10) NOT NULL,
  PRIMARY KEY (`idtheme`),
  KEY `index` (`idcarnetvoyage`),
  KEY `idcarnetvoyage` (`idcarnetvoyage`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=15 ;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE IF NOT EXISTS `utilisateur` (
  `emailutilisateur` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `motdepasse` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`emailutilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `carnetvoyage`
--
ALTER TABLE `carnetvoyage`
  ADD CONSTRAINT `carnetvoyage_ibfk_1` FOREIGN KEY (`emailutilisateur`) REFERENCES `utilisateur` (`emailutilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `commenter`
--
ALTER TABLE `commenter`
  ADD CONSTRAINT `commenter_ibfk_2` FOREIGN KEY (`emailutilisateur`) REFERENCES `utilisateur` (`emailutilisateur`),
  ADD CONSTRAINT `commenter_ibfk_1` FOREIGN KEY (`idtheme`) REFERENCES `theme` (`idtheme`);

--
-- Contraintes pour la table `image`
--
ALTER TABLE `image`
  ADD CONSTRAINT `image_ibfk_1` FOREIGN KEY (`idtheme`) REFERENCES `theme` (`idtheme`) ON DELETE CASCADE;

--
-- Contraintes pour la table `texte`
--
ALTER TABLE `texte`
  ADD CONSTRAINT `texte_ibfk_1` FOREIGN KEY (`idtheme`) REFERENCES `theme` (`idtheme`) ON DELETE CASCADE;

--
-- Contraintes pour la table `theme`
--
ALTER TABLE `theme`
  ADD CONSTRAINT `FK_THEME_CARNETVOYAGE` FOREIGN KEY (`idcarnetvoyage`) REFERENCES `carnetvoyage` (`idcarnetvoyage`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
