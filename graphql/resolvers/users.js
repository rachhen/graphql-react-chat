const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { Op } = require('sequelize');
const { User, Message } = require('../../models');
const { JWT_SECRET } = require('../../config/env.json');

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        let users = await User.findAll({
          attributes: ['username', 'imageUrl', 'createdAt'],
          where: { username: { [Op.ne]: user.username } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [['createdAt', 'DESC']],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      const errors = {};

      try {
        if (username.trim() === '')
          errors.username = 'username must be not empty';
        if (password === '') errors.password = 'password must be not empty';

        if (Object.keys(errors).length > 0) {
          throw new UserInputError('Bad input', { errors });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
          errors.username = 'User not found';
          throw new UserInputError('Invalid credentials', { errors });
        }

        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
          errors.password = 'Password is incorrect';
          throw new UserInputError('Invalid credentials', { errors });
        }

        const token = jwt.sign({ username }, JWT_SECRET, {
          expiresIn: 60 * 60 * 3600, // TODO: Change this 60 * 60
        });

        return {
          ...user.toJSON(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      const { username, email, confirmPassword } = args;
      let password = args.password;
      const errors = {};

      try {
        // TODO: Validate input data
        if (email.trim() === '') errors.email = 'Email must not be empty';
        if (username.trim() === '')
          errors.username = 'Username must not be empty';
        if (password.trim() === '')
          errors.password = 'Password must not be empty';
        if (confirmPassword.trim() === '')
          errors.confirmPassword = 'Repeat password must not be empty';

        if (password !== confirmPassword)
          errors.confirmPassword = 'Password must match';

        // TODO: Check if username / email exists
        // const userByUsename = await User.findOne({ where: { username } });
        // const userByEmail = await User.findOne({ where: { email } });

        // if (userByUsename) errors.username = "Username is taken";
        // if (userByEmail) errors.email = "Email is taken";

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        // TODO: Hash password
        password = await bcrypt.hash(password, 6);

        // Create user
        const user = await User.create({
          username,
          email,
          password,
        });

        return user;
      } catch (err) {
        console.log(err);
        if (err.name === 'SequelizeUniqueConstraintError') {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          );
        } else if (err.name === 'SequelizeValidationError') {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} ${e.message}`)
          );
        }

        throw new UserInputError('Bad input', { errors });
      }
    },
  },
};
