const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./common_helper');

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const get_event = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        event: get_event,
        user: req.userId
      });
      const result = await booking.save();
      console.log(result);
      return transformBooking(result);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      console.log(event)
      await Booking.deleteOne({ _id: args.bookingId });
      return event
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}