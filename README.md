# Running the App Locally

-  Both of these command are done from the project folder:
   -  `npm run server` runs the server
   -  `npm run client` runs the client

# Deployment

-  `git push heroku master` Push latest git commit to Heroku
-  `heroku open` Open the heroku page in a browser

# Development

## Making a new Page on the Client

1. new file `NewPage.js` in `client\src\components\pages`
2. in `client\src\App.js`
   1. `import NewPage from "./components/pages/NewPage";`
   2. `<Route exact path="/new-page" component={NewPage} />`
3. add link to it in navigation