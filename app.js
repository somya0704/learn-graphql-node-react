const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event{
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput{
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery{
      events: [Event!]!
    }

    type RootMutation{
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find()
      .then(events => {
        return events.map(event => {
          return { ...event._doc, _id: event.id };
        });
      }).catch(err => {
        console.log(err);
        throw err;
      });
    },
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      })
      event.save().then(result => {
        console.log(result);
        return { ...result._doc, _id: result._doc._id.toString() };
      }).catch(err => {
        console.log(err);
        throw err;
      });
    }
  },
  graphiql: true
}));

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
  }@cluster0-shard-00-00.5bn4n.mongodb.net:27017,cluster0-shard-00-01.5bn4n.mongodb.net:27017,cluster0-shard-00-02.5bn4n.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=atlas-obz5gp-shard-0&authSource=admin&retryWrites=true&w=majority`, {
    useUnifiedTopology: true, useNewUrlParser: true
  }).then(() => {
    app.listen(3001);
  }).catch(err => {
    console.log(err)
  });