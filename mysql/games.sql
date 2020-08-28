CREATE TABLE `games`(
	`id` CHAR(36) PRIMARY KEY DEFAULT (UUID()), /* fixed length of string uuid */
    `game_at` BIGINT SIGNED NOT NULL, -- time of the game
    `week` TINYINT UNSIGNED NOT NULL,
    `season` SMALLINT UNSIGNED NOT NULL DEFAULT 2020,
    `away_team` CHAR(3) NOT NULL, -- jarjarbinks
    `home_team` CHAR(3) NOT NULL,
    `winner` TINYINT UNSIGNED -- null = not set yet, 0 = away team, 1 = home team, 2 = tie
);
DROP TABLE `games`;

-- 2020 week 1
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(1,1599783600000,'HOU','KC'),
(1,1600016400000,'NYJ','BUF'),
(1,1600016400000,'GB','MIN'),
(1,1600016400000,'PHI','WAS'),
(1,1600016400000,'CLE','BAL'),
(1,1600016400000,'IND','JAX'),
(1,1600016400000,'OAK','CAR'),
(1,1600016400000,'CHI','DET'),
(1,1600016400000,'SEA','ATL'),
(1,1600016400000,'MIA','NE'),
(1,1600027500000,'SD','CIN'),
(1,1600028700000,'ARI','SF'),
(1,1600028700000,'TB','NO'),
(1,1600042800000,'DAL','LAR'),
(1,1600125300000,'PIT','NYG'),
(1,1600135800000,'TEN','DEN');

SELECT * FROM `games`;

-- get all games with no winners that started at least four hours in the past
-- useful for data entry
SELECT 
    *
FROM
    `games`
WHERE
    `winner` IS NULL and (`game_at` + 3600000) < (UNIX_TIMESTAMP() * 1000);