import User from "../model/userModel.js"
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const userHandlerSetLoggedOut = async (req, res) => {
    try {
        const id = req.params.id;

        const ifUserExists = await User.findOne({ userRoomId: id })

        if (ifUserExists.isLogged) {
            ifUserExists.isLogged = false
            await ifUserExists.save()
            return res.json({ isLogged: false, isAlreadyLoggedOut: false, message: "You are now out from room." })
        }

        return res.json({ isLogged: false, isAlreadyLoggedOut: true, message: "You are already out from room." })

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

const userHandlerGet = async (req, res) => {
    try {

        const id = req.params.id;
        const users = await User.findOne({ userRoomId: id }).select("-passKey -_id -__v")

        if (!users) return ApiError(res, 404, "Users not found.")

        return res.status(200).json(users)

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);

    }
}

const userHandlerCreate = async (req, res) => {
    try {
        const id = req.params.id;
        const pass = req.params.pass

        const ifUserExists = await User.findOne({ userRoomId: id })

        if (ifUserExists) {
            if (ifUserExists.passKey === pass) {
                if (ifUserExists.isLogged) {
                    return res.json({ isLogged: true, message: "You joined into another device, must remove room from that device to log in." })
                }
                ifUserExists.isLogged = true
                await ifUserExists.save()
                return ApiResponse(res, 200, true, false, "Your room already exists, joined in.")
            } else {
                return ApiError(res, 404, "Your room exists, enter valid passkey to join in.")
            }
        }

        const user = await User.create({
            userRoomId: id,
            passKey: pass,
            isLogged: true
        })

        if (!user) return ApiError(res, 500, "Error, your room not created.")
    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }

    return ApiResponse(res, 200, false, true, "Your room created successfully, joined in.")

}

const userHandlerDelete = async (req, res) => {
    try {
        const id = req.params.id;

        const ifUserExists = await User.findOneAndDelete({ userRoomId: id })

        if (!ifUserExists) return ApiError(res, 404, "Your room not found.")

        return res.json({ roomDeleted: true, message: "Your room deleted successfully." })

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

const userHandlerFriendCall = async (req, res) => {
    try {
        const id = req.params.id;
        const ifUserAlreadyInCall = await User.findOne({ userRoomId: id })

        if (!ifUserAlreadyInCall) return ApiError(res, 404, "Friend room not found.")

        if (ifUserAlreadyInCall.inCall) {
            return res.json({ inCall: true, message: "Your friend unable to accept call, try again later." })
        }

        return res.json({ inCall: false, haveInComingCall: ifUserAlreadyInCall.haveInComingCall })

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

const userHandlerIncomingCall = async (req, res) => {
    try {
        const id = req.params.id;
        const isIncomingCall = await User.findOne({ userRoomId: id })

        if (!isIncomingCall) return ApiError(res, 404, "Friend room not found.")

        isIncomingCall.haveInComingCall = true
        await isIncomingCall.save()

        return res.status(200)

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);

    }
}
const userHandlerResetIncomingCall = async (req, res) => {
    try {
        const id = req.params.id;
        const haveInComingCall = await User.findOne({ userRoomId: id })

        if (!haveInComingCall) return ApiError(res, 404, "Friend room not found.")

        haveInComingCall.haveInComingCall = false
        await haveInComingCall.save()

        return res.status(200)

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);

    }
}

const userHandlerInCall = async (req, res) => {
    try {
        const id = req.params.id;

        const ifuserInCall = await User.findOne({ userRoomId: id })

        if (!ifuserInCall) return ApiError(res, 404, "Your room not found.")

        ifuserInCall.inCall = true

        await ifuserInCall.save()

        return res.status(200)
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

        if (!ifuserInCall) return ApiError(res, 404, "Your room not found.")

        ifuserInCall.inCall = false

        await ifuserInCall.save()

        return res.status(200)
    }

    catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }

}

const userHandlerCheckRoom = async (req, res) => {
    try {
        const id = req.params.id;

        const ifUserExists = await User.findOne({ userRoomId: id })

        if (!ifUserExists) return res.status(404).json({ roomExists: false, message: "Your room not found." })

        return res.status(200).json({ roomExists: true })

    } catch (error) {
        console.log(error)
        return ApiError(res, 500, error.message);
    }
}

export {
    userHandlerGet,
    userHandlerCreate,
    userHandlerDelete,
    userHandlerFriendCall,
    userHandlerIncomingCall,
    userHandlerResetIncomingCall,
    userHandlerInCall,
    userHandlerOutCall,
    userHandlerSetLoggedOut,
    userHandlerCheckRoom
}