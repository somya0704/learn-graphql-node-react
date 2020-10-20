const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is_auth');

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}));

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
  }@cluster0-shard-00-00.5bn4n.mongodb.net:27017,cluster0-shard-00-01.5bn4n.mongodb.net:27017,cluster0-shard-00-02.5bn4n.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=atlas-obz5gp-shard-0&authSource=admin&retryWrites=true&w=majority`, {
    useUnifiedTopology: true, useNewUrlParser: true
  }).then(() => {
    app.listen(3002);
  }).catch(err => {
    console.log(err)
  });