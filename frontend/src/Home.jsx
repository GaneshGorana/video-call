import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { v4 as short } from "uuid";
// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";
function Home() {
  const socket = useSocket();

  const navigate = useNavigate();

  const [myMobile, setMyMobile] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  const [userMobile, setUserMobile] = useState("");
  const [incomingOffer, setIncomingOffer] = useState(null);

  const handleUserJoinRoom = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("join-room", myMobile);
    },
    [myMobile, socket]
  );

  const handleSendUserCallMessage = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("call-user", {
        from: userMobile,
        target: remoteMobile,
      });
      navigate(`/user/${short()}`);
    },
    [navigate, remoteMobile, socket, userMobile]
  );

  const handleIncomingCallAcceptMessage = useCallback(() => {
    socket.emit("call-received", {
      from: incomingOffer.from,
      target: userMobile,
      sdp: incomingOffer.sdp,
    });
    navigate(`/user/${short()}`);
  }, [incomingOffer, navigate, socket, userMobile]);

  useEffect(() => {
    socket.on("user-joined", (mb) => {
      setUserMobile(mb);
      console.log("user joined : ", mb);
    });

    socket.on("offer", (payload) => {
      setIsIncomingCall(true);
      setIncomingOffer(payload);
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
    };
  }, [socket]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={handleUserJoinRoom}
          className="w-full p-6 m-3 bg-white rounded shadow-md"
        >
          <label
            htmlFor="mymb"
            className="block mb-2 text-sm font-bold text-gray-700"
          >
            Your mobile number
          </label>
          <input
            type="number"
            id="mymb"
            value={myMobile}
            onChange={(e) => setMyMobile(e.target.value)}
            className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
          >
            Join
          </button>
        </form>
        <form
          onSubmit={handleSendUserCallMessage}
          className="w-full p-6 m-3 bg-white rounded shadow-md"
        >
          <label
            htmlFor="remotemb"
            className="block mb-2 text-sm font-bold text-gray-700"
          >
            Friend mobile number
          </label>
          <input
            type="number"
            id="remotemb"
            value={remoteMobile}
            onChange={(e) => setRemoteMobile(e.target.value)}
            className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          />
          <button className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out">
            Call
          </button>
        </form>
        {userMobile && (
          <h1 className="m-3 text-lg font-medium text-gray-700">
            You joined on : {userMobile}
          </h1>
        )}
        {isIncomingCall && (
          <div className="w-full p-6 m-3 bg-white rounded shadow-md">
            <h1 className="mb-2 text-lg font-medium text-gray-700">
              Incoming Call from : {incomingOffer.from}{" "}
            </h1>
            <button
              onClick={handleIncomingCallAcceptMessage}
              className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded-full hover:bg-green-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
