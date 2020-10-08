const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

module.exports = {
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
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  login: async ({email, password}) => {
    try {
      const login_user = await User.findOne({ email: email });
      if (!login_user) {
        throw new Error('User does not exists');
      }
      const is_password_equal = await bcrypt.compare(password, login_user.password);
      if (!is_password_equal){
        throw new Error('Password is wrong');
      }
      const token = jwt.sign(
        { userId: login_user.id, email: login_user.email },
        'somesupersecretkey',
        {
          expiresIn: '1h'
        }
      );
      return { userId: login_user.id, token: token, tokenExpiration: 1 };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}