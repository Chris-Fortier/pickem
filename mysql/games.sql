 USE `pickem_app`;

CREATE TABLE `games`(
	`id` CHAR(36) PRIMARY KEY DEFAULT (UUID()), /* fixed length of string uuid */
    `game_at` BIGINT SIGNED NOT NULL, -- time of the game
    `week` TINYINT UNSIGNED NOT NULL,
    `season` SMALLINT UNSIGNED NOT NULL DEFAULT 2020,
    `value` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `away_team` CHAR(3) NOT NULL, -- jarjarbinks
    `home_team` CHAR(3) NOT NULL,
    `winner` TINYINT UNSIGNED, -- null = not set yet, 0 = away team, 1 = home team, 2 = tie
	`away_score` TINYINT UNSIGNED DEFAULT NULL,
	`home_score` TINYINT UNSIGNED DEFAULT NULL
);
-- DROP TABLE `games`;

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
(1,1600016400000,'LV','CAR'),
(1,1600016400000,'CHI','DET'),
(1,1600016400000,'SEA','ATL'),
(1,1600016400000,'MIA','NE'),
(1,1600027500000,'LAC','CIN'),
(1,1600028700000,'ARI','SF'),
(1,1600028700000,'TB','NO'),
(1,1600042800000,'DAL','LAR'),
(1,1600125300000,'PIT','NYG'),
(1,1600135800000,'TEN','DEN');

SELECT * FROM `games`;

-- get all games with no winners that started at least three hours in the past
-- useful for data entry
USE `pickem_app`;
SELECT 
    * -- `game_at`,FROM_UNIXTIME(`game_at`/1000-25200, '%Y-%m-%d %H:%i') as `game_at_formatted`,`week`,`away_team`,`away_score`,`home_team`,`home_score`
FROM
    `games`
WHERE
    (`away_score` IS NULL OR `home_score` IS NULL) AND (`game_at` + 3600000 * 2) < (UNIX_TIMESTAMP() * 1000)
ORDER BY `game_at` ASC;
    
-- set winners from scores, run these after manually adding the scores using the query above
-- these should be no longer needed as my queries calculate winner based on score and don't use the manually entered field anymore
-- TODO: should delete the winner column in the future after I verify it works with no data added to it
-- UPDATE `pickem_app`.`games` SET `winner` = '0' WHERE (`away_score` > `home_score`) and `winner` is null;
-- UPDATE `pickem_app`.`games` SET `winner` = '1' WHERE (`away_score` < `home_score`) and `winner` is null;
-- UPDATE `pickem_app`.`games` SET `winner` = '2' WHERE (`away_score` = `home_score`) and `winner` is null;

-- select_game
-- get the details of a single game form the game id
SELECT * from `games` where `id` = '0781b6ed-e97f-11ea-b134-06a4a2a4eb91';

-- add score columns
ALTER TABLE `games`
ADD COLUMN `away_score` TINYINT UNSIGNED DEFAULT NULL AFTER `winner`,
ADD COLUMN `home_score` TINYINT UNSIGNED DEFAULT NULL AFTER `away_score`;

-- 2020 week 2
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(2,1600388400000,'CIN','CLE'),
(2,1600621200000,'NYJ','CHI'),
(2,1600621200000,'LAR','PHI'),
(2,1600621200000,'ATL','DAL'),
(2,1600621200000,'CAR','TB'),
(2,1600621200000,'SF','NYJ'),
(2,1600621200000,'DEN','STL'),
(2,1600621200000,'JAX','TEN'),
(2,1600621200000,'DET','GB'),
(2,1600621200000,'BUF','MIA'),
(2,1600621200000,'MIN','IND'),
(2,1600632300000,'WAS','ARI'),
(2,1600633500000,'BAL','HOU'),
(2,1600633500000,'KC','LAC'),
(2,1600647600000,'NE','SEA'),
(2,1600733700000,'NO','LV');

-- 2020 week 3
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(3,1600993200000,'MIA','JAX'),
(3,1601226000000,'OAK','NE'),
(3,1601226000000,'SF','NYG'),
(3,1601226000000,'CHI','ATL'),
(3,1601226000000,'LAR','BUF'),
(3,1601226000000,'HOU','PIT'),
(3,1601226000000,'CIN','PHI'),
(3,1601226000000,'WSH','CLE'),
(3,1601226000000,'TEN','MIN'),
(3,1601237100000,'NYJ','IND'),
(3,1601237100000,'CAR','LAC'),
(3,1601238300000,'TB','DEN'),
(3,1601238300000,'DAL','SEA'),
(3,1601238300000,'DET','ARI'),
(3,1601252400000,'GB','NO'),
(3,1601338500000,'KC','BAL');

-- 2020 week 4
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(4,1601598000000,'DEN','NYJ'),
(4,1601830800000,'MIN','HOU'),
(4,1601830800000,'JAX','CIN'),
(4,1601830800000,'LAC','TB'),
(4,1601830800000,'ARI','CAR'),
(4,1601830800000,'CLE','DAL'),
(4,1601830800000,'PIT','TEN'),
(4,1601830800000,'IND','CHI'),
(4,1601830800000,'NO','DET'),
(4,1601830800000,'SEA','MIA'),
(4,1601830800000,'BAL','WAS'),
(4,1601841900000,'NYG','LAR'),
(4,1601843100000,'NE','KC'),
(4,1601843100000,'BUF','LV'),
(4,1601857200000,'PHI','SF'),
(4,1601943300000,'ATL','GB');

-- 2020 week 5
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(5,1602202800000,'TB','CHI'),
(5,1602435600000,'JAX','HOU'),
(5,1602447900000,'DEN','NE'),
(5,1602435600000,'BUF','TEN'),
(5,1602435600000,'ARI','NYJ'),
(5,1602435600000,'PHI','PIT'),
(5,1602435600000,'CAR','ATL'),
(5,1602435600000,'LAR','WAS'),
(5,1602435600000,'CIN','BAL'),
(5,1602435600000,'LV','KC'),
(5,1602446700000,'MIA','SF'),
(5,1602447900000,'IND','CLE'),
(5,1602447900000,'NYG','DAL'),
(5,1602462000000,'MIN','SEA'),
(5,1602548100000,'LAC','NO');

-- 2020 week 6
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(6,1602807600000,'KC','BUF'),
(6,1603040400000,'CIN','IND'),
(6,1603040400000,'HOU','TEN'),
(6,1603040400000,'ATL','MIN'),
(6,1603040400000,'WAS','NYG'),
(6,1603040400000,'DET','JAX'),
(6,1603040400000,'CHI','CAR'),
(6,1603040400000,'BAL','PHI'),
(6,1603040400000,'CLE','PIT'),
(6,1603051500000,'MIA','DEN'),
(6,1603051500000,'NYJ','LAC'),
(6,1603052700000,'GB','TB'),
(6,1603066800000,'LAR','SF'),
(6,1603152900000,'ARI','DAL');

-- Steelers/Titans postponed game
SELECT * FROM `games` WHERE `away_team` = 'PIT' AND `home_team` = 'TEN' AND `season` = 2020; -- select the game
UPDATE `pickem_app`.`games` SET `week` = 0 WHERE (`id` = '13c096bf-fc26-11ea-b134-06a4a2a4eb91');
UPDATE `pickem_app`.`games` SET `game_at` = '1609401600000' WHERE (`id` = '13c096bf-fc26-11ea-b134-06a4a2a4eb91');
UPDATE `pickem_app`.`games` SET `game_at` = '1603645200000', `week` = '7' WHERE (`id` = '13c096bf-fc26-11ea-b134-06a4a2a4eb91'); -- move PIT/TEN to week 7 with new time

-- Pats/Cheifs postponed game
SELECT * FROM `games` WHERE `away_team` = 'NE' AND `home_team` = 'KC' AND `season` = 2020; -- select the game
UPDATE `pickem_app`.`games` SET `game_at` = '1601939100000' WHERE (`id` = '13c098eb-fc26-11ea-b134-06a4a2a4eb91'); -- change game date and time
-- move time of falc pack game
SELECT * FROM `games` WHERE `away_team` = 'ATL' AND `home_team` = 'GB' AND `season` = 2020; -- select the game
UPDATE `pickem_app`.`games` SET `game_at` = '1601945400000' WHERE (`id` = '13c099f9-fc26-11ea-b134-06a4a2a4eb91'); -- change game time

-- week 5 moves
SELECT * FROM `games` WHERE `away_team` = 'DEN' AND `home_team` = 'NE' AND `season` = 2020; -- select the game
UPDATE `pickem_app`.`games` SET `game_at` = '1602536400000' WHERE (`id` = 'fae87b89-02ae-11eb-b134-06a4a2a4eb91'); -- change it
SELECT * FROM `games` WHERE `away_team` = 'BUF' AND `home_team` = 'TEN' AND `season` = 2020; -- select the game
UPDATE `pickem_app`.`games` SET `game_at` = '1602630000000' WHERE (`id` = 'fae87c07-02ae-11eb-b134-06a4a2a4eb91'); -- change it
SELECT * FROM `games` WHERE `away_team` = 'DEN' AND `home_team` = 'NE' AND `season` = 2020; -- select the game
UPDATE `pickem_app`.`games` SET `game_at` = '1609401600000', `week` = '18' WHERE (`id` = 'fae87b89-02ae-11eb-b134-06a4a2a4eb91'); -- set to temp date and week

-- week 6 moves
SELECT * FROM `games` WHERE `away_team` = 'MIA' AND `home_team` = 'DEN' AND `season` = 2020; -- select the game
SELECT * FROM `games` WHERE `away_team` = 'KC' AND `home_team` = 'BUF' AND `season` = 2020; -- select the game
SELECT * FROM `games` WHERE `away_team` = 'DEN' AND `home_team` = 'NE' AND `season` = 2020; -- select the game
SELECT * FROM `games` WHERE `away_team` = 'NYJ' AND `home_team` = 'MIA' AND `season` = 2020; -- select the game
-- INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603051500000', '6', '2020', 'NYJ', 'MIA');
SELECT * FROM `games` WHERE `away_team` = 'MIA' AND `home_team` = 'DEN' AND `season` = 2020; -- select the game
SELECT * FROM `games` WHERE `away_team` = 'NYJ' AND `home_team` = 'LAC' AND `season` = 2020; -- select the game

-- week 7
select * from games where week = 7;
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603412400000', '7', '2020', 'NYG', 'PHI');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603645200000', '7', '2020', 'CAR', 'NO');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603645200000', '7', '2020', 'BUF', 'NYJ');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603645200000', '7', '2020', 'CLE', 'CIN');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603645200000', '7', '2020', 'DAL', 'WSH');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603645200000', '7', '2020', 'GB', 'HOU');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603645200000', '7', '2020', 'DET', 'ATL');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603656300000', '7', '2020', 'SEA', 'ARI');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603657500000', '7', '2020', 'KC', 'DEN');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603657500000', '7', '2020', 'JAX', 'LAC');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603657500000', '7', '2020', 'SF', 'NE');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603671600000', '7', '2020', 'TB', 'LV');
INSERT INTO `pickem_app`.`games` (`game_at`, `week`, `season`, `away_team`, `home_team`) VALUES ('1603757700000', '7', '2020', 'CHI', 'LAR');

-- week 7 moves
SELECT * FROM `games` WHERE ((`away_team` = 'TB' AND `home_team` = 'LV') OR (`away_team` = 'SEA' AND `home_team` = 'ARI')) AND `season` = 2020; -- select the games
UPDATE `pickem_app`.`games` SET `game_at` = '1603656300000' WHERE (`id` = '1b927165-0e69-11eb-b134-06a4a2a4eb91'); -- flexed game
UPDATE `pickem_app`.`games` SET `game_at` = '1603671600000' WHERE (`id` = '1b754fa2-0e69-11eb-b134-06a4a2a4eb91'); -- flexed game

-- 2020 week 8
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(8,1604017200000,'ATL','CAR'),
(8,1604250000000,'LV','CLE'),
(8,1604250000000,'TEN','CIN'),
(8,1604250000000,'LAR','MIA'),
(8,1604250000000,'MIN','GB'),
(8,1604250000000,'NE','BUF'),
(8,1604250000000,'NYJ','KC'),
(8,1604250000000,'IND','DET'),
(8,1604262300000,'SF','SEA'),
(8,1604262300000,'NO','CHI'),
(8,1604276400000,'DAL','PHI'),
(8,1604250000000,'PIT','BAL'),
(8,1604261100000,'LAC','DEN'),
(8,1604362500000,'TB','NYG');

-- add an hour for standard time for games on or after Nov 1
UPDATE `pickem_app`.`games` SET `game_at` = `game_at` + 3600000 WHERE (`game_at` > 1604214000000);

-- 2020 week 9
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(9,1604625600000,'GB','SF'),
(9,1604858400000,'HOU','JAX'),
(9,1604858400000,'NYG','WSH'),
(9,1604858400000,'CHI','TEN'),
(9,1604858400000,'SEA','BUF'),
(9,1604858400000,'DET','MIN'),
(9,1604858400000,'CAR','KC'),
(9,1604858400000,'BAL','IND'),
(9,1604858400000,'DEN','ATL'),
(9,1604869500000,'LV','LAC'),
(9,1604870700000,'PIT','DAL'),
(9,1604870700000,'MIA','ARI'),
(9,1604884800000,'NO','TB'),
(9,1604970900000,'NE','NYJ');

-- future games
SELECT
    id,`game_at`,FROM_UNIXTIME(`game_at`/1000-25200, '%Y-%m-%d %H:%i') as `game_at_formatted`,`season`,`week`,`away_team`,`home_team`
FROM `games` WHERE `game_at` > (UNIX_TIMESTAMP() * 1000) order by `game_at` asc; -- select future games

-- 2020 week 10
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(10,1605230400000,'IND','TEN'),
(10,1605474300000,'LAC','MIA'),
(10,1605463200000,'TB','CAR'),
(10,1605463200000,'HOU','CLE'),
(10,1605463200000,'JAX','GB'),
(10,1605475500000,'CIN','PIT'),
(10,1605463200000,'PHI','NYG'),
(10,1605463200000,'WAS','DET'),
(10,1605474300000,'BUF','ARI'),
(10,1605474300000,'DEN','LV'),
(10,1605475500000,'SF','NO'),
(10,1605475500000,'SEA','LAR'),
(10,1605489600000,'BAL','NE'),
(10,1605575700000,'MIN','CHI');

-- 2020 week 11-12
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(11,1605835200000,'ARI','SEA'),
(11,1606079100000,'MIA','DEN'),
(11,1606079100000,'NYJ','LAC'),
(11,1606068000000,'DET','CAR'),
(11,1606080300000,'GB','IND'),
(11,1606068000000,'NE','HOU'),
(11,1606068000000,'ATL','NO'),
(11,1606068000000,'PHI','CLE'),
(11,1606068000000,'PIT','JAX'),
(11,1606068000000,'TEN','BAL'),
(11,1606068000000,'CIN','WAS'),
(11,1606080300000,'DAL','MIN'),
(11,1606094400000,'KC','LV'),
(11,1606180500000,'LAR','TB'),
(12,1606411800000,'HOU','DET'),
(12,1606426200000,'WAS','DAL'),
(12,1606440000000,'BAL','PIT'),
(12,1606672800000,'LV','ATL'),
(12,1606672800000,'NYG','CIN'),
(12,1606672800000,'ARI','NE'),
(12,1606672800000,'MIA','NYJ'),
(12,1606672800000,'TEN','IND'),
(12,1606672800000,'CLE','JAX'),
(12,1606672800000,'LAC','BUF'),
(12,1606672800000,'CAR','MIN'),
(12,1606683900000,'SF','LAR'),
(12,1606683900000,'NO','DEN'),
(12,1606685100000,'KC','TB'),
(12,1606699200000,'CHI','GB'),
(12,1606785300000,'SEA','PHI');

-- fixing week 11
SELECT * FROM `games` WHERE `week` = 11 AND (`home_team` = 'DEN' or `home_team` = 'LAC');
DELETE FROM `pickem_app`.`games` WHERE (`id` = 'f0f6cb39-293f-11eb-b134-06a4a2a4eb91');
DELETE FROM `pickem_app`.`games` WHERE (`id` = 'f0f6cdac-293f-11eb-b134-06a4a2a4eb91');
UPDATE `pickem_app`.`games` SET `game_at` = '1606079100000' WHERE (`id` = '54c63f8a-08e1-11eb-b134-06a4a2a4eb91');
UPDATE `pickem_app`.`games` SET `game_at` = '1606079100000' WHERE (`id` = '54c6402c-08e1-11eb-b134-06a4a2a4eb91');

-- Thanksgiving game change
SELECT * FROM `games` WHERE `week` = 12 AND (`away_team` = 'BAL' AND `home_team` = 'PIT');
UPDATE `pickem_app`.`games` SET `game_at` = '1606673700000' WHERE (`id` = 'f0f718d6-293f-11eb-b134-06a4a2a4eb91');
UPDATE `pickem_app`.`games` SET `game_at` = '1606870800000' WHERE (`id` = 'f0f718d6-293f-11eb-b134-06a4a2a4eb91');
UPDATE `pickem_app`.`games` SET `game_at` = '1606941600000' WHERE (`id` = 'f0f718d6-293f-11eb-b134-06a4a2a4eb91');

-- 2020 week 13
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(13,1607277600000,'CIN','MIA'),
(13,1607277600000,'DET','CHI'),
(13,1607277600000,'IND','HOU'),
(13,1607277600000,'LV','NYJ'),
(13,1607277600000,'NO','ATL'),
(13,1607277600000,'JAX','MIN'),
(13,1607277600000,'CLE','TEN'),
(13,1607277600000,'WAS','PIT'),
(13,1607288700000,'LAR','ARI'),
(13,1607288700000,'NYG','SEA'),
(13,1607289900000,'NE','LAC'),
(13,1607289900000,'PHI','GB'),
(13,1607304000000,'DEN','KC'),
(13,1607378400000,'DAL','BAL'),
(13,1607390100000,'BUF','SF');

-- week 13 changes
SELECT * FROM `games` WHERE `week` = 13 AND (`away_team` = 'WAS' AND `home_team` = 'PIT');
UPDATE `pickem_app`.`games` SET `game_at` = '1607378400000' WHERE (`id` = 'e808f83e-3355-11eb-b134-06a4a2a4eb91');
SELECT * FROM `games` WHERE `week` = 13 AND (`away_team` = 'DAL' AND `home_team` = 'BAL');
UPDATE `pickem_app`.`games` SET `game_at` = '1607475900000' WHERE (`id` = 'e80940cb-3355-11eb-b134-06a4a2a4eb91');

-- 2020 week 14
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(14,1607277600000,'CIN','MIA'),
(14,1607277600000,'DET','CHI'),
(14,1607277600000,'IND','HOU'),
(14,1607277600000,'LV','NYJ'),
(14,1607277600000,'NO','ATL'),
(14,1607277600000,'JAX','MIN'),
(14,1607277600000,'CLE','TEN'),
(14,1607277600000,'WAS','PIT'),
(14,1607288700000,'LAR','ARI'),
(14,1607288700000,'NYG','SEA'),
(14,1607289900000,'NE','LAC'),
(14,1607289900000,'PHI','GB'),
(14,1607304000000,'DEN','KC'),
(14,1607378400000,'DAL','BAL'),
(14,1607390100000,'BUF','SF');

-- 2020 week 15
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(15,1608254400000,'LAC','LV'),
(15,1608413400000,'BUF','DEN'),
(15,1608426900000,'CAR','GB'),
(15,1608487200000,'HOU','IND'),
(15,1608487200000,'DET','TEN'),
(15,1608487200000,'CHI','MIN'),
(15,1608487200000,'SEA','WAS'),
(15,1608487200000,'NE','MIA'),
(15,1608487200000,'JAX','BAL'),
(15,1608487200000,'TB','ATL'),
(15,1608487200000,'SF','DAL'),
(15,1608498300000,'PHI','ARI'),
(15,1608498300000,'NYJ','LAR'),
(15,1608499500000,'KC','NO'),
(15,1608513600000,'CLE','NYG'),
(15,1608599700000,'PIT','CIN');

-- 2020 week 16
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(16,1608931800000,'MIN','NO'),
(16,1609031700000,'MIA','LV'),
(16,1609005600000,'TB','DET'),
(16,1609018200000,'SF','ARI'),
(16,1609092000000,'CLE','NYJ'),
(16,1609103100000,'DEN','LAC'),
(16,1609092000000,'IND','PIT'),
(16,1609092000000,'CAR','WAS'),
(16,1609092000000,'CIN','HOU'),
(16,1609092000000,'CHI','JAX'),
(16,1609092000000,'ATL','KC'),
(16,1609092000000,'NYG','BAL'),
(16,1609104300000,'LAR','SEA'),
(16,1609104300000,'PHI','DAL'),
(16,1609118400000,'TEN','GB'),
(16,1609204500000,'BUF','NE');

-- 2020 week 17
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(17,1609696800000,'MIA','BUF'),
(17,1609696800000,'MIN','DET'),
(17,1609709100000,'NO','CAR'),
(17,1609709100000,'TEN','HOU'),
(17,1609696800000,'NYJ','NE'),
(17,1609696800000,'BAL','CIN'),
(17,1609696800000,'ATL','TB'),
(17,1609709100000,'GB','CHI'),
(17,1609696800000,'DAL','NYG'),
(17,1609723200000,'WAS','PHI'),
(17,1609709100000,'JAX','IND'),
(17,1609709100000,'LAC','KC'),
(17,1609696800000,'PIT','CLE'),
(17,1609709100000,'ARI','LAR'),
(17,1609709100000,'SEA','SF'),
(17,1609709100000,'LV','DEN');

-- 2020 WC round
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(18,1610215500000,'IND','BUF'),
(18,1610228400000,'LAR','SEA'),
(18,1610241300000,'TB','WAS'),
(18,1610301900000,'BAL','TEN'),
(18,1610314800000,'CHI','NO'),
(18,1610327700000,'CLE','PIT');


-- 2020 DV round
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(19,1610832900000,'LAR','GB'),
(19,1610846100000,'BAL','BUF'),
(19,1610913900000,'CLE','KC'),
(19,1610926800000,'TB','NO');

INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(19,1610926800000,'TB','NO');


-- 2020 conf championships
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(20,1611518700000,'TB','GB'),
(20,1611531600000,'BUF','KC');

SELECT * FROM `games` WHERE `week` = 20;

-- 2020 superbowl
USE `pickem_app`;
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(21,1612744200000,'KC','TB');

-- add value
ALTER TABLE `games`
ADD COLUMN `value` TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER `season`;

-- 2021 week 2
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(2,1631838000000,'NYG','WAS'),
(2,1632070800000,'LV','PIT'),
(2,1632070800000,'SF','PHI'),
(2,1632070800000,'HOU','CLE'),
(2,1632070800000,'DEN','JAX'),
(2,1632070800000,'NO','CAR'),
(2,1632070800000,'LAR','IND'),
(2,1632070800000,'BUF','MIA'),
(2,1632070800000,'NE','NYJ'),
(2,1632070800000,'CIN','CHI'),
(2,1632081900000,'ATL','TB'),
(2,1632081900000,'MIN','ARI'),
(2,1632083100000,'TEN','SEA'),
(2,1632083100000,'DAL','LAC'),
(2,1632097200000,'KC','BAL'),
(2,1632183300000,'DET','GB');

SELECT * FROM `games` WHERE `week` = 2 AND `season` = 2021;

-- 2021 week 4
INSERT INTO `games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(4,1633047600000,'JAX','CIN'),
(4,1633280400000,'TEN','NYJ'),
(4,1633280400000,'KC','PHI'),
(4,1633280400000,'CAR','DAL'),
(4,1633280400000,'NYG','NO'),
(4,1633280400000,'CLE','MIN'),
(4,1633280400000,'DET','CHI'),
(4,1633280400000,'HOU','BUF'),
(4,1633280400000,'IND','MIA'),
(4,1633280400000,'WSH','ATL'),
(4,1633291500000,'SEA','SF'),
(4,1633291500000,'ARI','LAR'),
(4,1633292700000,'PIT','GB'),
(4,1633292700000,'BAL','DEN'),
(4,1633306800000,'TB','NE'),
(4,1633392900000,'LV','LAC');

SELECT * FROM `games` WHERE `week` = 4 AND `season` = 2021;

-- 2021 week 5+
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(5,1633652400000,'LAR','SEA'),
(5,1633872600000,'NYJ','ATL'),
(5,1633885200000,'NE','HOU'),
(5,1633885200000,'DET','MIN'),
(5,1633885200000,'PHI','CAR'),
(5,1633885200000,'NO','WAS'),
(5,1633885200000,'TEN','JAX'),
(5,1633885200000,'MIA','TB'),
(5,1633885200000,'GB','CIN'),
(5,1633885200000,'DEN','PIT'),
(5,1633896300000,'CHI','LV'),
(5,1633896300000,'CLE','LAC'),
(5,1633897500000,'NYG','DAL'),
(5,1633897500000,'SF','ARI'),
(5,1633911600000,'BUF','KC'),
(5,1633997700000,'IND','BAL'),
(6,1634257200000,'TB','PHI');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 5 AND `season` = 2021;

-- 2021 week 6 not including thu
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(6,1634477400000,'MIA','JAX'),
(6,1634490000000,'MIN','CAR'),
(6,1634490000000,'LAC','BAL'),
(6,1634490000000,'LAR','NYG'),
(6,1634490000000,'HOU','IND'),
(6,1634490000000,'KC','WAS'),
(6,1634490000000,'GB','CHI'),
(6,1634490000000,'CIN','DET'),
(6,1634501100000,'ARI','CLE'),
(6,1634502300000,'DAL','NE'),
(6,1634502300000,'LV','DEN'),
(6,1634516400000,'SEA','PIT'),
(6,1634602500000,'BUF','TEN');

-- 2021 week 7
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(7,1634862000000,'DEN','CLE'),
(7,1635094800000,'KC','TEN'),
(7,1635094800000,'WAS','GB'),
(7,1635094800000,'CIN','BAL'),
(7,1635094800000,'CAR','NYG'),
(7,1635094800000,'ATL','MIA'),
(7,1635094800000,'NYJ','NE'),
(7,1635105900000,'PHI','LV'),
(7,1635105900000,'DET','LAR'),
(7,1635107100000,'CHI','TB'),
(7,1635107100000,'HOU','ARI'),
(7,1635121200000,'IND','SF'),
(7,1635207300000,'NO','SEA');

-- 2021 week 8
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(8,1635466800000,'GB','ARI'),
(8,1635699600000,'CAR','ATL'),
(8,1635699600000,'TEN','IND'),
(8,1635699600000,'MIA','BUF'),
(8,1635699600000,'CIN','NYJ'),
(8,1635699600000,'PIT','CLE'),
(8,1635699600000,'PHI','DET'),
(8,1635699600000,'LAR','HOU'),
(8,1635699600000,'SF','CHI'),
(8,1635710700000,'NE','LAC'),
(8,1635710700000,'JAX','SEA'),
(8,1635711900000,'TB','NO'),
(8,1635711900000,'WAS','DEN'),
(8,1635726000000,'DAL','MIN'),
(8,1635812100000,'NYG','KC');

-- 2021 week 9
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(9,1636071600000,'NYJ','IND'),
(9,1636308000000,'LV','NYG'),
(9,1636308000000,'ATL','NO'),
(9,1636308000000,'BUF','JAX'),
(9,1636308000000,'CLE','CIN'),
(9,1636308000000,'NE','CAR'),
(9,1636308000000,'DEN','DAL'),
(9,1636308000000,'MIN','BAL'),
(9,1636308000000,'HOU','MIA'),
(9,1636319100000,'LAC','PHI'),
(9,1636320300000,'GB','KC'),
(9,1636320300000,'ARI','SF'),
(9,1636334400000,'TEN','LAR'),
(9,1636420500000,'CHI','PIT');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 9 AND `season` = 2021;

-- 2021 week 10
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(10,1636680000000,'BAL','MIA'),
(10,1636912800000,'NO','TEN'),
(10,1636912800000,'BUF','NYJ'),
(10,1636912800000,'DET','PIT'),
(10,1636912800000,'JAX','IND'),
(10,1636912800000,'TB','WAS'),
(10,1636912800000,'CLE','NE'),
(10,1636912800000,'ATL','DAL'),
(10,1636923900000,'CAR','ARI'),
(10,1636923900000,'MIN','LAC'),
(10,1636925100000,'SEA','GB'),
(10,1636925100000,'PHI','DEN'),
(10,1636939200000,'KC','LV'),
(10,1637025300000,'LAR','SF');

-- 2021 week 11
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(11,1637284800000,'NE','ATL'),
(11,1637517600000,'BAL','CHI'),
(11,1637517600000,'GB','MIN'),
(11,1637517600000,'IND','BUF'),
(11,1637517600000,'DET','CLE'),
(11,1637517600000,'WAS','CAR'),
(11,1637517600000,'HOU','TEN'),
(11,1637517600000,'SF','JAX'),
(11,1637517600000,'MIA','NYJ'),
(11,1637517600000,'NO','PHI'),
(11,1637528700000,'CIN','LV'),
(11,1637529900000,'DAL','KC'),
(11,1637529900000,'ARI','SEA'),
(11,1637544000000,'PIT','LAC'),
(11,1637630100000,'NYG','TB');

-- 2021 week 12
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(12,1637861400000,'CHI','DET'),
(12,1637875800000,'LV','DAL'),
(12,1637889600000,'BUF','NO'),
(12,1638122400000,'PIT','CIN'),
(12,1638122400000,'CAR','MIA'),
(12,1638122400000,'PHI','NYG'),
(12,1638122400000,'TEN','NE'),
(12,1638122400000,'ATL','JAX'),
(12,1638122400000,'TB','IND'),
(12,1638122400000,'NYJ','HOU'),
(12,1638133500000,'LAC','DEN'),
(12,1638134700000,'MIN','SF'),
(12,1638134700000,'LAR','GB'),
(12,1638148800000,'CLE','BAL'),
(12,1638234900000,'SEA','WAS');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 12 AND `season` = 2021;

-- 2021 week 13
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(13,1638494400000,'DAL','NO'),
(13,1638727200000,'IND','HOU'),
(13,1638727200000,'MIN','DET'),
(13,1638727200000,'NYG','MIA'),
(13,1638727200000,'TB','ATL'),
(13,1638727200000,'PHI','NYJ'),
(13,1638727200000,'ARI','CHI'),
(13,1638727200000,'SD','CIN'),
(13,1638738300000,'JAX','LAR'),
(13,1638738300000,'WAS','LV'),
(13,1638739500000,'BAL','PIT'),
(13,1638739500000,'SF','SEA'),
(13,1638753600000,'DEN','KC'),
(13,1638839700000,'NE','BUF');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 13 AND `season` = 2021;

-- 2021 week 14
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(14,1639099200000,'PIT','MIN'),
(14,1639332000000,'NO','NYJ'),
(14,1639332000000,'ATL','CAR'),
(14,1639332000000,'SEA','HOU'),
(14,1639332000000,'LV','KC'),
(14,1639332000000,'BAL','CLE'),
(14,1639332000000,'DAL','WAS'),
(14,1639332000000,'JAX','TEN'),
(14,1639343100000,'NYG','LAC'),
(14,1639343100000,'DET','DEN'),
(14,1639344300000,'SF','CIN'),
(14,1639344300000,'BUF','TB'),
(14,1639358400000,'CHI','GB'),
(14,1639444500000,'LAR','ARI');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 13 AND `season` = 2021;

-- 2021 week 15
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(15,1639704000000,'KC','LAC'),
(15,1639863000000,'LV','CLE'),
(15,1639876800000,'NE','IND'),
(15,1639936800000,'TEN','PIT'),
(15,1639936800000,'CAR','BUF'),
(15,1639936800000,'WAS','PHI'),
(15,1639936800000,'HOU','JAX'),
(15,1639936800000,'DAL','NYG'),
(15,1639936800000,'ARI','DET'),
(15,1639936800000,'NYJ','MIA'),
(15,1639947900000,'CIN','DEN'),
(15,1639947900000,'ATL','SF'),
(15,1639949100000,'SEA','LAR'),
(15,1639949100000,'GB','BAL'),
(15,1639963200000,'NO','TB'),
(15,1640049300000,'MIN','CHI');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 15 AND `season` = 2021;

-- 2021 week 16
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(16,1640308800000,'SF','TEN'),
(16,1640467800000,'CLE','GB'),
(16,1640481300000,'IND','ARI'),
(16,1640541600000,'DET','ATL'),
(16,1640541600000,'LAR','MIN'),
(16,1640541600000,'JAX','NYJ'),
(16,1640541600000,'NYG','PHI'),
(16,1640541600000,'BUF','NE'),
(16,1640541600000,'BAL','CIN'),
(16,1640541600000,'LAC','HOU'),
(16,1640541600000,'TB','CAR'),
(16,1640552700000,'CHI','SEA'),
(16,1640553900000,'DEN','LV'),
(16,1640553900000,'PIT','KC'),
(16,1640568000000,'WAS','DAL'),
(16,1640654100000,'MIA','NO');

-- 2021 WC weekend
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(19,1642282200000,'LV','CIN',2),
(19,1642295700000,'NE','BUF',2),
(19,1642356000000,'PHI','TB',2),
(19,1642368600000,'SF','DAL',2),
(19,1642382100000,'PIT','KC',2),
(19,1642468500000,'ARI','LAR',2);

-- 2021 divisional round
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(20,1642887000000,'CIN','TEN',4),
(20,1642900500000,'SF','GB',4),
(20,1642968000000,'LAR','TB',4),
(20,1642980600000,'BUF','KC',4);

-- 2021 conference championships
INSERT INTO `pickem_app`.`games` (
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(21,1643572800000,'CIN','KC',8),
(21,1643585400000,'SF','LAR',8);

-- 2022 week 1
INSERT INTO `pickem_app`.`games` (
	`season`,
    `week`,
    `game_at`,
    `away_team`,
    `home_team`
)
VALUES
(2022,1,1662682800000,'BUF','LAR'),
(2022,1,1662915600000,'PHI','DET'),
(2022,1,1662915600000,'SF','CHI'),
(2022,1,1662915600000,'PIT','CIN'),
(2022,1,1662915600000,'NE','MIA'),
(2022,1,1662915600000,'CLE','CAR'),
(2022,1,1662915600000,'IND','HOU'),
(2022,1,1662915600000,'PHI','DET'),
(2022,1,1662915600000,'NO','ATL'),
(2022,1,1662915600000,'BAL','NYJ'),
(2022,1,1662915600000,'JAX','WAS'),
(2022,1,1662927900000,'GB','MIN'),
(2022,1,1662927900000,'MYG','TEN'),
(2022,1,1662927900000,'LV','LAC'),
(2022,1,1662927900000,'KC','ARI'),
(2022,1,1662942000000,'TB','DAL'),
(2022,1,1663028100000,'DEN','SEA');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 1 AND `season` = 2022;

SELECT * FROM `pickem_app`.`games` WHERE `week` = 4 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 12 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 7 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 9 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 12 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 13 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 14 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 15 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 16 AND `season` = 2022;
SELECT * FROM `pickem_app`.`games` WHERE `week` = 18 AND `season` = 2022;

-- 2022 WC weekend
INSERT INTO `pickem_app`.`games` (
	`season`,
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(2022,19,1673731800000,'SEA','SF',2),
(2022,19,1673745300000,'LAC','JAX',2),
(2022,19,1673805600000,'MIA','BUF',2),
(2022,19,1673818200000,'NYG','MIN',2),
(2022,19,1673831700000,'BAL','CIN',2),
(2022,19,1673918100000,'DAL','TB',2);

SELECT * FROM `pickem_app`.`games` WHERE `week` = 19 AND `season` = 2022;

-- 2022 Div weekend
INSERT INTO `pickem_app`.`games` (
	`season`,
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(2022,20,1674336600000,'JAX','KC',4),
(2022,20,1674350100000,'NYG','PHI',4),
(2022,20,1674417600000,'CIN','BUF',4),
(2022,20,1674430200000,'DAL','SF',4);

-- 2022 CC weekend
INSERT INTO `pickem_app`.`games` (
	`season`,
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(2022,21,1675022400000,'SF','PHI',8),
(2022,21,1675027800000,'CIN','KC',8);

SELECT * FROM `pickem_app`.`games` WHERE `week` = 21 AND `season` = 2022;

-- 2022 Super Bowl
INSERT INTO `pickem_app`.`games` (
	`season`,
    `week`,
    `game_at`,
    `away_team`,
    `home_team`,
	`value`
)
VALUES
(2022,22,1676244600000,'KC','PHI',16);

-- 2023 week 1
INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,1,1694132400000,'DET','KC'),
(2023,1,1694365200000,'CIN','CLE'),
(2023,1,1694365200000,'HOU','BAL'),
(2023,1,1694365200000,'TB','MIN'),
(2023,1,1694365200000,'CAR','ATL'),
(2023,1,1694365200000,'ARI','WSH'),
(2023,1,1694365200000,'JAX','IND'),
(2023,1,1694365200000,'SF','PIT'),
(2023,1,1694365200000,'TEN','NO'),
(2023,1,1694377500000,'LV','DEN'),
(2023,1,1694377500000,'PHI','NE'),
(2023,1,1694377500000,'LAR','SEA'),
(2023,1,1694377500000,'MIA','LAC'),
(2023,1,1694377500000,'GB','CHI'),
(2023,1,1694391600000,'DAL','NYG'),
(2023,1,1694477700000,'BUF','NYJ');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 1 AND `season` = 2023;

-- 2023 week 2
INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,2,1694736900000,'MIN','PHI'),
(2023,2,1694970000000,'BAL','CIN'),
(2023,2,1694970000000,'SEA','DET'),
(2023,2,1694970000000,'IND','HOU'),
(2023,2,1694970000000,'CHI','TB'),
(2023,2,1694970000000,'KC','JAX'),
(2023,2,1694970000000,'GB','ATL'),
(2023,2,1694970000000,'LV','BUF'),
(2023,2,1694970000000,'LAC','TEN'),
(2023,2,1694981100000,'SF','LAR'),
(2023,2,1694981100000,'NYG','ARI'),
(2023,2,1694982300000,'NYJ','DAL'),
(2023,2,1694982300000,'WSH','DEN'),
(2023,2,1694996400000,'MIA','NE'),
(2023,2,1695078900000,'NO','CAR'),
(2023,2,1695082500000,'CLE','PIT');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 2 AND `season` = 2023;

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,3,1695341700000,'NYG','SF'),
(2023,3,1695574800000,'ATL','DET'),
(2023,3,1695574800000,'LAC','MIN'),
(2023,3,1695574800000,'NO','GB'),
(2023,3,1695574800000,'HOU','JAX'),
(2023,3,1695574800000,'DEN','MIA'),
(2023,3,1695574800000,'TEN','CLE'),
(2023,3,1695574800000,'BUF','WAS'),
(2023,3,1695574800000,'IND','BAL'),
(2023,3,1695574800000,'NE','NYJ'),
(2023,3,1695585900000,'CAR','SEA'),
(2023,3,1695587100000,'CHI','KC'),
(2023,3,1695587100000,'DAL','ARI'),
(2023,3,1695601200000,'PIT','LV'),
(2023,3,1695683700000,'PHI','TB'),
(2023,3,1695687300000,'LAR','CIN');


-- week 4

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,4,1695946500000,'DET','GB'),
(2023,4,1696167000000,'ATL','JAX'),
(2023,4,1696179600000,'LAR','IND'),
(2023,4,1696179600000,'BAL','CLE'),
(2023,4,1696179600000,'MIN','CAR'),
(2023,4,1696179600000,'CIN','TEN'),
(2023,4,1696179600000,'TB','NO'),
(2023,4,1696179600000,'MIA','BUF'),
(2023,4,1696179600000,'DEN','CHI'),
(2023,4,1696179600000,'WAS','PHI'),
(2023,4,1696179600000,'PIT','HOU'),
(2023,4,1696190700000,'LV','LAC'),
(2023,4,1696191900000,'ARI','SF'),
(2023,4,1696191900000,'NE','DAL'),
(2023,4,1696206000000,'KC','NYJ'),
(2023,4,1696292100000,'SEA','NYG');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 4 AND `season` = 2023;

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,5,1696551300000,'CHI','WAS'),
(2023,5,1696771800000,'JAX','BUF'),
(2023,5,1696784400000,'NO','NE'),
(2023,5,1696784400000,'TEN','IND'),
(2023,5,1696784400000,'BAL','PIT'),
(2023,5,1696784400000,'CAR','DET'),
(2023,5,1696784400000,'HOU','ATL'),
(2023,5,1696784400000,'NYG','MIA'),
(2023,5,1696795500000,'CIN','ARI'),
(2023,5,1696795500000,'PHI','LAR'),
(2023,5,1696796700000,'NYJ','DEN'),
(2023,5,1696796700000,'KC','MIN'),
(2023,5,1696810800000,'DAL','SF'),
(2023,5,1696896900000,'GB','LV');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,6,1697156100000,'DEN','KC'),
(2023,6,1697376600000,'BAL','TEN'),
(2023,6,1697389200000,'CAR','MIA'),
(2023,6,1697389200000,'NO','HOU'),
(2023,6,1697389200000,'WAS','ATL'),
(2023,6,1697389200000,'IND','JAX'),
(2023,6,1697389200000,'SEA','CIN'),
(2023,6,1697389200000,'MIN','CHI'),
(2023,6,1697389200000,'SF','CLE'),
(2023,6,1697400300000,'NE','LV'),
(2023,6,1697401500000,'DET','TB'),
(2023,6,1697401500000,'ARI','LAR'),
(2023,6,1697401500000,'PHI','NYJ'),
(2023,6,1697415600000,'NYG','BUF'),
(2023,6,1697501700000,'DAL','LAC');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,7,1697760900000,'JAX','NO'),
(2023,7,1697994000000,'ATL','TB'),
(2023,7,1697994000000,'LV','CHI'),
(2023,7,1697994000000,'CLE','IND'),
(2023,7,1697994000000,'WAS','NYG'),
(2023,7,1697994000000,'DET','BAL'),
(2023,7,1697994000000,'BUF','NE'),
(2023,7,1698005100000,'ARI','SEA'),
(2023,7,1698005100000,'PIT','LAR'),
(2023,7,1698006300000,'LAC','KC'),
(2023,7,1698006300000,'GB','DEN'),
(2023,7,1698020400000,'MIA','PHI'),
(2023,7,1698106500000,'SF','MIN');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,8,1698279300000,'TB','BUF'),
(2023,8,1698598800000,'NYJ','NYG'),
(2023,8,1698598800000,'JAX','PIT'),
(2023,8,1698598800000,'PHI','WAS'),
(2023,8,1698598800000,'LAR','DAL'),
(2023,8,1698598800000,'MIN','GB'),
(2023,8,1698598800000,'ATL','TEN'),
(2023,8,1698598800000,'NE','MIA'),
(2023,8,1698598800000,'NO','IND'),
(2023,8,1698598800000,'HOU','CAR'),
(2023,8,1698609900000,'CLE','SEA'),
(2023,8,1698611100000,'CIN','SF'),
(2023,8,1698611100000,'KC','DEN'),
(2023,8,1698611100000,'BAL','ARI'),
(2023,8,1698625200000,'CHI','LAC'),
(2023,8,1698711300000,'LV','DET');

SELECT * FROM `pickem_app`.`games` WHERE `week` = 19 AND `season` = 2023;

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,9,1698970500000,'TEN','PIT'),
(2023,9,1699194600000,'MIA','KC'),
(2023,9,1699207200000,'MIN','ATL'),
(2023,9,1699207200000,'CHI','NO'),
(2023,9,1699207200000,'LAR','GB'),
(2023,9,1699207200000,'WAS','NE'),
(2023,9,1699207200000,'SEA','BAL'),
(2023,9,1699207200000,'TB','HOU'),
(2023,9,1699207200000,'ARI','CLE'),
(2023,9,1699218300000,'IND','CAR'),
(2023,9,1699219500000,'NYG','LV'),
(2023,9,1699219500000,'DAL','PHI'),
(2023,9,1699233600000,'BUF','CIN'),
(2023,9,1699319700000,'LAC','NYJ');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,10,1699578900000,'CAR','CHI'),
(2023,10,1699799400000,'IND','NE'),
(2023,10,1699812000000,'CLE','BAL'),
(2023,10,1699812000000,'GB','PIT'),
(2023,10,1699812000000,'SF','JAX'),
(2023,10,1699812000000,'NO','MIN'),
(2023,10,1699812000000,'HOU','CIN'),
(2023,10,1699812000000,'TEN','TB'),
(2023,10,1699823100000,'DET','LAC'),
(2023,10,1699823100000,'ATL','ARI'),
(2023,10,1699824300000,'NYG','DAL'),
(2023,10,1699824300000,'WAS','SEA'),
(2023,10,1699838400000,'NYJ','LV'),
(2023,10,1699924500000,'DEN','BUF');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,11,1700183700000,'CIN','BAL'),
(2023,11,1700416800000,'PIT','CLE'),
(2023,11,1700416800000,'LV','MIA'),
(2023,11,1700416800000,'CHI','DET'),
(2023,11,1700416800000,'TEN','JAX'),
(2023,11,1700416800000,'LAC','GB'),
(2023,11,1700416800000,'ARI','HOU'),
(2023,11,1700416800000,'DAL','CAR'),
(2023,11,1700416800000,'NYG','WAS'),
(2023,11,1700427900000,'TB','SF'),
(2023,11,1700429100000,'NYJ','BUF'),
(2023,11,1700429100000,'SEA','LAR'),
(2023,11,1700443200000,'MIN','DEN'),
(2023,11,1700529300000,'PHI','KC');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,14,1701998100000,'NE','PIT'),
(2023,14,1702231200000,'HOU','NYJ'),
(2023,14,1702231200000,'LAR','BAL'),
(2023,14,1702231200000,'CAR','NO'),
(2023,14,1702231200000,'IND','CIN'),
(2023,14,1702231200000,'TB','ATL'),
(2023,14,1702231200000,'JAX','CLE'),
(2023,14,1702231200000,'DET','CHI'),
(2023,14,1702242300000,'SEA','SF'),
(2023,14,1702242300000,'MIN','LV'),
(2023,14,1702243500000,'DEN','LAC'),
(2023,14,1702243500000,'BUF','KC'),
(2023,14,1702257600000,'PHI','DAL'),
(2023,14,1702343700000,'GB','NYG'),
(2023,14,1702343700000,'TEN','MIA');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,15,1702602900000,'LAC','LV'),
(2023,15,1702749600000,'MIN','CIN'),
(2023,15,1702762200000,'PIT','IND'),
(2023,15,1702775700000,'DEN','DET'),
(2023,15,1702836000000,'NYG','NO'),
(2023,15,1702836000000,'CHI','CLE'),
(2023,15,1702836000000,'ATL','CAR'),
(2023,15,1702836000000,'TB','GB'),
(2023,15,1702836000000,'NYJ','MIA'),
(2023,15,1702836000000,'KC','NE'),
(2023,15,1702836000000,'HOU','TEN'),
(2023,15,1702847100000,'SF','ARI'),
(2023,15,1702847100000,'WAS','LAR'),
(2023,15,1702848300000,'DAL','BUF'),
(2023,15,1702862400000,'BAL','JAX'),
(2023,15,1702948500000,'PHI','SEA');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,16,1703207700000,'NO','LAR'),
(2023,16,1703367000000,'CIN','PIT'),
(2023,16,1703379600000,'BUF','LAC'),
(2023,16,1703440800000,'WAS','NYJ'),
(2023,16,1703440800000,'DET','MIN'),
(2023,16,1703440800000,'CLE','HOU'),
(2023,16,1703440800000,'GB','CAR'),
(2023,16,1703440800000,'SEA','TEN'),
(2023,16,1703440800000,'IND','ATL'),
(2023,16,1703451900000,'JAX','TB'),
(2023,16,1703453100000,'DAL','MIA'),
(2023,16,1703453100000,'ARI','CHI'),
(2023,16,1703466900000,'NE','DEN'),
(2023,16,1703527200000,'LV','KC'),
(2023,16,1703539800000,'NYG','PHI'),
(2023,16,1703553300000,'BAL','SF');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,17,1703812500000,'NYJ','CLE'),
(2023,17,1703985300000,'DET','DAL'),
(2023,17,1704045600000,'TEN','HOU'),
(2023,17,1704045600000,'ATL','CHI'),
(2023,17,1704045600000,'MIA','BAL'),
(2023,17,1704045600000,'NO','TB'),
(2023,17,1704045600000,'NE','BUF'),
(2023,17,1704045600000,'ARI','PHI'),
(2023,17,1704045600000,'CAR','JAX'),
(2023,17,1704045600000,'LV','IND'),
(2023,17,1704045600000,'LAR','NYG'),
(2023,17,1704045600000,'SF','WAS'),
(2023,17,1704056700000,'PIT','SEA'),
(2023,17,1704057900000,'CIN','KC'),
(2023,17,1704057900000,'LAC','DEN'),
(2023,17,1704072000000,'GB','MIN');

INSERT INTO `pickem_app`.`games` (
   `season`,
   `week`,
   `game_at`,
   `away_team`,
   `home_team`
)
VALUES
(2023,18,1704576600000,'PIT','BAL'),
(2023,18,1704590100000,'HOU','IND'),
(2023,18,1704650400000,'JAX','TEN'),
(2023,18,1704650400000,'MIN','DET'),
(2023,18,1704650400000,'ATL','NO'),
(2023,18,1704650400000,'NYJ','NE'),
(2023,18,1704650400000,'TB','CAR'),
(2023,18,1704650400000,'CLE','CIN'),
(2023,18,1704662700000,'CHI','GB'),
(2023,18,1704662700000,'DAL','WAS'),
(2023,18,1704662700000,'DEN','LV'),
(2023,18,1704662700000,'PHI','NYG'),
(2023,18,1704662700000,'SEA','ARI'),
(2023,18,1704662700000,'LAR','SF'),
(2023,18,1704662700000,'KC','LAC'),
(2023,18,1704676800000,'BUF','MIA');

SELECT * FROM `pickem_app`.`users`;
