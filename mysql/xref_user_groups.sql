CREATE TABLE `xref_user_groups`(
    `user_id` CHAR(36) NOT NULL, -- foreign key
    `group_id` CHAR(36) NOT NULL, -- foreign key
	`created_at` BIGINT SIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
    `team_name` VARCHAR(32), -- name of the user's team for this group
    PRIMARY KEY (`user_id`, `group_id`),
    CONSTRAINT `fk_user_groups_user_id`
		FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_user_groups_group_id`
		FOREIGN KEY (`group_id`)
        REFERENCES `groups`(`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
-- DROP TABLE `xref_user_groups`;

SELECT * FROM `xref_user_groups`;

INSERT INTO `xref_user_groups` (
    `user_id`,
    `group_id`
)
VALUES
('6892716e-b129-420a-bd46-57f2239eea53','3fd8d78c-8151-4145-b276-aea3559deb76'),
('84cbd806-1a5d-4b2c-beed-3b7b7ca686bc','3fd8d78c-8151-4145-b276-aea3559deb76'),
('8cb742cb-d04c-4714-b11a-a4ca54d7fd30','3fd8d78c-8151-4145-b276-aea3559deb76'),
('ba1c83b1-9899-42e0-97f3-561f0643153a','3fd8d78c-8151-4145-b276-aea3559deb76');

-- add colums 9/7/2020
ALTER TABLE `xref_user_groups`
ADD COLUMN `team_name` VARCHAR(32) AFTER `created_at`;