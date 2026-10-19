-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: 127.0.0.1    Database: enaboishusec
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) unsigned DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) unsigned DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `batch_uuid` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subject` (`subject_type`,`subject_id`),
  KEY `causer` (`causer_type`,`causer_id`),
  KEY `activity_log_log_name_index` (`log_name`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni`
--

DROP TABLE IF EXISTS `alumni`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumni` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `graduation_year` smallint(5) unsigned DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `organisation` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `story` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `mentor` tinyint(1) NOT NULL DEFAULT 0,
  `show_publicly` tinyint(1) NOT NULL DEFAULT 0,
  `approved` tinyint(1) NOT NULL DEFAULT 0,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni`
--

LOCK TABLES `alumni` WRITE;
/*!40000 ALTER TABLE `alumni` DISABLE KEYS */;
INSERT INTO `alumni` VALUES (6,'Dr. Rose Demo',2008,'Medical doctor','Mount Meru Regional Hospital','Arusha','alumni1@example.com',NULL,'Demo story: Enaboishu taught me to work hard when nobody was watching. Our biology teacher\'s lab sessions are the reason I chose medicine.','demo/alumni-1.jpg',1,1,1,1,0,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(7,'Eng. Michael Demo',2012,'Civil engineer','University of Dar es Salaam','Dar es Salaam','alumni2@example.com',NULL,'Demo story: I still use the study routine I learned in Form Four. To current students: read every day, even for ten minutes.','demo/alumni-2.jpg',1,1,1,1,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `alumni` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `articles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `body` longtext DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `published_at` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (3,'Five ways to support your child\'s learning at home','five-ways-to-support-your-childs-learning-at-home','The School Office','For parents','Small, steady habits at home make a real difference to how students learn at school.','<p>Parents and guardians are a student\'s first and most important teachers. These simple habits help.</p><h3>1. Keep a regular study time</h3><p>A fixed hour each evening, in a quiet place, builds the habit of revision.</p><h3>2. Ask about the school day</h3><p>Ask <em>what did you learn today?</em> rather than <em>how was school?</em> Explaining a lesson helps a student remember it.</p><h3>3. Read together</h3><p>Reading in <strong>Kiswahili and English</strong> strengthens vocabulary in every subject.</p><h3>4. Protect sleep</h3><p>Well-rested students concentrate better and behave better in class.</p><h3>5. Stay in touch with teachers</h3><p>Attend parents\' meetings and contact the school early if you have a concern.</p>',NULL,NULL,'2026-10-18',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(4,'How to help your child prepare for national examinations','demo-how-to-help-your-child-prepare-for-national-examinations','Mr. Peter Sumari, Second Master','For parents','Demo article to preview the layout of the Journal section and article pages.','<p>Demo article. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. </p><h3>Three practical steps</h3><ol><li>Agree a fixed study time every evening.</li><li>Ask your child to teach you one thing they learned.</li><li>Talk to the class teacher early when something worries you.</li></ol><p>Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. </p>','demo/article-1.jpg',NULL,'2026-10-16',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Why we teach Kiswahili and English side by side','demo-why-we-teach-kiswahili-and-english-side-by-side','Mrs. Agnes Lyimo','Languages','Demo article to preview the layout of the Journal section and article pages.','<p>Demo article. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. </p><h3>Three practical steps</h3><ol><li>Agree a fixed study time every evening.</li><li>Ask your child to teach you one thing they learned.</li><li>Talk to the class teacher early when something worries you.</li></ol><p>Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. </p>','demo/article-2.jpg',NULL,'2026-10-10',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Planting trees, growing leaders: a term with the Environmental Society','demo-planting-trees-growing-leaders-a-term-with-the-environmental-society','Ms. Neema Mushi','Student life','Demo article to preview the layout of the Journal section and article pages.','<p>Demo article. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. Good habits are built one day at a time, with patience, encouragement and a clear routine at home and at school. </p><h3>Three practical steps</h3><ol><li>Agree a fixed study time every evening.</li><li>Ask your child to teach you one thing they learned.</li><li>Talk to the class teacher early when something worries you.</li></ol><p>Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. Small, steady steps lead to strong results. </p>','demo/article-3.jpg',NULL,'2026-10-04',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clubs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `kind` varchar(255) NOT NULL DEFAULT 'Club',
  `summary` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `patron` varchar(255) DEFAULT NULL,
  `meets` varchar(255) DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clubs`
--

LOCK TABLES `clubs` WRITE;
/*!40000 ALTER TABLE `clubs` DISABLE KEYS */;
INSERT INTO `clubs` VALUES (4,'English Debate Club','Club','Demo. Weekly debates in English that build confidence, reasoning and public speaking.','<p>Demo description. Weekly debates in English that build confidence, reasoning and public speaking. New members are welcome at the start of every term.</p>','Ms. Rehema Laizer','Thursdays, 4:00 pm','District debate champions 2025\nBest speaker award, regional finals','demo/club-debate.jpg','[\"demo\\/gallery-6.jpg\",\"demo\\/gallery-7.jpg\"]',0,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(5,'Music and Choir','Club','Demo. Choir, traditional dance and instruments, performing at school events and festivals.','<p>Demo description. Choir, traditional dance and instruments, performing at school events and festivals. New members are welcome at the start of every term.</p>','Mr. Emmanuel Kimaro','Tuesdays and Fridays, 4:00 pm','First place, district music festival','demo/club-music.jpg','[\"demo\\/gallery-6.jpg\",\"demo\\/gallery-7.jpg\"]',1,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(6,'Photography Club','Club','Demo. Students learn to tell stories with a camera and document school life.','<p>Demo description. Students learn to tell stories with a camera and document school life. New members are welcome at the start of every term.</p>','Ms. Halima Said','Wednesdays, 4:00 pm',NULL,'demo/club-photo.jpg','[]',2,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(7,'Environmental Society','Society','Demo. Tree planting, a school nursery and clean-up days in the community.','<p>Demo description. Tree planting, a school nursery and clean-up days in the community. New members are welcome at the start of every term.</p>','Ms. Neema Mushi','Saturdays, 9:00 am','1,200 trees planted since 2023','demo/club-environment.jpg','[]',3,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(8,'Football','Sport','Demo. Boys\' and girls\' teams training for district and regional competitions.','<p>Demo description. Boys\' and girls\' teams training for district and regional competitions. New members are welcome at the start of every term.</p>','Mr. Baraka Mollel','Mondays to Thursdays, 4:30 pm','UMISSETA district runners-up 2025','demo/club-football.jpg','[]',4,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(9,'Athletics','Sport','Demo. Sprints, relays and long-distance running for every form.','<p>Demo description. Sprints, relays and long-distance running for every form. New members are welcome at the start of every term.</p>','Mr. Peter Sumari','Early mornings, 6:00 am','Three students selected for the regional team','demo/club-athletics.jpg','[]',5,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `clubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_values`
--

DROP TABLE IF EXISTS `core_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_values` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_values`
--

LOCK TABLES `core_values` WRITE;
/*!40000 ALTER TABLE `core_values` DISABLE KEYS */;
INSERT INTO `core_values` VALUES (6,'Excellence','We aim high in learning, effort and conduct, and we support every student to reach their potential.',0,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(7,'Discipline','Order, punctuality and self-control are the foundations of a good education.',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(8,'Integrity','We value honesty, fairness and doing the right thing when no one is watching.',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(9,'Respect','We treat others with dignity, and we honour our culture, our teachers and our community.',3,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(10,'Service','We prepare students to contribute to their families, their communities and Tanzania.',4,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `core_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `downloads`
--

DROP TABLE IF EXISTS `downloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `downloads` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'Admissions',
  `form_level` varchar(255) NOT NULL DEFAULT 'All forms',
  `description` text DEFAULT NULL,
  `file` varchar(255) NOT NULL,
  `file_size` bigint(20) unsigned DEFAULT NULL,
  `file_type` varchar(10) DEFAULT NULL,
  `downloads_count` int(10) unsigned NOT NULL DEFAULT 0,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `downloads`
--

LOCK TABLES `downloads` WRITE;
/*!40000 ALTER TABLE `downloads` DISABLE KEYS */;
INSERT INTO `downloads` VALUES (2,'Form One Joining Instructions 2027 (demo)','Joining instructions','Form I','What to bring, reporting dates and uniform requirements.','demo/document-1.pdf',733,'PDF',214,0,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(3,'Form Two December Holiday Package (demo)','Holiday package','Form II',NULL,'demo/document-2.pdf',732,'PDF',58,1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(4,'CSEE 2024 Biology Past Paper (demo)','Past paper','Form IV',NULL,'demo/document-3.pdf',727,'PDF',131,2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Fee and contribution schedule 2027 (demo)','Fee schedule','All forms','Fees, contributions and payment instructions.','demo/document-4.pdf',733,'PDF',97,3,1,'2026-10-18 14:07:02','2026-10-18 14:07:02',NULL),(6,'Admission application form (demo)','Application form','All forms',NULL,'demo/document-5.pdf',725,'PDF',12,4,1,'2026-10-18 14:07:02','2026-10-18 14:07:02',NULL);
/*!40000 ALTER TABLE `downloads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquiries`
--

DROP TABLE IF EXISTS `enquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquiries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `current_school` varchar(255) DEFAULT NULL,
  `class_applying` varchar(255) DEFAULT NULL,
  `guardian_name` varchar(255) NOT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `heard_from` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'New',
  `notes` text DEFAULT NULL,
  `status_changed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enquiries_reference_unique` (`reference`),
  KEY `enquiries_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquiries`
--

LOCK TABLES `enquiries` WRITE;
/*!40000 ALTER TABLE `enquiries` DISABLE KEYS */;
INSERT INTO `enquiries` VALUES (15,'DEMO-2026-0001','Demo Student Neema','Female',NULL,NULL,'Form I','Demo Parent Joseph','Parent','0700 000 000','parent1@example.com','Arumeru, Arusha',NULL,'Demo enquiry: is there space for a day student in Form One?','New',NULL,'2026-10-18 14:07:02','2026-10-18 14:07:02','2026-10-18 14:07:02'),(16,'DEMO-2026-0002','Demo Student Baraka','Male',NULL,NULL,'Form I','Demo Parent Agnes','Parent','0700 000 001','parent2@example.com','Arumeru, Arusha',NULL,NULL,'Contacted',NULL,'2026-10-18 14:07:02','2026-10-18 14:07:02','2026-10-18 14:07:02'),(17,'DEMO-2026-0003','Demo Student Rehema','Female',NULL,NULL,'Form V','Demo Parent Halima','Parent','0700 000 002','parent3@example.com','Arumeru, Arusha',NULL,NULL,'Visit booked',NULL,'2026-10-18 14:07:02','2026-10-18 14:07:02','2026-10-18 14:07:02'),(18,'DEMO-2026-0004','Demo Student Amani','Male',NULL,NULL,'Form II','Demo Parent Peter','Parent','0700 000 003','parent4@example.com','Arumeru, Arusha',NULL,NULL,'Admitted',NULL,'2026-10-18 14:07:02','2026-10-18 14:07:02','2026-10-18 14:07:02');
/*!40000 ALTER TABLE `enquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `starts_at` date NOT NULL,
  `ends_at` date DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (2,'Term Two opening day','demo-term-two-opening-day','2026-10-24',NULL,'7:30 am','School grounds','Demo event. Students report in full uniform with their holiday package.','<p>Demo event. Students report in full uniform with their holiday package.</p><p>For questions please contact the school office.</p>','demo/event-1.jpg',NULL,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(3,'Parents and guardians day','demo-parents-and-guardians-day','2026-10-31',NULL,'9:00 am – 1:00 pm','Main hall','Demo event. Meet the class teachers, see your child\'s progress report and hear from the school board.','<p>Demo event. Meet the class teachers, see your child\'s progress report and hear from the school board.</p><p>For questions please contact the school office.</p>',NULL,NULL,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(4,'Form Two National Assessment (FTNA)','demo-form-two-national-assessment-ftna','2026-11-12','2026-11-16',NULL,'Examination hall','Demo event. National assessment for all Form Two students.','<p>Demo event. National assessment for all Form Two students.</p><p>For questions please contact the school office.</p>',NULL,NULL,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Inter-school debate championship','demo-inter-school-debate-championship','2026-11-27',NULL,'2:00 pm','School library','Demo event. Our English and Kiswahili debate clubs host four schools from the region.','<p>Demo event. Our English and Kiswahili debate clubs host four schools from the region.</p><p>For questions please contact the school office.</p>','demo/event-2.jpg',NULL,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Science fair','demo-science-fair','2026-10-06',NULL,'10:00 am','Laboratories','Demo event. Students presented 30 projects to judges from the district office.','<p>Demo event. Students presented 30 projects to judges from the district office.</p><p>For questions please contact the school office.</p>',NULL,NULL,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facilities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (5,'Classrooms','Bright, well-organised classrooms for focused teaching and learning.','demo/facility-classrooms.jpg',0,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Science laboratories','Practical work in Biology, Chemistry and Physics.','demo/facility-labs.jpg',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(7,'Library','A quiet space for reading, research and private study.','demo/facility-library.jpg',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(8,'Sports and recreation','Playing fields and space for football, netball, athletics and more.','demo/facility-sports.jpg',3,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_items`
--

DROP TABLE IF EXISTS `gallery_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gallery_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `caption` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'Campus life',
  `image` varchar(255) NOT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_items`
--

LOCK TABLES `gallery_items` WRITE;
/*!40000 ALTER TABLE `gallery_items` DISABLE KEYS */;
INSERT INTO `gallery_items` VALUES (2,'The main campus (demo)','Campus','demo/gallery-1.jpg',0,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(3,'Sunset over the school farm (demo)','Campus','demo/gallery-2.jpg',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(4,'Field trip to the mountains (demo)','Trips','demo/gallery-3.jpg',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Our neighbouring hills (demo)','Campus','demo/gallery-4.jpg',3,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Morning run (demo)','Sports','demo/gallery-5.jpg',4,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(7,'District music festival (demo)','Events','demo/gallery-6.jpg',5,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(8,'Music club rehearsal (demo)','Clubs','demo/gallery-7.jpg',6,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(9,'Photography club (demo)','Clubs','demo/gallery-8.jpg',7,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(10,'Cultural day (demo)','Events','demo/gallery-9.jpg',8,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(11,'Reflection by the lake (demo)','Trips','demo/gallery-10.jpg',9,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(12,'Tree planting (demo)','Clubs','demo/gallery-11.jpg',10,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(13,'Library study time (demo)','Academics','demo/gallery-12.jpg',11,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `gallery_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (4,'Demo Visitor','visitor@example.com','0700 000 010','Visiting day','Demo message: when can parents visit the school before applying?',NULL,'2026-10-18 14:07:02','2026-10-18 14:07:02'),(5,'Demo Alumna','alumna@example.com',NULL,'Career talk','Demo message: I would like to give a career talk to Form Four students.','2026-10-18 14:07:02','2026-10-18 14:07:02','2026-10-18 14:07:02');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_reset_tokens_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2026_10_12_191020_create_permission_tables',1),(6,'2026_10_12_191022_create_activity_log_table',1),(7,'2026_10_12_191023_add_event_column_to_activity_log_table',1),(8,'2026_10_12_191024_add_batch_uuid_column_to_activity_log_table',1),(9,'2026_10_13_000001_create_cms_tables',1),(10,'2026_10_13_000002_add_layout_fields_to_slides',1),(11,'2026_10_13_000003_add_articles_and_media_galleries',1),(12,'2026_10_13_000004_add_department_and_class_to_staff',1),(13,'2026_10_13_000005_notices_results_downloads_translations',1),(14,'2026_10_13_000006_clubs_leaders_alumni_enquiries',1),(15,'2026_10_14_000001_notification_recipients_and_logs',1),(16,'2026_10_18_000001_create_pages_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_permissions`
--

LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_roles`
--

LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES (37,'App\\Models\\User',62);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `message` varchar(300) NOT NULL,
  `tone` varchar(255) NOT NULL DEFAULT 'Information',
  `link_label` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `starts_at` date DEFAULT NULL,
  `ends_at` date DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES (5,'Demo notice: Term Two begins on Monday. Students report by 7:30 am in full uniform.','Important','Term dates','/events','2026-10-17','2026-11-01',0,1,'{\"sw\":{\"message\":\"Tangazo la mfano: Muhula wa Pili unaanza Jumatatu. Wanafunzi wafike saa 1:30 asubuhi wakiwa na sare kamili.\",\"link_label\":\"Tarehe za muhula\"}}','2026-10-18 14:07:01','2026-10-18 14:07:01'),(6,'Demo notice: Form One joining instructions for 2027 are now available to download.','Information','Downloads','/downloads','2026-10-15','2026-11-17',1,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_logs`
--

DROP TABLE IF EXISTS `notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `channel` varchar(255) NOT NULL,
  `audience` varchar(255) NOT NULL,
  `event` varchar(255) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `to` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `provider_status` varchar(255) DEFAULT NULL,
  `provider_message_id` varchar(255) DEFAULT NULL,
  `sms_parts` smallint(5) unsigned DEFAULT NULL,
  `error` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_logs_channel_status_index` (`channel`,`status`),
  KEY `notification_logs_provider_message_id_index` (`provider_message_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_logs`
--

LOCK TABLES `notification_logs` WRITE;
/*!40000 ALTER TABLE `notification_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_recipients`
--

DROP TABLE IF EXISTS `notification_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_recipients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `via_email` tinyint(1) NOT NULL DEFAULT 1,
  `via_sms` tinyint(1) NOT NULL DEFAULT 0,
  `on_enquiries` tinyint(1) NOT NULL DEFAULT 1,
  `on_messages` tinyint(1) NOT NULL DEFAULT 1,
  `on_alumni` tinyint(1) NOT NULL DEFAULT 1,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_recipients`
--

LOCK TABLES `notification_recipients` WRITE;
/*!40000 ALTER TABLE `notification_recipients` DISABLE KEYS */;
INSERT INTO `notification_recipients` VALUES (10,'Demo Head of School','Head of School','head@example.com','0700 000 020',1,1,1,1,1,1,0,'2026-10-18 14:07:02','2026-10-18 14:07:02'),(11,'Demo Secretary','Secretary','secretary@example.com',NULL,1,0,1,1,0,1,1,'2026-10-18 14:07:02','2026-10-18 14:07:02');
/*!40000 ALTER TABLE `notification_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `menu_group` varchar(255) NOT NULL DEFAULT 'About',
  `intro` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `body` longtext DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `body` longtext DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `published_at` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `posts_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (9,'Welcome to the new school website','welcome-to-the-new-school-website','Parents, students and friends of Enaboishu can now find news, events and admissions information in one place.','<p>We are pleased to launch the new Enaboishu Secondary School website.</p><p>Here you will find information about our school, our teachers, how to apply, and the latest news and dates. We will keep this page up to date, so please check back often.</p><p>If you have questions, please use the <a href=\"/contact\">contact page</a> to reach the school office.</p>',NULL,NULL,'2026-10-18',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(10,'Music festival: our choir takes first place in the district','demo-music-festival-our-choir-takes-first-place-in-the-district','Demo story. The school choir and traditional dance group won the district secondary schools music festival with a performance about water conservation.','<p>The whole school community came together for this occasion, and the day was a credit to our students and staff.</p><h3>What happened</h3><p>Students prepared for weeks with their teachers. <strong>Parents and guests</strong> joined to support them, and the head of school thanked everyone who took part.</p><ul><li>Planned and led by students</li><li>Supported by teachers and parents</li><li>Celebrated at Monday assembly</li></ul><blockquote>We are proud of every student who took part.</blockquote><p><em>This is demo content created to preview the layout.</em></p>','demo/news-music.jpg','[\"demo\\/news-g1.jpg\",\"demo\\/news-g2.jpg\",\"demo\\/news-g3.jpg\"]','2026-10-17',1,'2026-10-18 14:07:01','2026-10-18 14:07:01','{\"sw\":{\"title\":\"Tamasha la muziki: kwaya yetu yashika nafasi ya kwanza wilayani\",\"excerpt\":\"Habari ya mfano. Kwaya ya shule na kikundi cha ngoma za asili walishinda tamasha la muziki la shule za sekondari wilayani.\"}}'),(11,'Agriculture club harvests its first maize crop','demo-agriculture-club-harvests-its-first-maize-crop','Demo story. Students in the agriculture club planted, weeded and harvested half an acre of maize on the school farm this term.','<p>The whole school community came together for this occasion, and the day was a credit to our students and staff.</p><h3>What happened</h3><p>Students prepared for weeks with their teachers. <strong>Parents and guests</strong> joined to support them, and the head of school thanked everyone who took part.</p><ul><li>Planned and led by students</li><li>Supported by teachers and parents</li><li>Celebrated at Monday assembly</li></ul><blockquote>We are proud of every student who took part.</blockquote><p><em>This is demo content created to preview the layout.</em></p>','demo/news-harvest.jpg','[]','2026-10-13',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(12,'Form Four candidates complete their mock examinations','demo-form-four-candidates-complete-their-mock-examinations','Demo story. All 124 Form Four candidates sat the regional mock examinations. Results will be shared with parents at the next meeting.','<p>The whole school community came together for this occasion, and the day was a credit to our students and staff.</p><h3>What happened</h3><p>Students prepared for weeks with their teachers. <strong>Parents and guests</strong> joined to support them, and the head of school thanked everyone who took part.</p><ul><li>Planned and led by students</li><li>Supported by teachers and parents</li><li>Celebrated at Monday assembly</li></ul><blockquote>We are proud of every student who took part.</blockquote><p><em>This is demo content created to preview the layout.</em></p>','demo/news-exams.jpg','[\"demo\\/news-g4.jpg\"]','2026-10-09',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(13,'New computers for the ICT laboratory','demo-new-computers-for-the-ict-laboratory','Demo story. Thanks to the parents\' association, twenty new computers have been installed in the ICT laboratory.','<p>The whole school community came together for this occasion, and the day was a credit to our students and staff.</p><h3>What happened</h3><p>Students prepared for weeks with their teachers. <strong>Parents and guests</strong> joined to support them, and the head of school thanked everyone who took part.</p><ul><li>Planned and led by students</li><li>Supported by teachers and parents</li><li>Celebrated at Monday assembly</li></ul><blockquote>We are proud of every student who took part.</blockquote><p><em>This is demo content created to preview the layout.</em></p>','demo/news-ict.jpg','[]','2026-10-05',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(14,'Inter-house athletics: Kilimanjaro House wins the trophy','demo-inter-house-athletics-kilimanjaro-house-wins-the-trophy','Demo story. A day of sprints, relays and long-distance races ended with Kilimanjaro House lifting the trophy for the second year running.','<p>The whole school community came together for this occasion, and the day was a credit to our students and staff.</p><h3>What happened</h3><p>Students prepared for weeks with their teachers. <strong>Parents and guests</strong> joined to support them, and the head of school thanked everyone who took part.</p><ul><li>Planned and led by students</li><li>Supported by teachers and parents</li><li>Celebrated at Monday assembly</li></ul><blockquote>We are proud of every student who took part.</blockquote><p><em>This is demo content created to preview the layout.</em></p>','demo/news-athletics.jpg','[\"demo\\/news-g5.jpg\"]','2026-10-01',1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL DEFAULT 'Ordinary Level',
  `summary` text DEFAULT NULL,
  `subjects` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (4,'Languages and Humanities','Ordinary Level (Form I–IV)','Strong communication and a clear understanding of society, history and citizenship.','Kiswahili\nEnglish Language\nHistory\nGeography\nCivics',NULL,1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Mathematics and Sciences','Ordinary Level (Form I–IV)','Practical, problem-centred teaching in the core sciences and mathematics.','Basic Mathematics\nBiology\nChemistry\nPhysics',NULL,2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Business and Technology','Ordinary Level (Form I–IV)','Skills for work and enterprise, and for a world increasingly shaped by technology.','Commerce\nBook-keeping\nInformation and Computer Studies',NULL,3,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `results` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `year` smallint(5) unsigned NOT NULL,
  `exam` varchar(255) NOT NULL DEFAULT 'CSEE',
  `candidates` int(10) unsigned NOT NULL DEFAULT 0,
  `div_1` int(10) unsigned NOT NULL DEFAULT 0,
  `div_2` int(10) unsigned NOT NULL DEFAULT 0,
  `div_3` int(10) unsigned NOT NULL DEFAULT 0,
  `div_4` int(10) unsigned NOT NULL DEFAULT 0,
  `div_0` int(10) unsigned NOT NULL DEFAULT 0,
  `gpa` varchar(255) DEFAULT NULL,
  `rank_note` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `results_year_exam_unique` (`year`,`exam`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
INSERT INTO `results` VALUES (2,2021,'CSEE',98,9,22,38,21,8,'3.21',NULL,NULL,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(3,2022,'CSEE',104,12,27,37,20,8,'3.10',NULL,NULL,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(4,2023,'CSEE',112,15,31,38,20,8,'2.98',NULL,NULL,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(5,2024,'CSEE',118,19,36,36,19,8,'2.87',NULL,NULL,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(6,2025,'CSEE',124,24,41,35,18,6,'2.71','Demo: 12th of 98 schools in Arusha Region','Demo figures to preview the layout — replace with official NECTA results.',1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(7,2025,'FTNA',131,18,39,42,25,7,NULL,NULL,NULL,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_has_permissions`
--

LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (37,'admin','web','2026-10-18 14:07:01','2026-10-18 14:07:01'),(38,'editor','web','2026-10-18 14:07:01','2026-10-18 14:07:01'),(39,'user','web','2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (17,'head_name','Mrs. Grace Mollel','2026-10-18 14:07:01','2026-10-18 14:07:01'),(18,'head_photo','demo/head.jpg','2026-10-18 14:07:01','2026-10-18 14:07:01'),(19,'home_welcome_image','demo/welcome.jpg','2026-10-18 14:07:01','2026-10-18 14:07:01'),(20,'about_image','demo/about.jpg','2026-10-18 14:07:01','2026-10-18 14:07:01'),(21,'page_banner','demo/banner.jpg','2026-10-18 14:07:01','2026-10-18 14:07:01'),(22,'share_image','demo/share.jpg','2026-10-18 14:07:01','2026-10-18 14:07:01'),(23,'established','Established 1990','2026-10-18 14:07:01','2026-10-18 14:07:01'),(24,'phone','+255 700 000 000','2026-10-18 14:07:01','2026-10-18 14:07:01'),(25,'phone_alt','+255 700 000 001','2026-10-18 14:07:01','2026-10-18 14:07:01'),(26,'email','office@example.com','2026-10-18 14:07:01','2026-10-18 14:07:01'),(27,'instagram','https://www.instagram.com','2026-10-18 14:07:01','2026-10-18 14:07:01'),(28,'whatsapp','255700000000','2026-10-18 14:07:01','2026-10-18 14:07:01'),(29,'history','<p>Enaboishu Secondary School opened its doors with two classrooms, four teachers and a community determined that its children would not have to travel far for a good secondary education.</p><h3>Growing with the community</h3><p>Over the years parents, former students and partners have helped build laboratories, a library and new classrooms. Today the school serves families from across the Arumeru District.</p><blockquote>Education for the Nation has always meant education for every child in our community.</blockquote><p><em>Demo text — replace with the school\'s real history in Site settings → About page.</em></p>','2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `slides`
--

DROP TABLE IF EXISTS `slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `slides` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `eyebrow` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `layout` varchar(255) NOT NULL DEFAULT 'Arched photo',
  `image_caption` varchar(255) DEFAULT NULL,
  `button_label` varchar(255) DEFAULT NULL,
  `button_url` varchar(255) DEFAULT NULL,
  `button2_label` varchar(255) DEFAULT NULL,
  `button2_url` varchar(255) DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slides`
--

LOCK TABLES `slides` WRITE;
/*!40000 ALTER TABLE `slides` DISABLE KEYS */;
INSERT INTO `slides` VALUES (4,'Enaboishu Secondary School','Learning with purpose in Arusha','A disciplined, caring school community where every student is expected to do well, and is supported to get there.',NULL,'Arched photo',NULL,'About our school','/about','Contact us','/contact',0,0,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Admissions','Join the Enaboishu family','Find out how to apply for a place, what documents you need and who to speak to at the school office.',NULL,'Arched photo',NULL,'How to apply','/admissions','Contact us','/contact',1,0,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'School life','More than the classroom','Clubs, sport, leadership and service help our students grow in confidence and character.',NULL,'Arched photo',NULL,'See the gallery','/gallery','Contact us','/contact',2,0,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(7,'Welcome to Enaboishu','Education for the Nation','A disciplined, caring school in the heart of Arusha, where every student is known, challenged and supported.','images/2026/10/WcatgYW22eqUfmBbtbEtAACPhwPJzq1NvwLXUFEQ.jpg','Full-width photo',NULL,'Discover our school','/about','Apply online','/apply',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:12','{\"sw\":{\"eyebrow\":\"Karibu Enaboishu\",\"title\":\"Elimu kwa Taifa\",\"subtitle\":\"Shule yenye nidhamu na upendo katikati ya Arusha, ambapo kila mwanafunzi anajulikana, anapewa changamoto na kusaidiwa.\",\"button_label\":\"Ifahamu shule yetu\",\"button2_label\":\"Omba mtandaoni\"}}'),(8,'Admissions 2027','Join the Enaboishu family','Applications for Form One and Form Five are open. Apply online in five minutes and receive your reference by SMS.','images/2026/10/QPF1OSWaeROVjsfXWXlTWNgipYnZ40rsJFXlShb6.jpg','Arched photo','Sunset over the Arumeru plains','Apply online','/apply','Requirements','/admissions',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:12',NULL),(9,'Academics','Strong results, stronger readers','A reading culture, regular assessment and dedicated teachers behind every NECTA result.','images/2026/10/N1dWt1KpTqR9SnNU6Y90qkXcI5anZpOW31cPuNBg.jpg','Arched photo','The school library','See our results','/results',NULL,NULL,3,1,'2026-10-18 14:07:01','2026-10-18 14:07:12',NULL);
/*!40000 ALTER TABLE `slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_members`
--

DROP TABLE IF EXISTS `staff_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL DEFAULT 'Teaching',
  `academic_department` varchar(255) DEFAULT NULL,
  `subjects` varchar(255) DEFAULT NULL,
  `class_assigned` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_members`
--

LOCK TABLES `staff_members` WRITE;
/*!40000 ALTER TABLE `staff_members` DISABLE KEYS */;
INSERT INTO `staff_members` VALUES (3,'Mr. Peter Sumari','Second Master (Academics)','Leadership','Mathematics','Mathematics','Forms III–IV','Demo profile. Leads the academic programme and the school timetable. Twenty years in the classroom and a firm believer in daily practice.','demo/staff-4.jpg',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(4,'Mrs. Agnes Lyimo','Discipline Mistress','Leadership','Languages','Kiswahili, History','Class teacher, Form 4A','Demo profile. Responsible for student welfare and discipline. Patron of the Kiswahili debating society.','demo/staff-2.jpg',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(5,'Ms. Neema Mushi','Biology Teacher','Teaching','Sciences','Biology, Chemistry','Class teacher, Form 2A','Demo profile. Runs the Environmental Society and the school tree nursery. Believes every lesson should end with a question.','demo/staff-1.jpg',3,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Mr. Baraka Mollel','Mathematics Teacher','Teaching','Mathematics','Basic Mathematics','Forms I–II','Demo profile. Coach of the school football team and the mathematics olympiad squad.','demo/staff-3.jpg',4,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(7,'Ms. Rehema Laizer','English Teacher','Teaching','Languages','English, Literature','Class teacher, Form 3B','Demo profile. Patron of the English Debate Club. Organises the annual reading week and spelling competition.','demo/staff-5.jpg',5,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(8,'Mr. Emmanuel Kimaro','Physics Teacher','Teaching','Sciences','Physics, Chemistry','Forms III–IV','Demo profile. Looks after the laboratories and the science fair. Previously taught in Moshi for eight years.','demo/staff-6.jpg',6,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(9,'Ms. Halima Said','ICT Teacher','Teaching','Business Studies','Information and Computer Studies, Commerce','Forms I–IV','Demo profile. Runs the computer lab and the photography club. Keen to see every student type and code by Form Two.','demo/staff-7.jpg',7,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(10,'Mr. Joseph Massawe','Bursar','Administration',NULL,NULL,NULL,'Demo profile. Handles school fees, contributions and procurement. Visit the bursary office for fee statements.','demo/staff-8.jpg',8,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `staff_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stats` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
INSERT INTO `stats` VALUES (5,'Students','640+',0,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(6,'Teachers and staff','38',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(7,'Subjects taught','14',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(8,'Years of service','35',3,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_leaders`
--

DROP TABLE IF EXISTS `student_leaders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_leaders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `class_name` varchar(255) DEFAULT NULL,
  `term` varchar(255) DEFAULT NULL,
  `quote` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_leaders`
--

LOCK TABLES `student_leaders` WRITE;
/*!40000 ALTER TABLE `student_leaders` DISABLE KEYS */;
INSERT INTO `student_leaders` VALUES (2,'Demo Leader Amani','Head Prefect','Form 4A','2026/2027','Lead by example, not by title.','demo/leader-1.jpg',0,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(3,'Demo Leader Zawadi','Head Girl','Form 4B','2026/2027','Every voice in this school matters.','demo/leader-2.jpg',1,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(4,'Demo Leader Juma','Academic Prefect','Form 4A','2026/2027',NULL,'demo/leader-3.jpg',2,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01'),(5,'Demo Leader Upendo','Sports Prefect','Form 3B','2026/2027',NULL,'demo/leader-4.jpg',3,1,NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `student_leaders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testimonials` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `quote` text NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `sort` int(10) unsigned NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Mama Neema','Parent, Form Three','Demo testimonial: the teachers know my daughter by name and call me when something needs attention. Her confidence has grown every term.','demo/testimonial-1.jpg',0,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(2,'Daniel K.','Alumnus, class of 2018','Demo testimonial: the debate club taught me to speak in front of people. Today I lead meetings at university without fear.','demo/testimonial-2.jpg',1,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL),(3,'Mzee Joseph','Parent and school board member','Demo testimonial: discipline here is firm but fair. Students are expected to work hard, and they are helped to succeed.','demo/testimonial-3.jpg',2,1,'2026-10-18 14:07:01','2026-10-18 14:07:01',NULL);
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (62,'Site Administrator','admin@enaboishu.sc.tz',NULL,'$2y$12$NUGgaPewtUfn0AKopV6H9u0ttkPnqgsU9qqOjSmy/GmfN1lbiIfMe',NULL,'2026-10-18 14:07:01','2026-10-18 14:07:01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 20:35:58
