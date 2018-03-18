## Setup

### Install MongoDB
https://docs.mongodb.com/manual/administration/install-community/

### Install Node and npm
https://nodejs.org/en/

### Clone and install node modules

```
git clone https://github.com/SmartCampusUWindsor/smartcampus-api.git
cd smartcampus-api
npm install
```

## Running server

### Start MongoDB 

```
mongod
```

You may need to create the data directory if it doesn't already exist.

### Start app

```
npm run dev
```

It calls our "dev" script which uses nodemon to restart server whenever there are changes to files.

## Making requests

Use curl/[Postman](https://www.getpostman.com/) to make requests to localhost:3000/api

```
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{"email":"zach@uwindsor.ca","password":"password1234"}' \
     http://localhost:3000/api/user/login
```

API spec can be found [here](https://github.com/SmartCampusUWindsor/smartcampus-api/wiki/API-Spec)