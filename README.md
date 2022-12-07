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
