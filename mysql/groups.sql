USE `pickem_app`;

CREATE TABLE `groups`(
	`id` CHAR(36) PRIMARY KEY DEFAULT (UUID()), /* fixed length of string uuid */
    `owner_id` CHAR(36) NOT NULL, -- foreign key (owner user id)
    `group_name` VARCHAR(32) NOT NULL, -- short summary of the produce being advertised
    `created_at` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
	`is_public` TINYINT NOT NULL DEFAULT 0, -- 0 = private (unlisted), 1 = public (listed)
	`passcode` VARCHAR(32) NOT NULL DEFAULT '', -- plain text passcode to join the group (if '' then no passcode required to join)
    CONSTRAINT `fk_group_owner_id`
		FOREIGN KEY (`owner_id`)
        REFERENCES `users`(`id`)
);
-- DROP TABLE `groups`;

INSERT INTO `groups` (
	`id`,
    `owner_id`,
    `group_name`
)
VALUES ('3fd8d78c-8151-4145-b276-aea3559deb76','84cbd806-1a5d-4b2c-beed-3b7b7ca686bc','Hawk Nation');

SELECT * FROM `groups`;

-- add some columns 9/7/2020
ALTER TABLE `groups`
ADD COLUMN `is_public` TINYINT NOT NULL DEFAULT 0 AFTER `created_at`,
ADD COLUMN `passcode` VARCHAR(32) NOT NULL DEFAULT '' AFTER `is_public`;