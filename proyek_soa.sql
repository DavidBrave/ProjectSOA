-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 09, 2021 at 02:38 PM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `proyek_soa`
--
CREATE DATABASE IF NOT EXISTS `proyek_soa` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `proyek_soa`;

-- --------------------------------------------------------

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
  `id_favorite` int(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `id_game` int(11) NOT NULL,
  `tgl_favorite` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `favorite`
--

INSERT INTO `favorite` (`id_favorite`, `api_key`, `id_game`, `tgl_favorite`) VALUES
(1, 'ss', 11, '2021-05-15 13:32:29'),
(2, 'ss', 11, '2021-05-15 13:33:12'),
(3, 'dwd', 33, '0000-00-00 00:00:00'),
(4, 'gg', 44, '2021-05-15 13:42:18'),
(8, 'dicky@gmail.com', 1, '2021-05-15 13:56:07'),
(11, 'dicky@gmail.com', 0, '2021-05-16 12:49:57'),
(12, 'dicky@gmail.com', 0, '2021-05-16 12:51:31'),
(13, 'dicky@gmail.com', 0, '2021-05-16 12:54:40'),
(14, 'dicky@gmail.com', 3498, '2021-05-27 06:58:30'),
(15, 'dicky@gmail.com', 3498, '2021-05-27 07:14:40'),
(16, 'dicky@gmail.com', 1, '2021-05-27 07:15:32');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
  `id_history` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `id_game` int(11) NOT NULL,
  `tgl_history` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deskripsi_history` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `id_review` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `id_game` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `review` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id_review`, `api_key`, `id_game`, `rating`, `review`) VALUES
(1, 'dicky@gmail.com', 1, 80, 'NaN'),
(2, 'dicky@gmail.com', 1, 80, 'mantul'),
(3, 'dicky@gmail.com', 1, 80, 'mantul'),
(4, 'dicky@gmail.com', 1, 80, 'mantul'),
(5, 'dicky@gmail.com', 1, 80, 'mantul2');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `api_key` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_user` varchar(255) NOT NULL,
  `jenis_user` varchar(1) NOT NULL,
  `gambar_profile` text NOT NULL,
  `saldo_user` int(11) NOT NULL,
  `api_hit` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`api_key`, `email`, `password`, `nama_user`, `jenis_user`, `gambar_profile`, `saldo_user`, `api_hit`) VALUES
('', 'dicky@gmail.com', 'ggwp', 'dicky', 'P', './uploadsdicky.jpg', 998499, 710);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`id_favorite`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id_history`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id_review`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`api_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `favorite`
--
ALTER TABLE `favorite`
  MODIFY `id_favorite` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id_history` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
