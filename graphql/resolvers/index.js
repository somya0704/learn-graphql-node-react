const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
    return events;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().populate('creator');
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    }catch (err) {
      console.log(err);
      throw err;
    }
  },

  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5f6ef0bb1f381bf44bacd6a4'
    })
    let createdEvent;
    try {
      const result = await event.save();
      console.log(result);
      createdEvent = {
        ...result._doc,
         _id: result._doc._id.toString(),
         date: new Date(result._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const user = await User.findById('5f6ef0bb1f381bf44bacd6a4');
      if (!user) {
        throw new Error('User not found');
      }
      user.createdEvents.push(event);
      await user.save();
      return createdEvent;
    }catch (err) {
      console.log(err);
      throw err;
    }
  },

  createUser: async args => {
    try {
      const user = await User.findOne({ email: args.userInput.email });
      if (user) {
        throw new Error('User exists already');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user_1 = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user_1.save();
      console.log(result);
      return { ...result._doc, password: "null", _id: result.id };
    }catch (err) {
      console.log(err);
      throw err;
    }
  },
}