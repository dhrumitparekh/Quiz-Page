const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config(); 

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user', 
    },
    loginHistory: [
        {
            dateTime: {
                type: String,
                default: "",
            },
            userAgent: {
                type: String,
                default: "",
            }
        }
    ]
})


let User;

async function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGO_URI);

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model('users', userSchema);
            resolve();
        });
    });
}

async function registerUser(username, email, password,role) {
    try {
        let newUser = new User({
            userName: username,
            email: email,
            password: bcrypt.hashSync(password, 10),
        });

        if (username === "admin" && email === "admin@gmail.com") {
            newUser.role = 'admin';
        }

        let isUser = await User.findOne({ userName: username });

        if (isUser) {
            return 409;
        }

        let user = await newUser.save();
        return user;
    } catch (error) {
        throw `Error while creating user ${error}`;
    }
}


async function checkUser(username, password, userAgent) {
    try {
        let user = await User.findOne({ userName: username });

        if (!user) {
            return 404;
        }

        let isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return 400
        }

        console.log(user.loginHistory.length);

        user.loginHistory.unshift({
            dateTime: new Date(),
            userAgent: userAgent,
        });

        user.loginHistory = user.loginHistory.slice(0, 8);

        await User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } });

        return user;
    } catch (error) {
        throw `Error verifying user: ${err}`;
    }

}

module.exports = { initialize, registerUser, checkUser }
