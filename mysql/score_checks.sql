USE `pickem_app`;

-- a record of each time the scores for a week were checked on ESPN
CREATE TABLE `score_checks`(
	`id` CHAR(36) PRIMARY KEY DEFAULT (UUID()), /* fixed length of string uuid */
    `checked_at` BIGINT SIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
    `season` SMALLINT UNSIGNED NOT NULL,
    `week` TINYINT UNSIGNED NOT NULL,
    `check_type` VARCHAR(8) NOT NULL, -- auto = from a user loading a page, manual = from an admin clicking Update on enter scores
    `user_id` CHAR(36), -- the user whose page load or click did the check
    `num_filled` TINYINT UNSIGNED NOT NULL DEFAULT 0, -- number of games that had scores filled in
    `details` JSON, -- the scores filled in, and any saved scores that differ, swapped teams, games not in our schedule and skipped games
    `error` VARCHAR(255), -- null unless getting the scores from ESPN failed
    INDEX `idx_score_checks_checked_at` (`checked_at`),
    CONSTRAINT `fk_score_checks_user_id`
		FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
-- DROP TABLE `score_checks`;

SELECT * FROM `score_checks` ORDER BY `checked_at` DESC;

-- one row that keeps the automatic score checks from happening more than once every 10 minutes, no matter how many users load pages
CREATE TABLE `score_check_throttle`(
	`id` TINYINT UNSIGNED PRIMARY KEY,
    `last_auto_check_at` BIGINT SIGNED NOT NULL DEFAULT 0
);
-- DROP TABLE `score_check_throttle`;

INSERT INTO `score_check_throttle` (`id`, `last_auto_check_at`) VALUES (1, 0);

SELECT * FROM `score_check_throttle`;
