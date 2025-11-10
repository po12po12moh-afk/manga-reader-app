CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mangaId` int NOT NULL,
	`chapterNumber` float NOT NULL,
	`title` varchar(255),
	`titleAr` varchar(255),
	`views` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mangaId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100),
	CONSTRAINT `genres_id` PRIMARY KEY(`id`),
	CONSTRAINT `genres_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `manga` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`description` text,
	`descriptionAr` text,
	`coverImage` text,
	`author` varchar(255),
	`artist` varchar(255),
	`status` enum('ongoing','completed','hiatus') NOT NULL DEFAULT 'ongoing',
	`type` enum('manga','manhwa','manhua') NOT NULL DEFAULT 'manhwa',
	`rating` float DEFAULT 0,
	`views` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manga_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manga_genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mangaId` int NOT NULL,
	`genreId` int NOT NULL,
	CONSTRAINT `manga_genres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mangaId` int NOT NULL,
	`chapterId` int NOT NULL,
	`pageNumber` int DEFAULT 1,
	`lastReadAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_history_id` PRIMARY KEY(`id`)
);
