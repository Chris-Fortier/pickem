CREATE TABLE `picks`(
    `user_id` CHAR(36) NOT NULL, -- foreign key
    `game_id` CHAR(36) NOT NULL, -- foreign key
    `group_id` CHAR(36) NOT NULL, -- foreign key
    `pick` TINYINT UNSIGNED, -- null = not set yet, 0 = away team, 1 = home team
	`last_change_at` BIGINT SIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
    PRIMARY KEY (`user_id`, `game_id`, `group_id`),
    CONSTRAINT `fk_picks_user_id`
		FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`),
    CONSTRAINT `fk_picks_game_id`
		FOREIGN KEY (`game_id`)
        REFERENCES `games`(`id`),
    CONSTRAINT `fk_picks_group_id`
		FOREIGN KEY (`group_id`)
        REFERENCES `groups`(`id`)
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
	  '3fd8d78c-8151-4145-b276-aea3559deb76' AS `group_id`, -- returns the given group id so this will end up as a prop and it knows what group the component is for
      `pick`,
      `winner`
   FROM
      (SELECT 
         *
      FROM
         `picks`) as `picks`
	  RIGHT JOIN `games` ON `picks`.`game_id` = `games`.`id`
   WHERE
      (`user_id` = '84cbd806-1a5d-4b2c-beed-3b7b7ca686bc' OR `user_id` is NULL) AND -- show null user_id ones so that the user can see the ones they need to pick
	  (`group_id` = '3fd8d78c-8151-4145-b276-aea3559deb76' OR `group_id` is NULL) AND -- show null user_id ones so that the user can see the ones they need to pick
	  `season` = 2020 AND
      `week` = 1
   ORDER BY
	   `game_at` ASC; -- order by game time