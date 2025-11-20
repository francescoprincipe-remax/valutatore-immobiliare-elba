CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`valutazioneId` int,
	`nome` varchar(100) NOT NULL,
	`cognome` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telefono` varchar(50) NOT NULL,
	`gdprConsent` boolean NOT NULL DEFAULT false,
	`gdprConsentDate` timestamp DEFAULT (now()),
	`comune` varchar(100),
	`tipologia` varchar(50),
	`superficie` int,
	`valoreTotale` int,
	`ipAddress` varchar(50),
	`userAgent` text,
	`source` varchar(100) DEFAULT 'valutatore_web',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_valutazioneId_valutazioni_id_fk` FOREIGN KEY (`valutazioneId`) REFERENCES `valutazioni`(`id`) ON DELETE no action ON UPDATE no action;