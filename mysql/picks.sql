CREATE TABLE `picks`(
    `user_id` CHAR(36) NOT NULL, -- foreign key
    `game_id` CHAR(36) NOT NULL, -- foreign key
    `group_id` CHAR(36) NOT NULL, -- foreign key
    `pick` TINYINT UNSIGNED, -- null = not set yet, 0 = away team, 1 = home team
	`last_change_at` BIGINT SIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
    PRIMARY KEY (`user_id`, `game_id`, `group_id`),
    CONSTRAINT `fk_picks_user_id`
		FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_picks_game_id`
		FOREIGN KEY (`game_id`)
        REFERENCES `games`(`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_picks_group_id`
		FOREIGN KEY (`group_id`)
        REFERENCES `groups`(`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
DROP TABLE `picks`;

INSERT INTO `picks` (
	`user_id`,
    `game_id`,
    `group_id`,
    `pick`
)
VALUES
('84cbd806-1a5d-4b2c-beed-3b7b7ca686bc','0781b32a-e97f-11ea-b134-06a4a2a4eb91','3fd8d78c-8151-4145-b276-aea3559deb76',1);

SELECT * FROM `picks`;

-- upsert a pick (update or create)
-- upsertPick
INSERT INTO `pickem_app`.`picks` 
SET 
    `user_id` = '84cbd806-1a5d-4b2c-beed-3b7b7ca686bc',
    `game_id` = '0781b8e9-e97f-11ea-b134-06a4a2a4eb91',
    `group_id` = '3fd8d78c-8151-4145-b276-aea3559deb76',
    `pick` = 1
ON DUPLICATE KEY UPDATE `pick` = 1, `last_change_at` = UNIX_TIMESTAMP() * 1000;

-- get available picks for a given group, user and season week
-- selesctMyPicksForTheWeek
SELECT 
    `game_at`,
    `away_team`,
    `home_team`,
    `games`.`id` AS `game_id`,
    '3fd8d78c-8151-4145-b276-aea3559deb76' AS `group_id`,
    `pick`,
    `winner`
FROM
    `games`
        LEFT JOIN
    `picks` ON `games`.`id` = `picks`.`game_id`
        AND `user_id` = '11539be6-2118-4ec5-8fe3-580ef2950ca8'
        AND `season` = 2020
        AND `week` = 1;