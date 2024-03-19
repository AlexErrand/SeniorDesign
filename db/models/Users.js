import { Schema, model } from 'mongoose';
import { ExercisesSchema } from './Exercises.js';
import { CalendarSchema } from './Calendar.js';

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    // join_date: { type: Date, required: true },
    linkedIn_link: { type: String, default: "" },
    about: { type: String, default: "" },
    stub_data: { type: Boolean, required: false },
    friends: { type: [String], default: [] },
    profile_picture: { type: String, default: "" },
    exercises: ExercisesSchema,
    calendar: { type: [CalendarSchema], default: [] }
});

const UserModel = model("users", UserSchema);
export default UserModel;
