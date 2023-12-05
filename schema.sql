CREATE DATABSE cms;
USE cms;

CREATE TABLE `post` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `user_uuid` VARCHAR(50) NOT NULL,
  `featuredImageURL` VARCHAR(255) NOT NULL,
  `body` LONGTEXT NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug_UNIQUE` (`slug` ASC) VISIBLE);

CREATE TABLE `category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug_UNIQUE` (`slug` ASC) VISIBLE);

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_uuid` VARCHAR(50) NOT NULL,
  `emailAddress` VARCHAR(200) NOT NULL,
  `firstName` VARCHAR(20) NOT NULL,
  `lastName` VARCHAR(20) NOT NULL,
  `profileImageURL` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL,
  `provider` ENUM('google', 'twitter', 'facebook', 'email') NOT NULL DEFAULT 'email',
  `providerUserId` VARCHAR(255) NULL,
  `passwordResetToken` VARCHAR(10) NULL,
  `passwordResetTokenExpiry` TIMESTAMP NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_uuid_UNIQUE` (`user_uuid` ASC) VISIBLE,
  UNIQUE INDEX `emailAddress_UNIQUE` (`emailAddress` ASC) VISIBLE);

CREATE TABLE `session` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_uuid` VARCHAR(50) NOT NULL,
  `userAgent` VARCHAR(255) NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));

--inserting a default category
INSERT INTO `cms`.`category` (`id`, `slug`, `name`) VALUES ('1', 'uncategorized', 'Uncategorized');
