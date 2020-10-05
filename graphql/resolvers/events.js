const Event = require('../../models/event');
const { transformEvent } = require('./common_helper');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().populate('creator');
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
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
      createdEvent = transformEvent(result);
      const creator = await User.findById('5f6ef0bb1f381bf44bacd6a4');
      if (!creator) {
        throw new Error('User not found');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
}