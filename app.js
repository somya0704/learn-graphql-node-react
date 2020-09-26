const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const Event = require('./models/event');
const User = require('./models/user');

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
      creator: User!
    }

    type User{
      email: String!
      password: String!
      createdEvents: [Event!]
    }

    input EventInput{
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput{
      email: String!
      password: String!
    }

    type RootQuery{
      events: [Event!]!
    }

    type RootMutation{
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find()
      .populate('creator')
      .then(events => {
        return events.map(event => {
          return {
                  ...event._doc,
                  _id: event.id,
                  creator: {
                    ...event._doc.creator._doc,
                    _id: event._doc.creator.id
                  }
                };
        });
      }).catch(err => {
        console.log(err);
        throw err;
      });
    },

    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5f6ef0bb1f381bf44bacd6a4'
      })
      let createdEvent;
      return event
      .save()
      .then(result => {
        console.log(result);
        createdEvent = { ...result._doc, _id: result._doc._id.toString() };
        return User.findById('5f6ef0bb1f381bf44bacd6a4')
      })
      .then(user => {
        if(!user){
          throw new Error('User not found')
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
    },

    createUser: args => {
      return User.findOne({email: args.userInput.email})
      .then(user => {
        if(user){
          throw new Error('User exists already')
        }
        return bcrypt
        .hash(args.userInput.password, 12)
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        })
        return user.save();
      })
      .then(result => {
        console.log(result);
        return { ...result._doc, password: "null", _id: result.id };
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
    },
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