CREATE TABLE `fcm_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`deviceType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fcm_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `fcm_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`imageUrl` varchar(500),
	`data` json,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	`mangaId` int,
	`chapterId` int,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
