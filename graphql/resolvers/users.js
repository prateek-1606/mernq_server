const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../../config');
const User = require('../../models/User');
const { UserInputError } = require('apollo-server');
const { validateRegisterInput, validateLoginInput } = require('../../utlis/validateUser');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
} 

module.exports = {
    Mutation: {
        async login ( _ ,{username , password} , ) {
            const {valid,errors} = validateLoginInput(username,password);
            if(!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({username})

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password,user.password);

            if (!match) {
                errors.general = 'Wrong crendetials';
                throw new UserInputError('Wrong crendetials', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        async register(_ , {registerInput: {username,password,email,confirmPassword}} , ) {
            //Todo: validate User
            const { valid,errors } = validateRegisterInput(username,password,confirmPassword,email);
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            //Todo: user does Exist
             const user = await User.findOne({username});
             if(user) {
                 throw new UserInputError('Username is taken', {
                     errors: {
                         username:'Username is taken'
                     }
                 })
             }
            //Todo: hash password and generetToken
            password = await bcrypt.hash(password,12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            };
        }
    }
}