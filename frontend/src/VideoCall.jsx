import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useSocket } from "../context/SocketProvider";
import Peer from "./utils/Peer.js";
import PropTypes from "prop-types";
import "./Video.css";
// BottomBar code
import {
  FaMicrophone,
  FaPhone,
  FaVideo,
  FaMicrophoneSlash,
  FaVideoSlash,
} from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";

function VideoCall({ callActive, setCallActive }) {
  const socket = useSocket();

  const [myMobile, setMyMobile] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState([]);

  const [userMobile, setUserMobile] = useState(
    localStorage.getItem("myMobile") || null
  );

  const activeCall = useCallback(() => {
    setCallActive(true);
  }, [setCallActive]);

  const endCall = useCallback(() => {
    socket.emit("call-ended", remoteMobile);
    setCallActive(false);
    window.location.reload();
  }, [remoteMobile, setCallActive, socket]);

  const userVideo = useRef(null);
  const remoteVideo = useRef(null);

  const peerRef = useRef(null);
  const [pendingIceCandidates, setPendingIceCandidates] = useState([]);

  const peerConfig = useMemo(
    () => ({
      iceServers: [
        {
          urls: "stun:stun1.l.google.com:19302",
        },
        {
          urls: "stun:stun2.l.google.com:19302",
        },
      ],
      iceCandidatePoolSize: 0,
    }),
    []
  );

  useEffect(() => {
    peerRef.current = Peer(peerConfig);

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        const payload = {
          from: userMobile,
          target: remoteMobile || incomingOffer.from,
          candidate: e.candidate,
        };
        socket.emit("ice-candidate", payload);
      }
    };

    peerRef.current.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };

    peerRef.current.onconnectionstatechange = () => {
      if (peerRef.current.connectionState === "connected") {
        console.log("Peers successfully connected!");
      } else {
        console.log("Peers connection failed!");
      }
    };
  }, [
    activeCall,
    incomingOffer,
    myMobile,
    peerConfig,
    remoteMobile,
    socket,
    userMobile,
  ]);

  useEffect(() => {
    if (userMobile) {
      socket.emit("join-room", userMobile);
    }
  }, [socket, userMobile]);

  const handleUserJoinRoom = useCallback(() => {
    localStorage.setItem("myMobile", myMobile);
    setUserMobile(myMobile);
    socket.emit("join-room", myMobile);
  }, [myMobile, socket]);

  const handleDeleteMobile = () => {
    localStorage.removeItem("myMobile");
    setUserMobile(null);
    handleIncomingCallReject();
  };

  const handleSendUserCall = useCallback(
    (e) => {
      e.preventDefault();

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          activeCall();
          userVideo.current.srcObject = stream;

          stream.getTracks().forEach((track) => {
            peerRef.current.addTrack(track, stream);
          });

          peerRef.current
            .createOffer()
            .then((offer) => {
              return peerRef.current.setLocalDescription(offer);
            })
            .then(() => {
              const payload = {
                target: remoteMobile,
                from: userMobile,
                sdp: peerRef.current.localDescription,
              };
              socket.emit("offer", payload);
            });
        })
        .catch((e) => console.log(e));
    },
    [activeCall, remoteMobile, socket, userMobile]
  );

  const handleIncomingCallAccept = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        activeCall();
        userVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, stream);
        });

        const desc = new RTCSessionDescription(incomingOffer.sdp);
        peerRef.current
          .setRemoteDescription(desc)
          .then(() => {
            pendingIceCandidates.forEach(async (candidate) => {
              await peerRef.current
                .addIceCandidate(candidate)
                .catch((e) => console.log(e));
            });
          })
          .then(() => {
            return peerRef.current.createAnswer();
          })
          .then((answer) => {
            return peerRef.current.setLocalDescription(answer);
          })
          .then(() => {
            const payload = {
              target: incomingOffer.from,
              from: userMobile,
              sdp: peerRef.current.localDescription,
            };
            socket.emit("answer", payload);
          });
      });
  }, [activeCall, incomingOffer, pendingIceCandidates, socket, userMobile]);

  const handleIncomingCallReject = useCallback(() => {
    socket.emit("call-rejected", incomingOffer.from);
    setIncomingOffer([]);
    setIsIncomingCall(false);
    setRemoteMobile("");
  }, [incomingOffer, socket]);

  useEffect(() => {
    socket.on("user-joined", (mb) => {
      setUserMobile(mb);
    });

    socket.on("offer", async (offer) => {
      setIncomingOffer(offer);
      setIsIncomingCall(true);
      setRemoteMobile(offer.from);
    });

    socket.on("answer", async (answer) => {
      try {
        const desc = new RTCSessionDescription(answer.sdp);
        await peerRef.current
          .setRemoteDescription(desc)
          .catch((e) => console.log(e));
        pendingIceCandidates.forEach(async (candidate) => {
          await peerRef.current
            .addIceCandidate(candidate)
            .catch((e) => console.log(e));
        });
        setPendingIceCandidates([]);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("ice-candidate", async (iceCandidate) => {
      try {
        const candidate = new RTCIceCandidate(iceCandidate);
        if (peerRef.current.remoteDescription) {
          await peerRef.current
            .addIceCandidate(candidate)
            .catch((e) => console.log(e));
        } else {
          setPendingIceCandidates((previous) => [...previous, candidate]);
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("call-rejected", () => {
      console.log(`Call Rejected by : ${remoteMobile}`);
      alert(`Call Rejected by : ${remoteMobile}`);
      setCallActive(false);
      window.location.reload();
    });

    socket.on("call-ended", () => {
      console.log(`Call Ended by : ${remoteMobile}`);
      alert(`Call Ended by : ${remoteMobile}`);
      setCallActive(false);
      window.location.reload();
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [pendingIceCandidates, remoteMobile, setCallActive, socket]);

  // BottomBar code

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const handleVideoToggle = useCallback(() => {
    try {
      setCameraOff(!cameraOff);
      const videoTracks = userVideo.current.srcObject.getVideoTracks();

      if (videoTracks.length > 0) {
        videoTracks[0].enabled = cameraOff;
      }
    } catch (error) {
      console.log(error);
    }
  }, [cameraOff]);

  const handleMicToggle = useCallback(() => {
    try {
      setMicMuted(!micMuted);
      const audioTracks = userVideo.current.srcObject.getAudioTracks();

      if (audioTracks.length > 0) {
        audioTracks[0].enabled = micMuted;
      }
    } catch (error) {
      console.log(error);
    }
  }, [micMuted]);

  return (
    <>
      {callActive != true ? (
        <div
          id="videocal-section"
          className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8"
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full p-6 m-3 bg-white rounded shadow-md"
          >
            <label
              htmlFor="mymb"
              className="block mb-2 text-sm font-bold text-gray-700"
            >
              Your mobile number
            </label>
            {userMobile && (
              <h1 className="m-3 text-lg font-medium text-gray-700">
                User joined : {userMobile}
              </h1>
            )}
            <input
              type="number"
              id="mymb"
              value={myMobile}
              onChange={(e) => setMyMobile(e.target.value)}
              disabled={!!userMobile}
              className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            />
            {userMobile ? (
              <button
                onClick={handleDeleteMobile}
                type="button"
                className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded-full hover:bg-red-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
              >
                Delete Your Number
              </button>
            ) : (
              <button
                onClick={handleUserJoinRoom}
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
              >
                Join
              </button>
            )}
          </form>
          <form
            onSubmit={handleSendUserCall}
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
            <button
              disabled={isIncomingCall}
              className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
            >
              Call
            </button>
          </form>
          {isIncomingCall && (
            <div className="w-full p-6 m-3 bg-white rounded shadow-md">
              <h1 className="mb-2 text-lg font-medium text-gray-700">
                Incoming Call from : {incomingOffer.from}{" "}
              </h1>
              <button
                onClick={handleIncomingCallAccept}
                className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded-full hover:bg-green-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
              >
                Accept
              </button>
              <button
                onClick={handleIncomingCallReject}
                type="button"
                className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded-full hover:bg-red-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      <div className={`videoCall-box relative w-full h-screen`}>
        <video
          autoPlay
          ref={remoteVideo}
          className={`absolute transition-all duration-1000 object-cover ${
            callActive ? "w-full h-[95vh]" : "w-0 h-0"
          }`}
          id="remote-video"
        />
        <div className={`video-wrapper ${callActive ? "video-active" : ""}`}>
          <video
            autoPlay
            ref={userVideo}
            className="user-video"
            id="user-video"
          />
        </div>

        {/* BottomBar of call */}

        {callActive && (
          <>
            <div className="fixed bottom-0 w-full flex justify-around items-center p-4 bg-gray-800 text-white shadow-md sm:flex-row">
              <button
                onClick={() => handleMicToggle()}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                title="Mic Toggle"
              >
                {micMuted ? (
                  <FaMicrophoneSlash className="h-6 w-6 text-red-500" />
                ) : (
                  <FaMicrophone className="h-6 w-6 text-white" />
                )}
              </button>
              <button
                onClick={endCall}
                className="p-2 rounded-full bg-red-600 hover:bg-red-500"
                title="End Call"
              >
                <FaPhone className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleVideoToggle()}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                title="Camera Toggle"
              >
                {cameraOff ? (
                  <FaVideoSlash className="h-6 w-6 text-red-500" />
                ) : (
                  <FaVideo className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

VideoCall.propTypes = {
  callActive: PropTypes.bool.isRequired,
  setCallActive: PropTypes.func.isRequired,
};

export default VideoCall;
