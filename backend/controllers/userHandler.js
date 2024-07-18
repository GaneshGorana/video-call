import User from "../model/userModel.js"
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const userHandlerCreate = async (req, res) => {
    try {
        const id = req.params.id;
        const pass = req.params.pass

        const ifUserExists = await User.findOne({ userRoomId: id })

        if (ifUserExists) {
            if (ifUserExists.passKey === pass) {
                return ApiResponse(res, 200, true, false, "User room already exists")
            } else {
                return ApiError(res, 404, "User passkey does not match")
            }
        }

        const user = await User.create({
            userRoomId: id,
            passKey: pass
        })

        if (!user) return ApiError(res, 500, "Problem while creating user room")
    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }

    return ApiResponse(res, 200, false, true, "User room created successfully")

}

const userHandlerDelete = async (req, res) => {
    try {
        const id = req.params.id;

        const ifUserExists = await User.findOneAndDelete({ userRoomId: id })

        if (!ifUserExists) return ApiError(res, 404, "User not found")

        return ApiResponse(res, 200, false, false, "User room deleted successfully")

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

const userHandlerFriendCall = async (req, res) => {
    try {
        const id = req.params.id;
        const ifUserAlreadyInCall = await User.findOne({ userRoomId: id })

        if (!ifUserAlreadyInCall) return ApiError(res, 404, "Friend not found")

        if (ifUserAlreadyInCall.inCall) {
            return res.json({ inCall: true, message: "Your friend unable to accept call, try again later." })
        }

        return res.json({ inCall: false })

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

const userHandlerInCall = async (req, res) => {
    try {
        const id = req.params.id;

        const ifuserInCall = await User.findOne({ userRoomId: id })

        if (!ifuserInCall) return ApiError(res, 404, "User not found")

        ifuserInCall.inCall = true

        await ifuserInCall.save()

        return res.json({ message: "User now in call" })
    }
    catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

const userHandlerOutCall = async (req, res) => {
    try {
        const id = req.params.id;

        const ifuserInCall = await User.findOne({ userRoomId: id })

        if (!ifuserInCall) return ApiError(res, 404, "User not found")

        ifuserInCall.inCall = false

        await ifuserInCall.save()

        return res.json({ message: "User now out of call" })
    }

    catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }

}

export { userHandlerCreate, userHandlerDelete, userHandlerFriendCall, userHandlerInCall, userHandlerOutCall }