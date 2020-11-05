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

SELECT * FROM `picks` ORDER BY `last_change_at` DESC;

-- select all picks made or updated in the last x hours
SELECT * FROM `picks` WHERE `last_change_at` > (UNIX_TIMESTAMP() * 1000 - 3600000 * 1) ORDER BY `last_change_at` DESC;

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
    (CASE WHEN `away_score` > `home_score` THEN 0 WHEN `away_score` < `home_score` THEN 1 WHEN `away_score` = `home_score` THEN 2 ELSE NULL END) AS `winner`
FROM
    `picks`
        RIGHT JOIN
    `games` ON `games`.`id` = `picks`.`game_id`
        AND `user_id` = '84cbd806-1a5d-4b2c-beed-3b7b7ca686bc'
WHERE
    `season` = 2020 AND `week` LIKE 2
ORDER BY
	`game_at` ASC;
        
-- selectGroupPicksForWeek
-- get all picks for the week for the entire group
-- user picks are shown but for games that haven't started yet it only shows if picks have been made (null means no pick, 0 means visitor, 1 means home, 2 means pick made but other user and game hasn't started yet) 
SELECT 
    `game_at`,
    `away_team`,
    `home_team`,
    `games`.`id` AS `game_id`,
    (CASE
        WHEN `user_id` = '84cbd806-1a5d-4b2c-beed-3b7b7ca686bc' THEN `pick`
        WHEN `game_at` < (UNIX_TIMESTAMP() * 1000) THEN `pick`
        WHEN `pick` IS NOT NULL THEN 2
        ELSE NULL
    END) AS `pick`,
    (CASE WHEN `away_score` > `home_score` THEN 0 WHEN `away_score` < `home_score` THEN 1 WHEN `away_score` = `home_score` THEN 2 ELSE NULL END) AS `winner`,
    `users`.`id` AS `user_id`,
    `users`.`initials` AS `user_initials`
FROM
    `games`
        CROSS JOIN
    `users`
        LEFT JOIN
    `picks` ON `games`.`id` = `picks`.`game_id`
        AND `users`.`id` = `picks`.`user_id`
WHERE
    (`group_id` = '3fd8d78c-8151-4145-b276-aea3559deb76'
        OR `group_id` IS NULL)
        AND `season` = 2020
        AND `week` LIKE '1'
ORDER BY `game_at` ASC;

-- selectStandings
-- new version with week or wildcard week for entire season
SELECT 
	`team_name`,
    `initials`,
    SUM(CASE WHEN `pick` = (CASE WHEN `away_score` > `home_score` THEN 0 WHEN `away_score` < `home_score` THEN 1 WHEN `away_score` = `home_score` THEN 2 ELSE NULL END) AND `pick` is not null THEN 1 ELSE 0 END) AS `num_correct`
FROM
    `games`
        RIGHT JOIN
    `picks` ON `picks`.`game_id` = `games`.`id`
    RIGHT JOIN
    `users` ON `picks`.`user_id` = `users`.`id`
WHERE
   `group_id` = '3fd8d78c-8151-4145-b276-aea3559deb76'
       AND `season` = 2020 AND `week` LIKE '3' AND `pick` is not null
         GROUP BY `user_id` ORDER BY `num_correct` DESC;
	
-- see who got the most correct picks in a week

