## Local Installation

1. Run `yarn` in the project root folder.
2. Run `cp example.env .env` in the project root folder and edit the `.env` file to have the proper values to access the database.
   1. Use escape characters `\` in this file, but don't use the escape character when adding the same environment variable to Vercel.
   2. Don't put comments in this file.
      ...

## Lint

1. Run `yarn lint`.

## Run Locally

1. Run `yarn dev`.

## Deploy

1. Push a commit or MR to the `master` branch, then push up to GitHub.

## Test a Deployment

1. Push up a commit to an MR branch.
2. Go to the MR in GitHub and there should be a link to a deployment.

## To Add Games to the Schedule

1. Open MySQL Workbench.
2. Click on My Amazon RDS.
3. Double click `pickem_app` in the left menu.
4. File > Open SQL Script: `D:\Projects\web\pickem\mysql\games.sql`.
5. Right a new sql script with the following template.
   1. Make sure to set the year and week number.
   2. Use [current millis](https://currentmillis.com/) for game date and time.

```sql
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
(2023,1,1694477700000,'BUF','NYJ'),
```

6. With the insertion point somewhere in this block, type ctrl-enter to execute the script.
7. With the app running (either locally or in production), go to that season and week and verify that the schedule is correct. If a team name is missing, you might have the wrong abbreviation. In that case:
   1. Query the weeks games using a script like so `` SELECT * FROM `pickem_app`.`games` WHERE `week` = 21 AND `season` = 2022; ``.
   2. Find the abbreviation that is incorrect and change it.
   3. Click **Apply**, then verify and click **Apply** again.
   4. Verify it looks correct in the app.

## Troubleshooting

### Cannot See the Nav Bar When Running Locally

-  You might not be logged in.
-  Try clearing the local storage from https://localhost:3000, then refresh the page.
