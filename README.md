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
2. Open this [link](http://localhost:3000/) in a browser if it doesn't open automatically.

## Deploy

1. Push a commit directly to the `master` branch, then push up to GitHub, or merge an MR to master in GitHub.

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

### When running `yarn dev`: Error: error:0308010C:digital envelope routines::unsupported

This started happening during 2023 season. I couldn't run the app locally, but my changes worked when deployed.

Following [this](https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported).

-  ran `npm update`, didn't help
-  then ran `npm audit fix --force`
   -  Now when running `yarn dev` I get: Error: Next.js requires react >= 18.2.0 to be installed.
-  Edited `package.json` to have `"react": "18.2.0",`, then ran `yarn`.
-  Different problems when running now. Happens when I try to load the page in a browser.
   -  Can't find module `react-dom/client`.
   -  Error: ENOENT: no such file or directory, open 'D:\Projects\web\pickem\.next\fallback-build-manifest.json'
   -  Ran `yarn add react-dom`.
-  App seems like it works now, except some margins/padding is messed up.
   -  Some classes like `card-header` and `card-body` come from a library that now seems to now be working after upgrading other stuff in the project.
   -  Some changes when comparing my local app to currently deployed app:
      -  My Picks (and all pages with cards)
         -  Card formatting looks different.
      -  Group Picks
         -  slightly different rounding on the top corners of header
         -  Title text different color (e.g. Sun 02/11). Actually, I think this is more correct.
         -  Accordion border colors changed.
-  When checking test deployment in my branch, it failed. It was lint errors I could reproduce with `yarn lint`.
   -  fixed them

### `yarn lint` doesn't' work

-  Make sure you are using Git Bash instead of PowerShell.

### 9/11/2025 Couldn't deploy to Vercel

-  Changed to 22.x in Vercel project settings.
-  Redeploying the previous deployment attempt using Vercel dashboard.

### 11/2/2025 Daylight Savings Time Issue

-  We couldn't correct times for today's games. Its because of the way dates were being converted from a date plus time to Unix timestamp. If you get a date object for 11/2/2025, it will be in DST, even though DST ended today. It's because at midnight on 11/2, it was still DST. To fix this, I had to add some hours to the date object, then subtract them after it converts it to Unix time.

## To do
