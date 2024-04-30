-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2024 at 07:01 PM
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
(0, 213, 1, 125, 2, '2024-04-28', '10-12', 1, 'No specific reason'),
(0, 215, 1, 125, 2, '2024-04-29', '13-15', 0, 'No specific reason');

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
(1, 'Multimedia Room', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(2, 'Study Room', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(3, 'Reading Room', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(52, 'Multimedia Room', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(53, 'Study Room', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(54, 'Reading Room', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(55, 'Multimedia Room', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(56, 'Study Room', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(57, 'Reading Room', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg'),
(58, 'Multimedia Room', 'Capacity: 20, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'Multimedia.jpg'),
(59, 'Study Room', 'Capacity: 10, Projector: No', 1, 'Free', 'Free', 'Free', 'Free', 'studyroom.jpg'),
(60, 'Reading Room', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free', 'reading.jpeg');

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
(3, 'staff1', '', 'staff1', '$2b$10$vVg7uXCr3cOAkYRgZEqDbOkxp9zHi.kwHK36B172Ds15jH7ZO7Z2O', 3);

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
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

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
