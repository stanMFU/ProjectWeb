-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2024 at 11:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webdb`
--
CREATE DATABASE IF NOT EXISTS `webdb` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `webdb`;

-- --------------------------------------------------------

--
-- Table structure for table `bookinghistory`
--

CREATE TABLE `bookinghistory` (
  `history_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `approver_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time_slot` enum('8-10','10-12','13-15','15-17') NOT NULL,
  `status` tinyint(16) NOT NULL COMMENT '0=Reject, 1=Approve  ',
  `reason` tinytext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookinghistory`
--

INSERT INTO `bookinghistory` (`history_id`, `booking_id`, `room_id`, `user_id`, `approver_id`, `date`, `time_slot`, `status`, `reason`) VALUES
(0, 212, 1, 2, 2, '2024-04-28', '8-10', 1, 'asdfasdf'),
(0, 213, 1, 125, 2, '2024-04-28', '10-12', 1, 'No specific reason');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time_slot` enum('8-10','10-12','13-15','15-17') NOT NULL,
  `status` tinytext NOT NULL COMMENT '2=Pending, 1= Approved, 0=Rejected',
  `reason` text NOT NULL,
  `approver_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `room_id`, `user_id`, `date`, `time_slot`, `status`, `reason`, `approver_id`) VALUES
(214, 1, 125, '2024-04-29', '13-15', 'Pending', 'No specific reason', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_name` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `status_8_10` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `status_10_12` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `status_13_15` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `status_15_17` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `img` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_name`, `details`, `enabled`, `status_8_10`, `status_10_12`, `status_13_15`, `status_15_17`, `img`) VALUES
(1, 'Multimedia Room 1', 'Capacity: 20, Projector: Yes', 1, 'Reserved', 'Reserved', 'Pending', 'Free', 'Multimedia.jpg'),
(2, 'Multimedia Room', 'asdfasdfasddf', 1, 'Free', 'Free', 'Free', 'Free', 'multimedia.jpg'),
(3, 'Reading Room 1', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(4, 'Multimedia Room 2', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(5, 'Study Room 2', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(6, 'Reading Room 2', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(7, 'Multimedia Room 3', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(8, 'Study Room 3', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(9, 'Reading Room 3', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(10, 'Multimedia Room 4', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(11, 'Study Room 4', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(12, 'Multimedia Room', 'asdfa', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(30, 'Multimedia Room', 'Capacity: 20, Projector: Yes', 1, 'Reserved', 'Pending', 'Free', 'Free', 'Multimedia.jpg'),
(31, 'Study Room', 'asd', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(32, 'Reading Room', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(33, 'Multimedia Room', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(34, 'Study Room', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(35, 'Reading Room', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(40, 'Multimedia Room', 'a', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(50, 'Multimedia Room', 'asdf', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(51, 'Study Room', '10000', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` smallint(6) NOT NULL COMMENT '1=Student, 2=Approver, 3=Staff'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `firstname`, `lastname`, `username`, `password`, `role`) VALUES
(1, 'student1', '', 'student1', '$2b$10$ikRAg9e1IY0COyJHx77g0ug.iQ8XMlDlRNsSU3sE2No/kKcQ.oZZW', 1),
(2, 'approver1', '', 'approver1', '$2b$10$9Ekl5EGztC55jTqxR0Ip0uDXbIKiim12NhblQhckSk5TfnmS75f46', 2),
(3, 'staff1', '', 'staff1', '$2b$10$vVg7uXCr3cOAkYRgZEqDbOkxp9zHi.kwHK36B172Ds15jH7ZO7Z2O', 3),
(4, 'approver2', '', 'approver2', '$2b$10$yV7Z2pj8a7PQt9g4n/FTLeU3xUZgk1lf7GikPKXGJ7r2c8XhAyqzG\r\n', 2),
(101, 'student2', '', 'student2', '$2b$10$XzvDW7eg7u99v6R0EnKWN.oMwY2Yh2LVrwrfFHBQS4YI/fMiAmd2e', 1),
(115, 'student3', ' ', 'student3', '$2b$10$K1RStMoR7SaxY2KaZBx4TOsxGsPUgUDqBFa1m3pWV3AUdatMi4qde', 1),
(118, 'student4', ' ', 'student4', '$2b$10$Og8bRhXb0P5LBSnPfl8qVeUbJ2xw46knX2HD2378oN4WoG8QEpI6u', 1),
(119, 'student5', ' ', 'student5', '$2b$10$e6n0jAFHdY2tB8Jf1kf5g.Jns24/mE0HqmV2XCNh0UGTjn2.Rld.a', 1),
(120, 'Stanis', 'Tokarek', 'stan', '$2b$10$tYTREfgcjn.cTOf1wKzO.Ol3Xee0Xgb0I.G7HmzL6SVoyO.OSKXA.', 1),
(121, 'student6', ' ', 'student6', '$2b$10$PnbhEHGyBg4yTFv1rpJVtuQZIauOKgIhMX/RELLb6lnkuqZQq/3Mu', 1),
(122, 'student10', ' ', 'student10', '$2b$10$1w87j9qreosjICf5brC6G.Qyc563eBp/W1J8VdiM99qqtHXKtZmvK', 1),
(123, 'test', ' ', 'test', '$2b$10$FjUE5KHYdKCecgm1d52K3uNmg9CLs5J5gFgotcvSuU75QouIoMpaq', 1),
(124, 'staff', '-', 'staff', '$2b$10$scoeNmR3LkrMbF3/MWiZw.tkB7IYZmkxXC9DtjM4XdxZHXM/vf.uy', 3),
(125, 'user', '1', 'user', '$2b$10$KvHIVtd9b6lqHm6t22wA6eykVLLnhjksn9gOdSFlUTHa6gakuYFcG', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approver_id` (`approver_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=215;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
