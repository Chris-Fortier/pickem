# Running the App Locally

-  Both of these command are done from the project folder:
   -  `npm run server` runs the server
   -  `npm run client` runs the client

# Deployment

-  `git push heroku master` Push latest git commit to Heroku
-  `heroku open` Open the heroku page in a browser

# Development Checklists

## Making a new Page on the Client

1. new file `NewPage.js` in `client\src\components\pages`
2. in `client\src\App.js`
   1. `import NewPage from "./components/pages/NewPage";`
   2. `<Route exact path="/new-page" component={NewPage} />`
3. add link to it in navigation

## Add a new reducer to store

1. `client\src\store\store.js`
   1. add it
2. `client\src\store\actions.js`
   1. make actions
3. add `client\src\store\reducers\newReducer.js`
4. `client\src\store\combine\combineReducers.js`
   1. `import newReducer from "./reducers/newReducer";`
   2. add it to combineReducers
5. clear it when logging out
