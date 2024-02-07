import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import UserModel from './models/Users.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import settings from './outlookSettings.js';
import * as graphHelper from './graphHelper.js';

/**
 * Server setup
 */
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(bodyParser.json({ limit: '125kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '125kb' }));
app.use(json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

connect("mongodb://localhost:27017/wellness-app")

// In part of a VSCode error, the default profile picture base64 enocoding is split into 4 strings.
const p1 = "iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAXVBMVEVmZmb////u7u5iYmJcXFzy8vJfX1/39/dZWVn6+vpWVlbBwcHr6+tycnJtbW3l5eXX19d5eXmFhYXe3t6jo6OVlZWysrKMjIxQUFC4uLisrKzPz89/f3/IyMidnZ2yIJC+AAAHx0lEQVR4nNVc64KqIBB2A0HFC2imlfb+j3lgtN0uYjBaeb5f5+Sqn8MwNwaCnyWI00r2x31dqiwPgjxTZb0/9rJK40WPDfCE5KEuM0IjyhgJRhDG9A8kK+uDxBPDkUrPp7xNKPkl8whCaNLmp3PxKVJclBmlNjq3oDQvBX8/qVSUbWQV0ITIorYUu7eSKprch9GVV1b7DaMHKd53rTejAazteo9hdCYV94ohKYG4mOqdp6MjqVhkCZ7RgCQTjrTcSElFF0jpV1pUydVIFU2yAiWglTQuKv+aVHwgbB1KBowcXo/hS1KVitajZBCpaiEpLaaVRu4P5KWw5kmlzeI5N4WkSfGk5JradAtGZqfhHKnTmygBrROKFK9X1vB7RLXd71hJ8c4pOsGDdlZ1t5GqsjeO3QCW2WyDhdQufzsnzSq3BFrTpKp8des0BZJPy2qS1EfkZGCR1RSpIvuInAxINuWgp0ipD8nJgCknUrz7ICfNqnu2V8+kLm+2T4+gl9ekTm+141OInjzOIyn50";
const p2 = "bEbwB698wOp9AucNKt0jlRcfodUGc+QOr0lpnuN5GAnJT9mNB9xH/TdkorV90ip2ELq8HFr8IfoME2q+JqcDEgxSar+ysy7gtVTpGT7TU5B0MpnUl/U8gHkL2b/JSW+OngGVDySihcEdoSyPFMaWc4WlIxIHj+Q6tG2nCT5XshiF4a7Qop9ji8bJeKeFFfIB7GglqHGDmD+dW4CLC3F70j1SI1KSslHQldoWiVS7Ky/I9WhPo7kYpCREVWa7sLr/wROWETdkipQNorlkgOJuDpemrJsLkcZAy0ucUlaW9yQQhlz1qWGQbgTKmIEwKJMDD8WqPRjNOtAKs0QD9DpbQhCKW8XIUjUgfhCXJKdpb+kBCo8AE7h4dEEkOQAFyrMMyPxS6pEfFRyNALh+4mEjO7hEiYSIuWV1A6h5qQGcUwnZNEeLjaIb213IynM6FGp3xueLYkr7eeuzgHGz5BCfBFrYv3WNLddz80cjBEPJs1ACjP36NmI4mCd9uyAFZWZf5oU4lbSpVpp7IIyojJ/gHAU9AykpibQC7A9CGLGxSWgVRd/C0r3QGrme62kzOjxOT/Aam0WQoyfzw2pGGEQaGHkMBvuKPMXFUKp2liTkog4g5g3FrMizoE3QlKJ1KROmCnCwbvNkjJeiCNUg540KYwxUcZKyXlSxrrGCGujLVXAMfFdFrtJCkWq5AEqbAmMx52/MzOGKsQ8O0";
const p3 = "uDChP2MAgv52RMOqN2KaaoS6pAYu4DdzwZtvz+xcGQQj48QAV4g2urZoxJZFQqRC1jRiI4oCRcQzZlHz/WQAKBiai0kIM9LuMDQfT2pi6IIlD6qh1rgKtKRSfIDhrLzVFtjZUdSNUBJj7XIDDji+mUZYhsQmRpkJQBsojAThCGT8ZihA2JDna1XgUo22lYydCSCrOsshN2QRYgXCaAqHBI79S9YSBJWcCFEF3xwlIKzKwfiixc3DRXMdr1Q31h950VFXoZqkBhITqaRBoJbfp0+I3XS5YNF8iKDgNlyi68kL04V3wsVoVFuYBTjlZ0A9bJa8UsDP/qedrnLVqGzrAmAUCirNo9I5SZfzfoDRTWeBpQNWrQE6u0z/DDp40nevGDZYL/DR4H/A0gP6IbLrSbQeSLANpctVwzkWJfN029F/Ja99S63iCFpR0yKnTRdwo+iqQSDUuG+iKLkqAR1ShAfsR9rw5dUEEeCfqRU3HJ6d27GcsvVxn2KFI6yMNErISMZeF0H01Ig0WndCwSY2Slw2FMIAYhHJgjW9FMDQaM28PAmadXmBQrEcMbj/bVIUKPgyyFf1FAp1j+yaj2efC++UB6CLjmSzOT0MkZIm1XKXB61cOQDKxSX5dh0nbvAkcih/r5SwmwoZ4+V1qbAhQ4PEtBUILVr3KwJJCy7mJbdmEBlIJ8i2YQ6zp1yBEY6FD6PR+KZn7lxWtR3";
const p4 = "+nr6ZBd1F5am/sXYkGjwsJxyCMo53kpyFiI9co6csgyXb04G1ZpfMZiLFn7mE86VDac3wJBYOjj9Mfivs8iFoHRE84voQIK7u7z77oM4rNgpAozHO5fwRozfoW7Af1dMOLORoGUkBZ7KC6FQoj7V7TcexESFNdrNrVQuXauN7HSf7k2OoJKecSFESjV0VUJb5Zrd67zD5aB3L87GJduQ+emlWzn3wKQSJ2wxBcPC60HXKc6rgN+2wLg3CxBT0eNzp1TEHTmDtdI5K5ZwrmthFENL1dGzB2OA3HfVoJuwFkXDw046FalVfHQqrSgqWs9PDZ1LWp/WwnP7W8/7k72XXhuFNxAS6V6bqncZPPpNtt0t9nQvMnW7202yW9yO8EXN17c7+f5D7aofGkzD5ndzLPNbU/b3CC2za1029x0qG3oR7dnTmyRntzI+pkNvwYkd93Iusktv9vcHG0S+U9sI8+8tpFrvXq/tjNlO7nEfl7C+48msL76/zrEQQPTAeoKijvu4sd453cdDPLkg91JbfIIlW0eNvOzyWN5jLCO6x5gdFzhACONol7vqCen083+20OxfszxYfny48PydY8PA1pLD1pzpeR5JJ1qkSrPWvWWI+kARY1o13rr4X2AVHRbO+YQEG7uQMgB6Xm/saMzR8Ty1GzqkNEreFpJ8Xgcq5BVihizG/wDXOFjEEo2JiEAAAAASUVORK5CYII=";
const defaultProfile = p1 + p2 + p3 + p4

/**
 * These following methods are all related to accounts by creation, login, logout, and authorization
 */
app.post('/register', async (req, res) => {
    try {
        req.body.email = req.body.email.toLowerCase()
        const { email, password: plainTextPassword, first_name, last_name } = req.body;
        const password = await bcrypt.hash(plainTextPassword, 10);
        const user = new UserModel({
            email: email,
            password: password,
            first_name: first_name,
            last_name: last_name,
            profile_picture: defaultProfile
        });
        let result = await user.save();
        result = result.toObject();
        if (result) {
            console.log(result);
            return res.json({ success: true, message: "Account successfully created." })
        } else {
            return res.json({ success: false, message: "Account was unable to be created." })
        }
    } catch (error) {
        console.log(error);
        if (error.code === 11000) { // Duplicate key error
            return res.json({ success: false, message: "Email is already in use." });
        } else {
            return res.json({ success: false, message: "An error occurred." });
        }
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() }).lean()
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Email or password does not match" });
        }
        const id = user._id.toString();
        if (user.stub_data && user.password === password) {
            console.log("STUB_DATA");
            req.session._id = id;
            return res.json({ success: true });
        }
        if (await bcrypt.compare(password, user.password)) {
            req.session._id = id;
            return res.json({ success: true });
        }
        return res
            .status(400)
            .json({ success: false, message: "Email or password does not match" });
    } catch (error) {
        console.log(error);
        return { status: 'error', error: 'timed out' }
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        return res.json({ success: true });
    });
});

app.get('/', (req, res) => {
    console.log("Session: ", req.session._id)
    if (req.session._id) {
        return res.json({ authorized: true, id: req.session._id })
    } else {
        return res.json({ authorized: false })
    }
});

app.get('/user', async (req, res) => {
    try {
        if (req.session._id) {
            const user = await UserModel.findOne({ _id: req.session._id }).lean();
            return res.json({ authorized: true, user: user })
        } else {
            return res.json({ authorized: false })
        }
    } catch (error) {
        console.log(error);
        return res.json({ authorized: false })
    }
});

/**
 * These methods are all related to the a users friends: Add, Remove, View, Search
 */
app.get('/search_users', async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.session._id }).lean();
        if (!user) {
            return res
                .status(404)
                .json({ error: "User not found" });
        }
        const email = user.email;
        const users = await UserModel.find({});
        const userStub = users.filter(item => item.email !== email).map(friend => {
            return {
                id: friend._id.toString(),
                first_name: friend.first_name,
                last_name: friend.last_name,
                profile_picture: friend.profile_picture
            };
        });
        return res.json(userStub);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error" });
    }
});

app.get('/friends_list', async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.session._id }).lean();
        if (!user) {
            return res
                .status(404)
                .json({ error: "User not found" });
        }
        const friendsEmails = user.friends;
        const friendsDetails = await UserModel.find({ email: { $in: friendsEmails } }).lean();
        const friendsStub = friendsDetails.map(friend => {
            return {
                id: friend._id.toString(),
                first_name: friend.first_name,
                last_name: friend.last_name,
                profile_picture: friend.profile_picture
            };
        });

        return res.json(friendsStub);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error" });
    }
});

app.post('/view_profile', async (req, res) => {
    try {
        const user_id = req.body;
        const user = await UserModel.findOne({ _id: user_id }).lean();
        const auth_user = await UserModel.findOne({ _id: req.session._id }).lean();
        if (!user || !auth_user) {
            return res
                .status(404)
                .json({ error: "User not found" });
        }
        const email = user.email;
        const first_name = user.first_name;
        const last_name = user.last_name;
        const profile_picture = user.profile_picture;
        return res.json({ email: email, first_name: first_name, last_name: last_name, profile_picture: profile_picture, auth_user: auth_user });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error" });
    }
});

app.post('/add_friend', async (req, res) => {
    try {
        const { user_id, friend_id } = req.body;
        const user = await UserModel.findById(user_id)
        const friend = await UserModel.findById(friend_id)
        if (!user || !friend) {
            return res
                .status(404)
                .json({ error: "User or friend not found" });
        }
        user.friends.push(friend.email);
        friend.friends.push(user.email);
        await user.save();
        await friend.save();
        return res.json({ isFriend: true, message: "Friend added successfully." });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error" });
    }
});

app.post('/remove_friend', async (req, res) => {
    try {
        const { user_id, friend_id } = req.body;
        const user = await UserModel.findById(user_id)
        const friend = await UserModel.findById(friend_id)
        if (!user || !friend) {
            return res
                .status(404)
                .json({ error: "User or friend not found" });
        }
        user.friends = user.friends.filter(item => item !== friend.email);
        friend.friends = friend.friends.filter(item => item !== user.email);
        await user.save();
        await friend.save();
        return res.json({ isFriend: false, message: "Friend removed successfully." });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error" });
    }
});

/**
 * This is two upload the base64 encoding of a profile picture
 */
app.post('/upload', async (req, res) => {
    try {
        const base64Image = req.body.base64Image;
        const user = await UserModel.findById(req.session._id);
        user.profile_picture = base64Image;
        await user.save();
        return res
            .status(200)
            .send("Image uploaded successfully");
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send("Error uploading picture.");
    }
});

/**
 * This is for validating and retrieving outlook data.
 */
app.get('/check_outlook_client', async (req, res) => {
    const result = graphHelper.checkIfClientExist()
    return res.json({ authorized: result })
})


app.get('/initalize_outlook', async (req, res) => {
    try {
        console.log("Initialize Outlook.")
        graphHelper.initializeGraphForUserAuth(settings, (deviceCodeMessage) => {
            console.log(deviceCodeMessage);
            return res.json({ authorized: true, deviceCodeMessage: deviceCodeMessage })
        });
        await graphHelper.getUserAsync();
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .send("Error connecting to Outlook.");
    }
});

app.get('/get_outlook_user', async (req, res) => {
    try {
        const user = await graphHelper.getUserAsync();
        return res.json({ authorized: true, user: user })
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .send("Error connecting to Outlook.");
    }
});

app.get('/sync_calendar', async (req, res) => {
    try {
        const user = await graphHelper.getUserAsync();
        const email = user.mail;
        const calendar = await graphHelper.getCalendarAysnc(email);
        return res.json({ authorized: true, calendar: calendar })
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .send("Error connecting to Outlook.");
    }
});

app.listen(3001, () => {
    console.log("Database is running")
});


