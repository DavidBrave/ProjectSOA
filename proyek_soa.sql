-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 04, 2021 at 05:40 PM
-- Server version: 8.0.13-4
-- PHP Version: 7.2.24-0ubuntu0.18.04.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `6ozd7j9z6w`
--
CREATE DATABASE IF NOT EXISTS `6ozd7j9z6w` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `6ozd7j9z6w`;

-- --------------------------------------------------------

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
  `id_favorite` int(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `id_game` int(11) NOT NULL,
  `tgl_favorite` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `favorite`
--

INSERT INTO `favorite` (`id_favorite`, `api_key`, `id_game`) VALUES
(1, 'ss', 11),
(2, 'ss', 11),
(3, 'dwd', 33),
(4, 'gg', 44),
(8, 'dicky@gmail.com', 1),
(11, 'dicky@gmail.com', 0),
(12, 'dicky@gmail.com', 0),
(13, 'dicky@gmail.com', 0),
(14, 'dicky@gmail.com', 3498),
(15, 'dicky@gmail.com', 3498),
(16, 'dicky@gmail.com', 1),
(17, '8o3heXWG5NN2ElI', 3498),
(19, '8o3heXWG5NN2ElI', 2);

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
  `id_history` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `id_game` int(11) NOT NULL,
  `tgl_history` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deskripsi_history` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`id_history`, `api_key`, `id_game`, `deskripsi_history`) VALUES
(4, '2LuQ5KUwYpiXhmo', 1, 'view detail game'),
(8, 'chYWILZg17CtlrA', 1, 'view detail game'),
(9, 'chYWILZg17CtlrA', 1, 'view detail game'),
(17, '8o3heXWG5NN2ElI', 1, 'view detail game');

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
(5, 'dicky@gmail.com', 1, 80, 'mantul2'),
(6, '8o3heXWG5NN2ElI', 1, 80, 'mantul'),
(7, '8o3heXWG5NN2ElI', 2, 82, 'mantul'),
(8, '8o3heXWG5NN2ElI', 1, 80, 'mantul'),
(9, '8o3heXWG5NN2ElI', 1, 80, 'mantul'),
(10, '8o3heXWG5NN2ElI', 1, 80, 'mantul');

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
('', 'dicky@gmail.com', 'ggwp', 'dicky', 'P', './uploadsdicky.jpg', 998499, 710),
('2LuQ5KUwYpiXhmo', 'testing@gmail.com', 'testing', 'testing', 'N', './uploads/testing.jpg', 0, 50),
('8o3heXWG5NN2ElI', 'demo1@gmail.com', '12345', 'ducky2', 'P', './uploads/ducky2.jpg', 99450, 1785),
('chYWILZg17CtlrA', 'demo2@gmail.com', 'demo2', 'demo2', 'P', './uploads/demo2.jpg', 0, 50),
('Cp31PgH4CoH1nxQ', 'normal1@gmail.com', 'normal', 'user normal', 'N', './uploads/user normal.jpg', 0, 50),
('gvrL0P7fTPvsRiA', 'david@gmail.com', 'david', 'david', 'P', './uploads/david.png', 0, 50),
('tQUZu4ctHc2AR3K', 'test@gmail.com', 'test', 'test', 'P', './uploads/test.jpg', 0, 50);

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
  MODIFY `id_favorite` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id_history` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
