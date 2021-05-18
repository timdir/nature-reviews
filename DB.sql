-- phpMyAdmin SQL Dump
-- version 4.9.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 26, 2021 at 10:38 PM
-- Server version: 10.3.28-MariaDB-log-cll-lve
-- PHP Version: 7.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `synoftqc_nature-reviews`
--

-- --------------------------------------------------------

--
-- Table structure for table `parks`
--

CREATE TABLE `parks` (
  `park_id` int(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parks`
--

INSERT INTO `parks` (`park_id`, `name`, `description`) VALUES
(1, 'Garibaldi Park', 'A beautiful park park with lots of hiking spots in British Columbia, Canada.'),
(2, 'Lac du Bois Grasslands', 'A hilly and grassy park on the outskirts of Kamloops, British Columbia with 4 different hikes and hot weather!');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` int(100) NOT NULL,
  `session_key` varchar(255) NOT NULL,
  `user_id` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `session_key`, `user_id`) VALUES
(4, 'HuNGhlom+kiAnh2J6W3HrQ==', 4),
(6, '09kugrV2Q8PgyG3/quUiQw==', 6),
(7, 'qjcyddoOofowVrNIGzTyCw==', 7);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(100) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`) VALUES
(1, 'admin', '$2b$10$MeIeYc9FFjdmX7eb./VMqOqYurwJV5AqwAKhXlwXu4H4wZ79jG9AK'),
(2, 'default', '$2b$10$MeIeYc9FFjdmX7eb./VMqOKrI/YHA6sKYBeWX668/N.fmd8VRYp0y'),
(3, 'john', '$2b$10$MeIeYc9FFjdmX7eb./VMqO5FVBff.yfYABrESDwHWY/m5kr6.vHwO'),
(4, 'Vera-Chambers', '$2b$10$MeIeYc9FFjdmX7eb./VMqOkx9kzwSX1akvjm4QoU8mgpmjzE2ZjSu'),
(5, 'Chris.cross', '$2b$10$MeIeYc9FFjdmX7eb./VMqOwU7NrEVvrGPeGuxLXB660I7obrLGNRi'),
(6, 'caroline', '$2b$10$MeIeYc9FFjdmX7eb./VMqOMb049.czA79NxSLE/BhU.blao574ZGi'),
(7, 'bigstu', '$2b$10$MeIeYc9FFjdmX7eb./VMqO2WVWwdRmQ5vx9Us3RZM/5tKJNg5inMu');

-- --------------------------------------------------------

--
-- Table structure for table `user_park_comments`
--

CREATE TABLE `user_park_comments` (
  `user_id` int(100) NOT NULL,
  `park_id` int(100) NOT NULL,
  `c_date` varchar(25) NOT NULL,
  `c_comment` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_park_comments`
--

INSERT INTO `user_park_comments` (`user_id`, `park_id`, `c_date`, `c_comment`) VALUES
(3, 1, '2018-02-14 19:39:00 UTC', 'too cold'),
(3, 2, '2020-10-30 01:23:20 UTC', 'I really enjoyed the views'),
(3, 2, '2020-10-30 01:24:47 UTC', 'Also, it is very hot, bring water!!'),
(4, 2, '2019-01-05 05:48:34 UTC', 'cool'),
(5, 1, '2019-01-23 23:52:58 UTC', 'this park is great!'),
(6, 1, '2020-03-13 02:16:12 UTC', 'did this with my best friend it was a lot of fun'),
(7, 2, '2018-07-21 20:30:28 UTC', 'it was not bad at all');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `parks`
--
ALTER TABLE `parks`
  ADD PRIMARY KEY (`park_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `fk_userid_for_sessions` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_park_comments`
--
ALTER TABLE `user_park_comments`
  ADD PRIMARY KEY (`user_id`,`park_id`,`c_date`),
  ADD KEY `fk_parkid_for_parks` (`park_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `parks`
--
ALTER TABLE `parks`
  MODIFY `park_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `session_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_userid_for_sessions` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_park_comments`
--
ALTER TABLE `user_park_comments`
  ADD CONSTRAINT `fk_parkid_for_parks` FOREIGN KEY (`park_id`) REFERENCES `parks` (`park_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_userid_for_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
