import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userRoomId: {
        type: String,
        required: true,
        unique: true,
    },
    passKey: {
        type: String,
        required: true,
    },
    inCall: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema)

export default User;