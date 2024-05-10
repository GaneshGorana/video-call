import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useSocket } from "../context/SocketProvider";
import Peer from "./utils/Peer.js";
import PropTypes from "prop-types";
import BottomBar from "./BottomBar.jsx";
// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";

function VideoCall({ callActive, setCallActive }) {
  const socket = useSocket();

  const [myMobile, setMyMobile] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);

  const [userMobile, setUserMobile] = useState("");

  const activeCall = useCallback(() => {
    setCallActive(true);
  }, [setCallActive]);

  const endCall = useCallback(() => {
    setCallActive(false);
    window.location.reload();
  }, [setCallActive]);

  const userVideo = useRef(null);
  const remoteVideo = useRef(null);

  const peerRef = useRef(null);
  const [pendingIceCandidates, setPendingIceCandidates] = useState([]); //ice candidates array

  const peerConfig = useMemo(
    () => ({
      iceServers: [
        {
          urls: "stun:stun1.l.google.com:19302",
        },
        {
          url: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    }),
    []
  );

  const handleUserJoinRoom = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("join-room", myMobile);
    },
    [myMobile, socket]
  );

  useEffect(() => {
    peerRef.current = Peer(peerConfig);

    peerRef.current.oniceconnectionstatechange = (e) => {
      console.log("ICE connection state change : ", e);
    };

    peerRef.current.onicecandidate = (e) => {
      console.log("ICE candidate : ", e.candidate);
      if (e.candidate) {
        const payload = {
          from: myMobile,
          target: remoteMobile || incomingOffer.from,
          candidate: e.candidate,
        };
        socket.emit("ice-candidate", payload);
      }
    };

    peerRef.current.ontrack = (e) => {
      console.log("remote user - track adding : ", e.streams[0]);
      remoteVideo.current.srcObject = e.streams[0];
    };

    peerRef.current.onconnectionstatechange = (event) => {
      console.log(event);
      if (peerRef.current.connectionState === "connected") {
        console.log("Peers successfully connected!");
        activeCall();
      }
    };
  }, [activeCall, incomingOffer, myMobile, peerConfig, remoteMobile, socket]);

  const handleSendUserCall = useCallback(
    (e) => {
      e.preventDefault();

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log("user stream when calling : ", stream);
          userVideo.current.srcObject = stream;

          stream.getTracks().forEach((track) => {
            console.log("user - track when calling : ", track);
            peerRef.current.addTrack(track, stream);
          });

          peerRef.current
            .createOffer()
            .then((offer) => {
              console.log("Offer when calling : ", offer);
              return peerRef.current.setLocalDescription(offer);
            })
            .then(() => {
              const payload = {
                target: remoteMobile,
                from: myMobile,
                sdp: peerRef.current.localDescription,
              };
              socket.emit("offer", payload);
            });
        })
        .catch((e) => console.log(e));
    },
    [myMobile, remoteMobile, socket]
  );

  const handleIncomingCallAccept = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("user 2 stream when accepting call : ", stream);
        userVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          console.log("user 2 - track when accepting call : ", track);
          peerRef.current.addTrack(track, stream);
        });

        const desc = new RTCSessionDescription(incomingOffer.sdp);

        peerRef.current
          .setRemoteDescription(desc)
          .then(() => {
            pendingIceCandidates.forEach(async (candidate) => {
              console.log(
                "ice candidate of user 1 when accepting call : ",
                candidate
              );
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
              from: myMobile,
              sdp: peerRef.current.localDescription,
            };
            socket.emit("answer", payload);
          });
      });
  }, [incomingOffer, myMobile, pendingIceCandidates, socket]);

  useEffect(() => {
    socket.on("user-joined", (mb) => {
      setUserMobile(mb);
      console.log("user joined : ", mb);
    });

    socket.on("offer", (offer) => {
      setIncomingOffer(offer);
      setIsIncomingCall(true);
    });

    socket.on("answer", async (answer) => {
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
    });

    socket.on("ice-candidate", async (iceCandidate) => {
      const candidate = new RTCIceCandidate(iceCandidate);
      if (peerRef.current.remoteDescription) {
        await peerRef.current
          .addIceCandidate(candidate)
          .catch((e) => console.log(e));
      } else {
        setPendingIceCandidates((previous) => [...previous, candidate]);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [pendingIceCandidates, socket]);

  return (
    <>
      {callActive != true ? (
        <div
          id="videocal-section"
          className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8"
        >
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
            <button className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transition duration-200 ease-in-out">
              Call
            </button>
          </form>
          {userMobile && (
            <h1 className="m-3 text-lg font-medium text-gray-700">
              User joined : {userMobile}
            </h1>
          )}
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
        <video
          autoPlay
          ref={userVideo}
          className={`p-6 transition-all duration-1000 absolute  ${
            callActive
              ? "bottom-16 right-4 w-4/12 h-4/12"
              : "aspect-[16/9] w-2/3"
          } object-cover rounded`}
          id="user-video"
        />
        {callActive && <BottomBar onEnd={endCall} />}
      </div>
    </>
  );
}

VideoCall.propTypes = {
  callActive: PropTypes.bool.isRequired,
  setCallActive: PropTypes.func.isRequired,
};

export default VideoCall;
