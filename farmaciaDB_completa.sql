/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.1.2-MariaDB, for osx10.19 (arm64)
--
-- Host: localhost    Database: farmaciaDB
-- ------------------------------------------------------
-- Server version	12.1.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `despacho`
--

DROP TABLE IF EXISTS `despacho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `despacho` (
  `id_despacho` int(11) NOT NULL AUTO_INCREMENT,
  `id_tratamiento` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id_despacho`),
  KEY `fk_despacho_tratamiento` (`id_tratamiento`),
  KEY `fk_despacho_usuario` (`id_usuario`),
  CONSTRAINT `fk_despacho_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamiento` (`id_tratamiento`) ON UPDATE CASCADE,
  CONSTRAINT `fk_despacho_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `despacho`
--

LOCK TABLES `despacho` WRITE;
/*!40000 ALTER TABLE `despacho` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `despacho` VALUES
(1,1,1,'2026-01-10'),
(2,1,1,'2026-02-10'),
(3,2,1,'2025-12-15'),
(4,3,1,'2025-12-20'),
(5,4,1,'2026-01-08'),
(6,5,1,'2026-01-10'),
(7,7,1,'2026-01-10'),
(8,2,1,'2026-01-10'),
(9,8,1,'2026-01-10');
/*!40000 ALTER TABLE `despacho` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `medicamento`
--

DROP TABLE IF EXISTS `medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamento` (
  `id_medicamento` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_medicamento`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamento`
--

LOCK TABLES `medicamento` WRITE;
/*!40000 ALTER TABLE `medicamento` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `medicamento` VALUES
(6,'Amlodipino 5mg'),
(9,'Amoxicilina 500mg'),
(5,'Atorvastatina 20mg'),
(1,'Enalapril 10mg'),
(12,'Enalapril 20mg'),
(11,'Escitalopram  10mg'),
(10,'Gibenclamida 5mg'),
(2,'Losartán 50mg'),
(4,'Metformina 850mg'),
(7,'Omeprazol 20mg'),
(8,'Salbutamol inhalador'),
(3,'Sertralina 50mg');
/*!40000 ALTER TABLE `medicamento` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `contacto` varchar(120) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rut` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `paciente` VALUES
(1,'Ana Perez','12345678-9','977776556','2025-12-28 21:39:29'),
(5,'Pedro Luna','12345123-5','977776557','2025-12-28 23:30:56'),
(6,'otro paciente','12345120-1','977776558','2025-12-28 23:42:45'),
(8,'Juan Pérez','12345124-9','999998888','2026-01-04 20:58:36'),
(9,'María González','98765432-1','977776666','2026-01-04 20:58:36'),
(27,'Paciente A','12345125-0','977776555','2026-01-07 00:16:02'),
(28,'Paciente B','11111111-1','888888899','2026-01-10 19:17:25');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `patologia`
--

DROP TABLE IF EXISTS `patologia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `patologia` (
  `id_patologia` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_patologia`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patologia`
--

LOCK TABLES `patologia` WRITE;
/*!40000 ALTER TABLE `patologia` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `patologia` VALUES
(1,'Broncopulmonar'),
(5,'Diabetes'),
(3,'Gastro'),
(4,'Hipertensión'),
(6,'Otros'),
(2,'Psiquiátrico');
/*!40000 ALTER TABLE `patologia` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `receta`
--

DROP TABLE IF EXISTS `receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta` (
  `id_receta` int(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `duracion` int(11) NOT NULL,
  PRIMARY KEY (`id_receta`),
  KEY `fk_receta_paciente` (`id_paciente`),
  KEY `fk_receta_usuario` (`id_usuario`),
  CONSTRAINT `fk_receta_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta`
--

LOCK TABLES `receta` WRITE;
/*!40000 ALTER TABLE `receta` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `receta` VALUES
(1,8,1,'2026-01-01','2026-03-01',60),
(2,8,1,'2025-12-01','2026-01-30',60),
(3,9,1,'2025-12-10','2026-02-08',60),
(4,1,1,'2026-01-07','2026-03-08',60),
(5,27,1,'2026-01-05','2026-07-04',180),
(6,27,1,'2026-01-05','2026-07-04',180),
(7,27,1,'2026-01-05','2026-04-05',90),
(8,28,1,'2026-01-05','2026-07-04',180);
/*!40000 ALTER TABLE `receta` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `rol` VALUES
(3,'ABASTECIMIENTO'),
(2,'AUXILIAR'),
(1,'QF');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `tratamiento`
--

DROP TABLE IF EXISTS `tratamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tratamiento` (
  `id_tratamiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_receta` int(11) NOT NULL,
  `id_patologia` int(11) NOT NULL,
  PRIMARY KEY (`id_tratamiento`),
  KEY `fk_tratamiento_receta` (`id_receta`),
  KEY `fk_tratamiento_patologia` (`id_patologia`),
  CONSTRAINT `fk_tratamiento_patologia` FOREIGN KEY (`id_patologia`) REFERENCES `patologia` (`id_patologia`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tratamiento_receta` FOREIGN KEY (`id_receta`) REFERENCES `receta` (`id_receta`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tratamiento`
--

LOCK TABLES `tratamiento` WRITE;
/*!40000 ALTER TABLE `tratamiento` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `tratamiento` VALUES
(1,1,4),
(2,2,2),
(3,3,5),
(4,4,4),
(5,5,3),
(6,6,4),
(7,7,6),
(8,8,2);
/*!40000 ALTER TABLE `tratamiento` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `tratamiento_medicamento`
--

DROP TABLE IF EXISTS `tratamiento_medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tratamiento_medicamento` (
  `id_tratamiento` int(11) NOT NULL,
  `id_medicamento` int(11) NOT NULL,
  PRIMARY KEY (`id_tratamiento`,`id_medicamento`),
  KEY `fk_tm_medicamento` (`id_medicamento`),
  CONSTRAINT `fk_tm_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tm_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamiento` (`id_tratamiento`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tratamiento_medicamento`
--

LOCK TABLES `tratamiento_medicamento` WRITE;
/*!40000 ALTER TABLE `tratamiento_medicamento` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `tratamiento_medicamento` VALUES
(1,1),
(1,2),
(4,2),
(2,3),
(8,3),
(3,4),
(4,5),
(8,5),
(7,6),
(5,7),
(7,9),
(7,11),
(8,11);
/*!40000 ALTER TABLE `tratamiento_medicamento` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `usuario` VALUES
(1,1,'qf_user','$2b$12$byFztONMvTqjHS76/oqSIeL7ZkMUJJNkui.WjicCVdixLPEyFmwV2',1),
(2,2,'aux_user','$2b$12$COxhRuUlb2I29ndK82UEu.iT.gt4..lu0xL8gHItEFZCP3znnOG3K ',1),
(3,3,'abas_user','$2b$12$P0D21Qdxjnx4ETW2WiPqDer.4pEkhYH.SxiyTvBF8/x3of42G9MPy ',1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-01-19 23:23:21
