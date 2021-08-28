## Local Installation

1. run `npm install` in the project root folder
2. run `npm install` in the client folder
3. make `.env` in the project root folder with the proper values to access the database
4. add the heroku remote so you can push to it
   `git remote add heroku <your heroku git url>`

## Running the App Locally

1. Open up separate consoles to run the server and client.
2. Run these commands in each terminal from the project folder:
   1. `npm run server` runs the server
   2. `npm run client` runs the client

-  One you run the client, it should automatically open in a browser window [here](http://localhost:3000).
-  Updates should appear locally in your browser whenever you save a file.

## Deployment

1. Update master with the version you want to deploy either directly or my merging a pull request.
2. `git push heroku master` Push latest git commit to Heroku
3. `heroku open` to open the [heroku page](https://hawknation.herokuapp.com) in a browser.

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
   1. add to `client\src\utils\helpers.js` `logOutCurrentUser()`
