use `pickem_app`;

CREATE TABLE `users`(
	`id` CHAR(36) PRIMARY KEY DEFAULT (UUID()), /* fixed length of string uuid */
    `user_name` VARCHAR(32) NOT NULL,
    `initials` VARCHAR(3) NOT NULL,
    `password` VARCHAR(128) NOT NULL DEFAULT ('$2b$12$VEde/skts3gLAGYo0ZqGmeh0d12oCT6QDpAfwGtNH9QH8ZZS9kiyC'), -- george lucas password
    `created_at` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
    `last_login_at` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000)
);
-- DROP TABLE `users`;

INSERT INTO `users` (
	`id`,
    `user_name`
)
VALUES ('84cbd806-1a5d-4b2c-beed-3b7b7ca686bc','Pfhortier'),('71c89a20-4102-4427-8ed3-b7808a7b968d','ElBerserko'),('5c17b595-9f69-41bf-a45c-323572ad9ca3','BuddyBomar');

SELECT * FROM `users` ORDER BY `created_at` DESC;

ALTER TABLE `users`
ADD COLUMN `initials` VARCHAR(3) NOT NULL AFTER `user_name`;

-- add colums 9/7/2020
ALTER TABLE `users`
ADD COLUMN `team_name` VARCHAR(32) NOT NULL DEFAULT '' AFTER `initials`;