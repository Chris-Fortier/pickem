## Local Installation

1. run `npm install` in the project root folder
2. run `npm install` in the client folder
3. make `.env` in the project root folder with the proper values to access the database
4. add the heroku remote so you can push to it
   `git remote add heroku <your heroku git url>`

## Running the App Locally

Open up separate consoles to run the server and client.
Run these commands in each terminal from the project folder:

-  `npm run server` runs the server
-  `npm run client` runs the client

## Deployment

-  `git push heroku master` Push latest git commit to Heroku
-  `heroku open` Open the heroku page in a browser

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
