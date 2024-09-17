-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 11, 2024 at 05:50 PM
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
  `department_code` varchar(10) NOT NULL,
  `action` varchar(10) NOT NULL,
  `details` varchar(100) NOT NULL,
  `type` varchar(20) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity`
--

INSERT INTO `activity` (`activity_id`, `user_id`, `department_code`, `action`, `details`, `type`, `timestamp`) VALUES
(37, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-07-18 19:43:54'),
(38, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-07-18 19:44:07'),
(395, 1, 'CICT', 'Add', 'sample, sample sample', 'instructor', '2024-09-07 13:45:59'),
(396, 1, 'CICT', 'Add', 'Mondero, Clyde ', 'instructor', '2024-09-07 14:29:40'),
(397, 1, 'CICT', 'Add', 'Mangrobang, Angel Shane', 'instructor', '2024-09-07 14:31:02'),
(398, 1, 'CICT', 'Add', 'Poma, Andrei nigga', 'instructor', '2024-09-07 14:33:06'),
(399, 1, 'CICT', 'Add', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 14:45:07'),
(400, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 14:47:23'),
(401, 1, 'CICT', 'Add', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 14:48:35'),
(402, 1, 'CICT', 'Update', 'Poma, Andrei nigga', 'instructor', '2024-09-07 15:38:36'),
(403, 1, 'CICT', 'Update', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 15:40:18'),
(404, 1, 'CICT', 'Update', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 15:40:34'),
(405, 1, 'CICT', 'Update', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 15:46:00'),
(406, 1, 'CICT', 'Update', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 15:46:46'),
(407, 1, 'CICT', 'Update', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 15:47:27'),
(408, 1, 'CICT', 'Update', 'Villagonzalo, Mark James', 'instructor', '2024-09-07 15:47:32'),
(409, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:14:48'),
(410, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:15:22'),
(411, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:18:49'),
(412, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:19:08'),
(413, 1, 'CICT', 'Delete', '3', 'instructor', '2024-09-07 16:19:21'),
(414, 1, 'CICT', 'Add', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 16:21:10'),
(415, 1, 'CICT', 'Update', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:21:32'),
(416, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:22:05'),
(417, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:22:36'),
(418, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:27:52'),
(419, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:28:11'),
(420, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:30:23'),
(421, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:30:44'),
(422, 1, 'CICT', 'Add', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 16:31:04'),
(423, 1, 'CICT', 'Add', 'Macatanong, Danrick Concepcion', 'instructor', '2024-09-07 16:31:39'),
(424, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:31:49'),
(425, 1, 'CICT', 'Delete', '2', 'instructor', '2024-09-07 16:31:55'),
(426, 1, 'CICT', 'Delete', '3', 'instructor', '2024-09-07 16:32:05'),
(427, 1, 'CICT', 'Delete', '3', 'instructor', '2024-09-07 16:32:06'),
(428, 1, 'CICT', 'Delete', '3', 'instructor', '2024-09-07 16:32:06'),
(429, 1, 'CICT', 'Delete', '3', 'instructor', '2024-09-07 16:34:23'),
(430, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:34:51'),
(431, 1, 'CICT', 'Add', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 16:35:07'),
(432, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:35:12'),
(433, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:35:24'),
(434, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:38:57'),
(435, 1, 'CICT', 'Add', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 16:39:16'),
(436, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 16:39:26'),
(437, 1, 'CICT', 'Delete', '2', 'instructor', '2024-09-07 16:39:39'),
(438, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 16:40:59'),
(439, 1, 'CICT', 'Add', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 16:41:14'),
(440, 1, 'CICT', 'Add', 'Parungao, Angelo Lapuz', 'instructor', '2024-09-07 16:41:40'),
(441, 1, 'CICT', 'Add', 'bartolome, bhenz mharl', 'instructor', '2024-09-07 16:42:20'),
(442, 1, 'CICT', 'Add', 'Parungao, Angela Marie', 'instructor', '2024-09-07 16:42:56'),
(443, 1, 'CICT', 'Add', 'Parungao, Lorena Lapuz', 'instructor', '2024-09-07 16:43:21'),
(444, 1, 'CICT', 'Add', 'Parungao, Roberto Pena ', 'instructor', '2024-09-07 16:43:49'),
(445, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 19:40:15'),
(446, 1, 'CICT', 'Update', 'bartolome, bhenz mharl', 'instructor', '2024-09-07 19:42:17'),
(447, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-07 20:35:04'),
(448, 1, 'CICT', 'Add', 'Junio, Albert Bading', 'instructor', '2024-09-07 20:35:46'),
(449, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-07 20:36:39'),
(450, 1, 'CICT', 'Update', 'Tamalla, Andrea Nicole', 'instructor', '2024-09-07 20:54:31'),
(451, 1, 'CICT', 'Delete', '2', 'instructor', '2024-09-07 20:54:49'),
(452, 1, 'CICT', 'Delete', '2', 'room', '2024-09-07 21:25:56'),
(453, 1, 'CICT', 'Add', 'MML', 'room', '2024-09-07 21:27:16'),
(454, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:27:42'),
(455, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-07 21:27:52'),
(456, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:28:06'),
(457, 1, 'CICT', 'Update', 'Rm201', 'room', '2024-09-07 21:28:18'),
(458, 1, 'CICT', 'Add', 'Rm201', 'room', '2024-09-07 21:28:29'),
(459, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:28:37'),
(460, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:28:48'),
(461, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-07 21:29:30'),
(462, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:29:41'),
(463, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:29:50'),
(464, 1, 'CICT', 'Add', 'sample, sample sample', 'instructor', '2024-09-07 21:30:27'),
(465, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:31:57'),
(466, 1, 'CICT', 'Update', 'sample, sample sample', 'instructor', '2024-09-07 21:32:05'),
(467, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:33:34'),
(468, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-07 21:33:43'),
(469, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:35:39'),
(470, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:35:43'),
(471, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-07 21:35:48'),
(472, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:35:58'),
(473, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:36:02'),
(474, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:36:18'),
(475, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:36:21'),
(476, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:36:32'),
(477, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:36:37'),
(478, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:36:46'),
(479, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-07 21:37:23'),
(480, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-07 21:37:32'),
(481, 1, 'CICT', 'Delete', '1', 'room', '2024-09-07 21:37:43'),
(482, 1, 'CICT', 'Delete', '1', 'section', '2024-09-07 23:32:28'),
(483, 1, 'CICT', 'Update', 'BSIT 3D - Group 2', 'section', '2024-09-07 23:37:34'),
(484, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'section', '2024-09-07 23:37:41'),
(485, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'section', '2024-09-07 23:39:23'),
(486, 1, 'CICT', 'Add', 'BSIT 3D - Group 2', 'section', '2024-09-07 23:41:25'),
(487, 1, 'CICT', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-07 23:41:48'),
(488, 1, 'CICT', 'Delete', '1', 'section', '2024-09-07 23:42:26'),
(489, 1, 'CICT', 'Delete', '1', 'section', '2024-09-07 23:42:39'),
(490, 1, 'CICT', 'Add', 'BSIT 3D - Group 2', 'section', '2024-09-07 23:45:27'),
(491, 1, 'CICT', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-07 23:45:36'),
(492, 2, 'CBA', 'Add', 'BSIE 1B - Group 1', 'section', '2024-09-08 00:03:43'),
(493, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'section', '2024-09-08 00:11:25'),
(494, 1, 'CICT', 'Delete', '1', 'section', '2024-09-08 00:11:33'),
(495, 1, 'CICT', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:12:44'),
(496, 1, 'CICT', 'Update', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:12:52'),
(497, 1, 'CICT', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:13:40'),
(498, 1, 'CICT', 'Delete', '1', 'section', '2024-09-08 00:13:51'),
(499, 1, 'CICT', 'Add', 'BSIT 1A - Group 2', 'section', '2024-09-08 00:14:27'),
(500, 1, 'CICT', 'Delete', '1', 'section', '2024-09-08 00:14:46'),
(501, 1, 'CICT', 'Update', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:15:07'),
(502, 1, 'CICT', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:15:29'),
(503, 1, 'CICT', 'Delete', '1', 'section', '2024-09-08 00:15:46'),
(504, 1, 'CICT', 'Add', 'BSIT 1A - Group 2', 'section', '2024-09-08 00:18:17'),
(505, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:26:42'),
(506, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:26:50'),
(507, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-09-08 00:26:59'),
(508, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 00:27:10'),
(509, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:28:08'),
(510, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:28:15'),
(511, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-09-08 00:28:21'),
(512, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 00:28:31'),
(513, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:30:12'),
(514, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-09-08 00:30:21'),
(515, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 00:30:30'),
(516, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-09-08 00:32:02'),
(517, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 00:32:10'),
(518, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:33:01'),
(519, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-09-08 00:33:32'),
(520, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 00:33:44'),
(521, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 00:34:18'),
(522, 1, 'CICT', 'Add', 'test, test test', 'instructor', '2024-09-08 00:34:26'),
(523, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 00:34:34'),
(524, 1, 'CICT', 'Update', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:35:31'),
(525, 1, 'CICT', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 00:35:41'),
(526, 1, 'CICT', 'Delete', '1', 'section', '2024-09-08 00:35:51'),
(527, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 11:48:35'),
(528, 1, 'CICT', 'Update', 'test, test test', 'instructor', '2024-09-08 11:49:18'),
(529, 1, 'CICT', 'Update', 'MML', 'room', '2024-09-08 11:49:49'),
(530, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-08 11:50:11'),
(531, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-08 11:50:16'),
(532, 1, 'CICT', 'Update', 'RM201', 'room', '2024-09-08 11:51:27'),
(533, 1, 'CICT', 'Update', 'MML', 'room', '2024-09-08 11:52:32'),
(534, 1, 'CICT', 'Delete', '1', 'room', '2024-09-08 11:52:40'),
(535, 1, 'CICT', 'Update', 'MML', 'room', '2024-09-08 11:54:36'),
(536, 1, 'CICT', 'Update', 'BSIT 1A - Group 1', 'section', '2024-09-08 11:56:28'),
(537, 2, 'CBA', 'Add', 'BSBA 1A - Group 1', 'section', '2024-09-08 12:29:09'),
(538, 2, 'CBA', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 12:29:16'),
(539, 2, 'CBA', 'Add', 'BSBA 1A - Group 1', 'section', '2024-09-08 12:30:07'),
(540, 2, 'CBA', 'Add', 'BSBA 1A - Group 1', 'section', '2024-09-08 12:30:50'),
(541, 2, 'CBA', 'Add', 'BSIE 1B - Group 1', 'section', '2024-09-08 12:34:14'),
(542, 2, 'CBA', 'Delete', '1', 'section', '2024-09-08 12:34:32'),
(543, 2, 'CBA', 'Add', 'BSBA 1A - Group 1', 'section', '2024-09-08 12:35:07'),
(544, 2, 'CBA', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 12:35:48'),
(545, 2, 'CBA', 'Delete', '1', 'section', '2024-09-08 12:36:03'),
(546, 2, 'CBA', 'Update', 'BSBA 1A - Group 1', 'section', '2024-09-08 12:36:22'),
(547, 2, 'CBA', 'Update', 'BSBA 2B - Group 1', 'section', '2024-09-08 12:54:35'),
(548, 2, 'CBA', 'Add', 'BSBA 1A - ', 'section', '2024-09-08 12:55:03'),
(549, 2, 'CBA', 'Add', 'BSBA 1B - Group 1', 'section', '2024-09-08 12:56:10'),
(550, 2, 'CBA', 'Add', 'BSBA 3B - Group 1', 'section', '2024-09-08 12:56:23'),
(551, 2, 'CBA', 'Add', 'BSBA 1B - Group 1', 'section', '2024-09-08 12:57:09'),
(552, 2, 'CBA', 'Add', 'BSBA 1B - Group 1', 'section', '2024-09-08 12:58:38'),
(553, 2, 'CBA', 'Add', 'BSBA 1B - Group 1', 'section', '2024-09-08 13:00:03'),
(554, 2, 'CBA', 'Add', 'BSBA 1B - Group 1', 'section', '2024-09-08 13:03:15'),
(555, 3, 'CIT', 'Add', 'Automotive 1A - Group 1', 'section', '2024-09-08 13:26:33'),
(556, 3, 'CIT', 'Add', 'Automotive 1A - Group 2', 'section', '2024-09-08 13:33:55'),
(557, 2, 'CBA', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 13:35:49'),
(558, 2, 'CBA', 'Update', 'BSBA 1A - Group 1', 'section', '2024-09-08 13:36:31'),
(559, 2, 'CBA', 'Delete', '1', 'section', '2024-09-08 13:41:58'),
(560, 2, 'CBA', 'Add', 'BSBA 1A - Group 1', 'section', '2024-09-08 13:42:09'),
(561, 2, 'CBA', 'Update', 'BSBA 1B - Group 1', 'section', '2024-09-08 13:42:34'),
(562, 2, 'CBA', 'Update', 'BSBA 1B - Group 1', 'section', '2024-09-08 13:42:41'),
(563, 2, 'CBA', 'Delete', '2', 'section', '2024-09-08 13:45:16'),
(564, 2, 'CBA', 'Add', 'BSBA 1A - Group 1', 'section', '2024-09-08 13:45:23'),
(565, 2, 'CBA', 'Add', 'BSIT 1A - Group 1', 'section', '2024-09-08 13:45:34'),
(566, 2, 'CBA', 'Delete', '1', 'section', '2024-09-08 13:45:43'),
(567, 2, 'CBA', 'Add', 'BSBA 1B - ', 'section', '2024-09-08 13:45:56'),
(568, 2, 'CBA', 'Update', 'BSBA 1A - ', 'section', '2024-09-08 13:46:14'),
(569, 2, 'CBA', 'Add', 'BSBA 1C - Group 1', 'section', '2024-09-08 13:47:12'),
(570, 2, 'CBA', 'Add', 'BSBA 3A - Group 1', 'section', '2024-09-08 13:47:35'),
(571, 2, 'CBA', 'Add', 'BSBA 3A - ', 'section', '2024-09-08 13:55:35'),
(572, 2, 'CBA', 'Add', 'BSBA 2A - ', 'section', '2024-09-08 13:55:59'),
(573, 2, 'CBA', 'Update', 'BSBA 3A - ', 'section', '2024-09-08 13:56:04'),
(574, 1, 'CICT', 'Add', 'BSIT 1B - Group 1', 'section', '2024-09-08 13:57:22'),
(575, 2, 'CBA', 'Add', 'BSIT 1A - ', 'section', '2024-09-08 13:58:48'),
(576, 2, 'CBA', 'Delete', '1', 'section', '2024-09-08 13:59:04'),
(577, 2, 'CBA', 'Delete', '2', 'section', '2024-09-08 14:02:55'),
(578, 2, 'CBA', 'Add', 'BSBA 1A - ', 'section', '2024-09-08 14:03:06'),
(579, 2, 'CBA', 'Add', 'BSBA 1B - ', 'section', '2024-09-08 14:03:14'),
(580, 1, 'CICT', 'Add', 'Object Oriented Programming 1 (OOP1)', 'subject', '2024-09-08 20:54:44'),
(581, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-08 21:45:44'),
(582, 1, 'CICT', 'Add', 'test (test)', 'subject', '2024-09-10 08:31:50'),
(583, 1, 'CICT', 'Update', 'test (test)', 'subject', '2024-09-10 08:32:01'),
(584, 1, 'CICT', 'Delete', '1', 'subject', '2024-09-10 09:11:34'),
(585, 1, 'CICT', 'Delete', '1', 'subject', '2024-09-10 09:18:51'),
(586, 1, 'CICT', 'Add', 'Object Oriented Programming 2 (OOP2)', 'subject', '2024-09-10 09:22:15'),
(587, 1, 'CICT', 'Add', 'test (test)', 'subject', '2024-09-10 09:22:29'),
(588, 1, 'CICT', 'Update', 'test (test)', 'subject', '2024-09-10 09:22:33'),
(589, 1, 'CICT', 'Delete', '1', 'subject', '2024-09-10 09:25:14'),
(590, 1, 'CICT', 'Delete', '1', 'section', '2024-09-10 09:27:47'),
(591, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-10 09:29:06'),
(592, 1, 'CICT', 'Delete', '1', 'room', '2024-09-10 09:29:16'),
(593, 1, 'CICT', 'Delete', '1', 'instructor', '2024-09-10 09:31:13'),
(594, 1, 'CICT', 'Delete', '1', 'subject', '2024-09-10 10:23:44'),
(595, 1, 'CICT', 'Add', 'Object Oriented Programming 2 (OOP2)', 'subject', '2024-09-10 10:24:03'),
(596, 3, 'CIT', 'Delete', '2', 'section', '2024-09-10 13:04:57'),
(597, 3, 'CIT', 'Add', 'Automotive 1A - Group 1', 'section', '2024-09-10 13:06:00'),
(598, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 15:01:35'),
(599, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 15:04:22'),
(600, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 18:20:34'),
(601, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 18:22:35'),
(602, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 18:23:43'),
(603, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 18:24:52'),
(604, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 18:25:47'),
(605, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-10 18:27:45'),
(606, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 00:10:57'),
(607, 1, 'CICT', 'Add', 'test (test)', 'subject', '2024-09-11 15:25:58'),
(608, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 16:03:43'),
(609, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 16:04:13'),
(610, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 16:07:54'),
(611, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 16:08:36'),
(612, 1, 'CICT', 'Update', 'BSIT 3D - Group 2', 'schedule', '2024-09-11 16:09:19'),
(613, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 16:09:19'),
(614, 1, 'CICT', 'Add', 'RM201', 'room', '2024-09-11 16:11:34'),
(615, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:42:26'),
(616, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:43:52'),
(617, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:44:02'),
(618, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:47:09'),
(619, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-11 21:48:31'),
(620, 1, 'CICT', 'Delete', '1', 'Schedule', '2024-09-11 21:50:18'),
(621, 1, 'CICT', 'Add', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:50:42'),
(622, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:53:13'),
(623, 1, 'CICT', 'Update', 'BSIT 3D - Group 1', 'schedule', '2024-09-11 21:53:33');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_code` varchar(10) NOT NULL,
  `department` varchar(100) NOT NULL,
  `department_head` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_code`, `department`, `department_head`) VALUES
('CBA', 'College of Business Administration', 'test'),
('CICT', 'College of Information and Communications Technology', 'Anthony Concepcion'),
('CIT', 'College of Industrial Technology', 'sample');

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `instructor_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `work_type` varchar(20) NOT NULL,
  `tags` varchar(100) NOT NULL,
  `department_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`instructor_id`, `email`, `first_name`, `middle_name`, `last_name`, `work_type`, `tags`, `department_code`) VALUES
(63, 'clyde@gmail.com', 'Clyde', '', 'Mondero', 'Regular', '', 'CICT'),
(64, 'angelshane@gmail.com', 'Angel', 'Shane', 'Mangrobang', 'Regular', '', 'CICT'),
(65, 'andrei@gmail.com', 'Andrei', 'nigga', 'Poma', '', 'Nigga', 'CICT'),
(66, 'markjames@gmail.com', 'Mark', 'James', 'Villagonzalo', '', 'Nigga2', 'CICT'),
(82, 'angeloparungao.ap@gmail.com', 'Angelo', 'Lapuz', 'Parungao', 'Regular', 'myself', 'CICT'),
(83, 'bhenz@gmail.com', 'bhenz', 'mharl', 'bartolome', 'Regular', 'Web and Mobile Application', 'CICT'),
(84, 'angelaparungao.ap@gmail.com', 'Angela', 'Marie', 'Parungao', 'Regular', 'sister', 'CICT'),
(85, 'lorenaparungao@gmail.com', 'Lorena', 'Lapuz', 'Parungao', 'Regular', 'mother', 'CICT'),
(87, 'albert@gmail.com', 'Albert', 'Bading', 'Junio', 'Part-timer', 'Bading', 'CICT');

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
(44, 'Laboratory', 'MML', 'Multi Media Laboratory'),
(57, 'Lecture', 'RM201', '');

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
  `room` varchar(20) NOT NULL,
  `background_color` varchar(20) NOT NULL,
  `day` varchar(20) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `department_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `instructor`, `subject`, `section_name`, `section_group`, `class_type`, `room`, `background_color`, `day`, `start_time`, `end_time`, `department_code`) VALUES
(137, 'test test test', 'Quality Assurance', 'BSIT 3D', 'Group 1', 'Lecture', 'RM201', '#f2a6a6', 'Monday', '07:00:00', '09:00:00', 'CICT'),
(138, 'test test test', 'MMW', 'BSBA 1A', '', 'Lecture', 'RM201', '#9d1b1b', 'Monday', '10:00:00', '12:00:00', 'CBA'),
(148, 'test test test', 'Quality Assurance', 'BSIT 3D', 'Group 1', 'Laboratory', 'MML', '#f2a6a6', 'Wednesday', '08:00:00', '11:00:00', 'CICT'),
(149, 'test test test', 'test', 'BSIT 3D', 'Group 1', 'Lecture', 'RM201', '#f2a6a6', 'Monday', '11:00:00', '13:00:00', 'CICT'),
(150, 'test test test', 'test', 'BSIT 3D', 'Group 2', 'Lecture', 'RM201', '#f2a6a6', 'Monday', '11:00:00', '13:00:00', 'CICT'),
(151, 'test test test', 'Quality Assurance', 'BSIT 3D', 'Group 2', 'Lecture', 'RM201', '#f2a6a6', 'Tuesday', '07:00:00', '09:00:00', 'CICT'),
(152, 'Clyde  Mondero', 'Object Oriented Programming 2', 'BSIT 3D', 'Group 1', 'Lecture', 'RM201', '#4799f0', 'Monday', '09:00:00', '11:00:00', 'CICT'),
(156, 'Clyde  Mondero', 'Object Oriented Programming 2', 'BSIT 3D', 'Group 1', 'Laboratory', 'MML', '#66d1ff', 'Thursday', '07:00:00', '10:00:00', 'CICT');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(15) NOT NULL,
  `section_group` varchar(15) NOT NULL,
  `year_level` varchar(20) NOT NULL,
  `section_capacity` int(100) NOT NULL,
  `section_tags` varchar(50) NOT NULL,
  `department_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `section_name`, `section_group`, `year_level`, `section_capacity`, `section_tags`, `department_code`) VALUES
(30, 'BSIT 3D', 'Group 1', '3rd Year', 19, '', 'CICT'),
(34, 'BSIT 3D', 'Group 2', '3rd Year', 20, '', 'CICT'),
(41, 'BSIT 1A', 'Group 2', '1st Year', 20, '', 'CICT'),
(42, 'BSIT 1A', 'Group 1', '1st Year', 20, '', 'CICT'),
(66, 'BSBA 3A', '', '3rd Year', 40, '', 'CBA'),
(67, 'BSBA 2A', '', '2nd Year', 40, '', 'CBA'),
(70, 'BSBA 1A', '', '1st Year', 40, '', 'CBA'),
(71, 'BSBA 1B', '', '1st Year', 40, '', 'CBA'),
(72, 'Automotive 1A', 'Group 1', '1st Year', 20, '', 'CIT');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_name` varchar(50) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `year_level` varchar(10) NOT NULL,
  `subject_semester` int(11) NOT NULL,
  `subject_type` varchar(10) NOT NULL,
  `subject_units` int(5) NOT NULL,
  `subject_tags` varchar(50) NOT NULL,
  `department_code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_name`, `subject_code`, `year_level`, `subject_semester`, `subject_type`, `subject_units`, `subject_tags`, `department_code`) VALUES
(33, 'Quality Assurance', 'IT309', '3rd Year', 1, 'Major', 3, '', 'CICT'),
(38, 'Object Oriented Programming 2', 'OOP2', '2nd Year', 2, 'Major', 2, '', 'CICT'),
(39, 'test', 'test', '1st Year', 1, 'Minor', 1, '', 'CICT');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `department_code` varchar(10) NOT NULL,
  `username` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `department_code`, `username`, `email`, `password`, `role`) VALUES
(1, 'CICT', 'CICT', 'CICT@gmail.com', '$2b$10$4jpVjWYVUNDX2Jawuen.SekSB9y3gS6r5g7D0TM6zHeJyBEwMIwmC', 'User'),
(2, 'CBA', 'CBA', 'CBA@gmail.com', '$2b$10$YI3pzyr98icZCAM4AwLD1.BDWFXWEXfp9m0N1XGf3rq4YzSUwTFaG', 'User'),
(3, 'CIT', 'CIT', 'CIT@gmail.com', '$2b$10$N3huJLZykrH.NpdUhenSP.HYojCZtqfD0TddXwfz2T49ZTW5TP0UK', 'User'),
(4, 'ADMIN', 'ADMIN', 'ADMIN@gmail.com', '$2b$10$M7ynm05VuBXoBLUimnYaL.wxVFvx0vvrrUQblagPoeQjQFhU6h2EC', 'Administrator');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`activity_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_code`);

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
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=624;

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `instructor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
