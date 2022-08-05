## Local Installation

1. Run `npm install` in the project root folder.
2. Run `npm install` in the client folder.
3. Run `cp example.env .env` in the project root folder and edit the `.env` file to have the proper values to access the database.
4. Add the heroku remote so you can push to it
   `git remote add heroku <your heroku git url>`.

## Running the App Locally

1. Open up separate consoles to run the server and client.
2. Run these commands in each terminal from the project folder:
   1. `npm run server` runs the server
   2. `npm run client` runs the client

-  One you run the client, it should automatically open in a browser window [here](http://localhost:3000).
-  Updates should appear locally in your browser whenever you save a file.

## Deployment

1. Update master with the version you want to deploy either directly or my merging a pull request.
2. Make sure you are on master and have pulled the latest.
3. Run `git push heroku master` to push latest git commit to Heroku.
   1. Note that it pushes what is in your local master branch (not the remote on GitHub).
   2. Or if you would like to deploy a different branch to heroku, use `git push heroku other-branch:master`. Keep in mind after doing this if you want to push master again you might need to force it using `git push heroku master --force`.
4. If you get a Windows Security pop up asking you to enter your credentials for something like `http://git.heroku...`, just close it and enter `heroku login`, use a web browser to log in, then try again.
5. `heroku open` to open the [heroku page](https://hawknation.herokuapp.com) in a browser.

## Development Checklists

### Making a new Page on the Client

1. new file `NewPage.js` in `client\src\components\pages`
2. in `client\src\App.js`
   1. `import NewPage from "./components/pages/NewPage";`
   2. `<Route exact path="/new-page" component={NewPage} />`
3. add link to it in navigation

### Add a new reducer to store

1. `client\src\store\store.js`
   1. add it
2. `client\src\store\actions.js`
   1. make actions
3. add `client\src\store\reducers\newReducer.js`
4. `client\src\store\combine\combineReducers.js`
   1. `import newReducer from "./reducers/newReducer";`
   2. add it to combineReducers
5. clear it when logging out
   1. add to `client\src\utils\helpers.js` `log_out_current_user()`
