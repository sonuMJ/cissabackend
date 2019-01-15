-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 15, 2019 at 06:31 AM
-- Server version: 10.1.19-MariaDB
-- PHP Version: 5.6.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cissa`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(20) NOT NULL,
  `orderid` varchar(60) NOT NULL,
  `userid` varchar(60) NOT NULL,
  `date` varchar(60) NOT NULL,
  `status` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `orderid`, `userid`, `date`, `status`) VALUES
(47, '1800288501681', '14001443436722', '1547442192273', 'cancelled'),
(48, '1800530589920', '14001443436722', '1547442227791', 'cancelled'),
(49, '1800921015389', '14001443436722', '1547442292546', 'cancelled');

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` int(20) NOT NULL,
  `orderid` varchar(60) NOT NULL,
  `productid` varchar(60) NOT NULL,
  `quantity` varchar(60) NOT NULL,
  `date` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`id`, `orderid`, `productid`, `quantity`, `date`) VALUES
(60, '1800288501681', '1000', '1', '1547442192273'),
(61, '1800288501681', 'P_xvqt-gfb4fmofaau', '1', '1547442192273'),
(62, '1800530589920', 'P_hbbx-z573k445r1', '1', '1547442227791'),
(63, '1800530589920', 'P_fg29-kr1zc3bfswf', '1', '1547442227791'),
(64, '1800921015389', '1000', '1', '1547442292546'),
(65, '1800742814556', '1000', '1', '1547461551767'),
(66, '1800602619792', '1000', '1', '1547461943801'),
(67, '1800602619792', 'P_xvqt-gfb4fmofaau', '2', '1547461943801'),
(68, '180082974621', '1000', '1', '1547463379802'),
(69, '1800809265916', 'P_hbbx-z573k445r1', '1', '1547463529927');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(20) NOT NULL,
  `name` varchar(40) NOT NULL,
  `price` varchar(40) NOT NULL,
  `quantity` text NOT NULL,
  `img_url` text NOT NULL,
  `availability` varchar(40) NOT NULL,
  `product_id` varchar(40) NOT NULL,
  `translated` varchar(40) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `category` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `quantity`, `img_url`, `availability`, `product_id`, `translated`, `category`) VALUES
(8, 'Carrot', '50', '500g', 'https://i5.walmartimages.ca/images/Large/832/497/6000196832497.jpg', 'true', 'PRO123', 'കാരറ്റ്', 'vegetable'),
(9, 'tomato', '35', '500g', 'https://i5.walmartimages.ca/images/Large/832/497/6000196832497.jpg', 'true', 'PRO1234', 'തക്കാളി്', 'vegetable'),
(17, 'cucumber', '45', '500g', 'http://www.eatbydate.com/wp-content/uploads/Cucumber.jpg', 'false', 'P_fg29-kr1zc3bfswf', 'വെള്ളരിക്ക', 'vegetable'),
(18, 'Beans', '24', '500g', 'https://4.imimg.com/data4/KP/UV/MY-27021573/fresh-beans-500x500.jpg', '1', 'P_hbbx-z573k445r1', 'പയർ', 'vegetable'),
(19, 'Onion', '36', '500g', 'https://i5.walmartimages.ca/images/Large/601/045/999999-33383601045.jpg', '1', 'P_xvqt-gfb4fmofaau', 'ഉള്ളി', 'vegetable'),
(20, 'Apple', '80', '1kg', 'https://i.dailymail.co.uk/i/pix/2016/03/31/17/20C936A400000578-3517655-image-a-24_1459440753386.jpg', '1', '1000', 'ആപ്പിൾ ', 'fruit');

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE `product_category` (
  `id` int(20) NOT NULL,
  `name` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `product_category`
--

INSERT INTO `product_category` (`id`, `name`) VALUES
(1, 'vegetable'),
(2, 'fruit');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(80) NOT NULL,
  `email` varchar(80) NOT NULL,
  `password` text NOT NULL,
  `user_id` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `user_id`) VALUES
(1, 'john', 'john@gmail.com', '1234', '75895177662'),
(4, 'john', 'john1@gmail.com', '1234', '6463613133'),
(5, 'john', 'juli@gmail.com', '1234', 'john11083691786'),
(6, 'ss', 'ss@gmail.com', '12', 'pnm22oymb9s-ipoayi7brgfo84gfmbuwsa'),
(7, 'ss', 'sss@gmail.com', '$2b$10$xROzGl2smVpRoh/mXxyI4.TBbOtZYeLn76OtR6FM2yfEOY6yRwf/6', 'mr9snswa7d9-fii4jaetuwhyy52dhhlow'),
(8, 'ss', 's1@gmail.com', '$2b$10$EJ5SSvCtJYfkRN3XPUtzku7Y2/MbIr2yaQG51PKyROj8RWCcVOHmG', '4t4pz10vesq-rztbngs6noxpjuic7v00m'),
(9, 'john', 'john123@gmail.com', '$2b$10$KdorXz68XrLtdzR/dv5WAe.skPlk.rGv/9ScHUGa.tL9/8M.lAYhu', '543hykynkrn-22elsbw41e0is1pd38dydtg'),
(10, '12', '12', '$2a$10$lhn5UbKcTfW9hxWmhbpJquYSGMhM3vu3EBbnxu7QIgUJsSy9G2Rx.', '14009251881192'),
(11, 'deepak', '987654321', '$2a$10$ji5BJY9DmuuTf9viJGocz.7pw3.7KW70ZSURp9Hf/0wzQOdXra4pi', '1400249315787'),
(12, 'deepak', '987654322', '$2a$10$WJl2KmWPn1T44hWDpUbg9Ow9v3qjs45iX47Ken3W9WAXpcCX/cAGG', '14006552556487'),
(13, 'adminnnn', '1234', '$2a$10$hp9TxuYcF4GGtBWcxii6BOeQ5KfdjJ/IMBk.5DYZE2rq9Kh1.W4V6', '14001443436722');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;
--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;
--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
--
-- AUTO_INCREMENT for table `product_category`
--
ALTER TABLE `product_category`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
