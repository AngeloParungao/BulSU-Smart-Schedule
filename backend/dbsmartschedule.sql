-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 27, 2024 at 03:45 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbsmartschedule`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `activity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(10) NOT NULL,
  `details` varchar(100) NOT NULL,
  `type` varchar(20) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity`
--

INSERT INTO `activity` (`activity_id`, `user_id`, `action`, `details`, `type`, `timestamp`) VALUES
(37, 1, 'Add', 'test, test test', 'instructor', '2024-07-18 19:43:54'),
(38, 1, 'Update', 'test, test test', 'instructor', '2024-07-18 19:44:07'),
(39, 1, 'Delete', '1', 'instructor', '2024-07-18 19:44:19'),
(40, 1, 'Add', 'test - Group 1', 'section', '2024-07-18 19:44:36'),
(41, 1, 'Update', 'test - Group 1', 'section', '2024-07-18 19:44:44'),
(42, 1, 'Delete', '1', 'section', '2024-07-18 19:44:50'),
(43, 1, 'Add', 'test(test)', 'subject', '2024-07-18 19:45:09'),
(44, 1, 'Update', 'sample(test)', 'subject', '2024-07-18 19:45:20'),
(45, 1, 'Delete', '1', 'subject', '2024-07-18 19:45:24'),
(46, 1, 'Add', 'test)', 'room', '2024-07-18 19:48:18'),
(47, 1, 'Update', 'sample', 'room', '2024-07-18 19:49:04'),
(48, 1, 'Delete', '1', 'room', '2024-07-18 19:49:16'),
(49, 1, 'Add', 'BSIT 3D - Group 2', 'schedule', '2024-07-18 19:51:53'),
(52, 1, 'Update', 'BSIT 3D - Group 2', 'schedule', '2024-07-18 20:02:07'),
(53, 1, 'Update', 'BSIT 3D - Group 2', 'schedule', '2024-07-18 20:02:22'),
(54, 1, 'Delete', '1', 'schedule', '2024-07-18 20:06:30'),
(55, 1, 'Add', 'BSIT 3D - Group 2', 'schedule', '2024-07-18 20:06:57'),
(56, 1, 'Update', 'BSIT 3D - Group 2', 'schedule', '2024-07-18 20:07:14'),
(57, 1, 'Add', 'Lab1', 'room', '2024-07-19 12:48:02'),
(58, 1, 'Add', 'test, test test', 'instructor', '2024-07-19 23:10:55'),
(59, 1, 'Delete', '1', 'instructor', '2024-07-19 23:11:00'),
(60, 1, 'Delete', '1', 'section', '2024-07-24 21:47:03'),
(61, 1, 'Add', 'BSIT 3D - Group 1', 'schedule', '2024-07-25 11:37:33'),
(62, 1, 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-07-25 11:37:57');

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `instructor_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `middlename` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `worktype` varchar(20) NOT NULL,
  `tags` varchar(100) NOT NULL,
  `creator_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`instructor_id`, `email`, `firstname`, `middlename`, `lastname`, `worktype`, `tags`, `creator_id`) VALUES
(20, 'angeloparungao.ap@gmail.com', 'Angelo Miguel', 'Lapuz', 'Parungao', 'regular', 'Web and Mobile Development', 1),
(23, 'clyde@gmail.com', 'Clyde', '', 'Mondero', 'Part-timer', 'Web and Mobile Development', 1),
(25, 'danrick@gmail.com', 'Danrick Salamat', 'Conception', 'Macatanong', 'Part-timer', 'Web and Mobile Development', 1),
(26, 'albert@gmail.com', 'Albert', '', 'Junio', 'Part-timer', 'Business Analytics', 1),
(27, 'erick@gmail.com', 'Erick', '', 'Caleja', 'part-timer', 'Business Analytics', 1);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_type` varchar(20) NOT NULL,
  `room_name` varchar(20) NOT NULL,
  `room_tags` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_type`, `room_name`, `room_tags`) VALUES
(28, 'Lecture', 'RM201', 'Second Floor'),
(29, 'Laboratory', 'MML', 'Multi Media Laboratory'),
(31, 'Laboratory', 'Lab1', '');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(11) NOT NULL,
  `instructor` varchar(50) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `section_name` varchar(20) NOT NULL,
  `section_group` varchar(20) NOT NULL,
  `class_type` varchar(15) NOT NULL,
  `room` varchar(10) NOT NULL,
  `background_color` varchar(20) NOT NULL,
  `day` varchar(20) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `creator_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `instructor`, `subject`, `section_name`, `section_group`, `class_type`, `room`, `background_color`, `day`, `start_time`, `end_time`, `creator_id`) VALUES
(53, 'Danrick Salamat Conception Macatanong', 'Quality Assurance', 'BSIT 3D', 'Group 2', 'Lecture', 'RM201', '#f5a3a3', 'Monday', '12:00:00', '14:00:00', 1),
(54, 'Albert  Junio', 'Web Development', 'BSIT 3D', 'Group 2', 'Laboratory', 'MML', '#aff8a5', 'Tuesday', '13:00:00', '16:00:00', 1),
(55, 'Clyde  Mondero', 'System Analysis and Design', 'BSIT 3D', 'Group 2', 'Lecture', 'RM201', '#fdbffb', 'Wednesday', '16:00:00', '18:00:00', 1),
(56, 'Danrick Salamat Conception Macatanong', 'Quality Assurance', 'BSIT 3D', 'Group 2', 'Laboratory', 'MML', '#f3afaf', 'Thursday', '17:00:00', '20:00:00', 1),
(57, 'Clyde  Mondero', 'System Analysis and Design', 'BSIT 3D', 'Group 2', 'Laboratory', 'RM201', '#f0b7e5', 'Friday', '07:00:00', '10:00:00', 1),
(58, 'Erick  Caleja', 'Object Oriented Programming', 'BSIT 3D', 'Group 2', 'Lecture', 'RM201', '#ffffff', 'Thursday', '07:00:00', '09:00:00', 1),
(61, 'Erick  Caleja', 'Object Oriented Programming', 'BSIT 3D', 'Group 2', 'Laboratory', 'MML', '#ffffff', 'Tuesday', '08:00:00', '11:00:00', 1),
(62, 'Albert  Junio', 'Web Development', 'BSIT 3D', 'Group 2', 'Lecture', 'RM201', '#b1fbb3', 'Monday', '07:00:00', '09:00:00', 1),
(63, 'Clyde  Mondero', 'Quality Assurance', 'BSIT 3D', 'Group 1', 'Lecture', 'RM201', '#e78ced', 'Monday', '09:00:00', '11:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(15) NOT NULL,
  `section_group` varchar(15) NOT NULL,
  `year_lvl` varchar(20) NOT NULL,
  `number_of_students` int(100) NOT NULL,
  `section_tags` varchar(50) NOT NULL,
  `creator_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `section_name`, `section_group`, `year_lvl`, `number_of_students`, `section_tags`, `creator_id`) VALUES
(4, 'BSIT 3D', 'Group 2', '3rd Year', 23, '', 1),
(11, 'BSIT 3D', 'Group 1', '3rd Year', 17, '', 1),
(13, 'BSIT 1A', 'Group 1', '1st Year', 25, '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_name` varchar(50) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `year_lvl` varchar(10) NOT NULL,
  `subject_type` varchar(10) NOT NULL,
  `subject_units` int(5) NOT NULL,
  `subject_tags` varchar(50) NOT NULL,
  `creator_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_name`, `subject_code`, `year_lvl`, `subject_type`, `subject_units`, `subject_tags`, `creator_id`) VALUES
(7, 'Quality Assurance', 'IT309', '3rd Year', 'Major', 3, '', 1),
(8, 'System Analysis and Design', 'SAD', '3rd Year', 'Major', 3, '', 1),
(9, 'Object Oriented Programming', 'OOP1', '2nd Year', 'Major', 3, '', 1),
(10, 'Web Development', 'WEB1', '3rd Year', 'Major', 3, 'Web and Mobile Development', 1),
(11, 'Object Oriented Programming 2', 'OOP2', '2nd Year', 'Major', 3, '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`) VALUES
(1, 'sample', 'sample@gmail.com', 'sample123'),
(2, 'test', 'test@gmail.com', 'test12345');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`activity_id`);

--
-- Indexes for table `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`instructor_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity`
--
ALTER TABLE `activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `instructor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
