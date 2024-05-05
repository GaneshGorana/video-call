import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useSocket } from "../context/SocketProvider";
import Peer from "./utils/Peer.js";

function App() {
  const socket = useSocket();

  const [myMobile, setMyMobile] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);

  const userVideo = useRef(null);
  const remoteVideo = useRef(null);

  // const [userVideo, setUserVideo] = useState(null);
  // const [remoteVideo, setRemoteVideo] = useState(null);

  const peerRef = useRef(null);
  const [pendingIceCandidates, setPendingIceCandidates] = useState([]); //ice candidates array

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

  const handleSendUserCall = useCallback(
    (e) => {
      e.preventDefault();

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log("user stream when calling : ", stream);
          userVideo.current.srcObject = stream;
          peerRef.current = Peer(peerConfig);

          peerRef.current.onconnectionstatechange = (event) => {
            console.log(event);
            if (peerRef.current.connectionState === "connected") {
              alert("Peers successfully connected!");
            }
          };

          stream.getTracks().forEach((track) => {
            console.log("user - track when calling : ", track);
            peerRef.current.addTrack(track, stream);
          });

          peerRef.current.onicecandidate = (e) => {
            console.log("ICE candidate when call:", e.candidate);
            if (e.candidate) {
              const payload = {
                from: myMobile,
                target: remoteMobile,
                candidate: e.candidate,
              };
              socket.emit("ice-candidate", payload);
            }
          };

          peerRef.current.onnegotiationneeded = () => {
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
          };

          peerRef.current.ontrack = (e) => {
            console.log("remote user1 - track when calling : ", e.streams[0]);
            remoteVideo.current.srcObject = e.streams[0];
          };
        })
        .catch((e) => console.log(e));
    },
    [myMobile, peerConfig, remoteMobile, remoteVideo, socket]
  );

  const handleIncomingCallAccept = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("user 2 stream when accepting call : ", stream);
        userVideo.current.srcObject = stream;

        peerRef.current = Peer(peerConfig);
        peerRef.current.onconnectionstatechange = (event) => {
          console.log(event);
          if (peerRef.current.connectionState === "connected") {
            alert("Peers successfully connected!");
          }
        };

        stream.getTracks().forEach((track) => {
          console.log("user 2 - track when accepting call : ", track);
          peerRef.current.addTrack(track, stream);
        });

        const desc = new RTCSessionDescription(incomingOffer.sdp);

        peerRef.current
          .setRemoteDescription(desc)
          .then(() => {
            pendingIceCandidates.forEach((candidate) => {
              console.log(
                "ice candidate of user 1 when accepting call : ",
                candidate
              );
              peerRef.current
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

        peerRef.current.onicecandidate = (e) => {
          console.log(
            "ICE candidate when accepting call , user 2:",
            e.candidate
          );
          if (e.candidate) {
            const payload = {
              from: myMobile,
              target: incomingOffer.from,
              candidate: e.candidate,
            };
            socket.emit("ice-candidate", payload);
          }
        };

        peerRef.current.ontrack = (e) => {
          console.log(
            "remote user2 - track when accepting call : ",
            e.streams[0]
          );
          remoteVideo.current.srcObject = e.streams[0];
        };
      });
  }, [
    incomingOffer,
    myMobile,
    peerConfig,
    pendingIceCandidates,
    remoteVideo,
    socket,
  ]);

  useEffect(() => {
    socket.on("user-joined", (mb) => {
      console.log("user joined : ", mb);
    });

    socket.on("offer", (offer) => {
      setIncomingOffer(offer);
      setIsIncomingCall(true);
    });

    socket.on("answer", (answer) => {
      const desc = new RTCSessionDescription(answer.sdp);
      peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
      pendingIceCandidates.forEach((candidate) => {
        peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
      });
    });

    socket.on("ice-candidate", (iceCandidate) => {
      const candidate = new RTCIceCandidate(iceCandidate);
      if (peerRef.remoteDescription) {
        peerRef.addIceCandidate(candidate).catch((e) => console.log(e));
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
      <div>
        <form onSubmit={handleUserJoinRoom} className="flex flex-col space-y-4">
          <label htmlFor="mymb" className="text-lg font-medium text-gray-700">
            Your mobile number
          </label>
          <input
            type="number"
            id="mymb"
            value={myMobile}
            onChange={(e) => setMyMobile(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
          <button
            type="submit"
            className="p-2 text-white hover:bg-purple-700 bg-blue-500 rounded-md"
          >
            Join
          </button>
        </form>
        <form
          onSubmit={handleSendUserCall}
          className="flex flex-col mt-5 space-y-4"
        >
          <label
            htmlFor="remotemb"
            className="text-lg font-medium text-gray-700"
          >
            Friend mobile number
          </label>
          <input
            type="number"
            id="remotemb"
            value={remoteMobile}
            onChange={(e) => setRemoteMobile(e.target.value)}
            className="p-2 rounded-md border border-gray-300"
          />
          <button className="p-2 text-white hover:bg-purple-700 bg-blue-500 rounded-md">
            Call
          </button>
        </form>
        {isIncomingCall && (
          <div className="mt-5 space-y-4">
            <h1 className="text-lg font-medium text-gray-700">
              Incoming Call from : {incomingOffer.from}{" "}
            </h1>
            <button
              onClick={handleIncomingCallAccept}
              className="p-2 text-white bg-green-500 hover:to-blue-600 rounded-md"
            >
              Accept
            </button>
          </div>
        )}
        <div className="mt-5 space-y-4">
          <video
            autoPlay
            ref={userVideo}
            className="w-full max-w-md rounded-md shadow-lg"
          />
          <video
            autoPlay
            ref={remoteVideo}
            className="w-full max-w-md rounded-md shadow-lg"
          />
        </div>
      </div>
    </>
  );
}

export default App;
