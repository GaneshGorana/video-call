import mongoose from "mongoose";
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI).then(() => { console.log("Mongodb connected") }).catch((e) => {
            console.log("Mongodb connection error.");
            return JSON.parse("Mongodb connection error.", e);
        })
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;