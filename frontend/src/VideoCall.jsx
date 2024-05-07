// eslint-disable-next-line no-unused-vars
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSocket } from "../context/SocketProvider";
import Peer from "./utils/Peer.js";
// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";

function VideoCall() {
  const socket = useSocket();

  const [myMobile, setMyMobile] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [incomingOffer, setIncomingOffer] = useState(null);

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
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    }),
    []
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
        alert("Peers successfully connected!");
      }
    };
  }, [incomingOffer, myMobile, peerConfig, remoteMobile, socket]);

  const handleSendUserCall = useCallback(
    (myMobile, remoteMobile) => {
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
                from: myMobile,
                target: remoteMobile,
                sdp: peerRef.current.localDescription,
              };
              socket.emit("offer", payload);
              console.log("Offer payload when calling : ", payload);
            });
        })
        .catch((e) => console.log(e));
    },
    [socket]
  );

  const handleIncomingCallAccept = useCallback(
    (myMobile, remoteMobile, offer) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log("user 2 stream when accepting call : ", stream);
          userVideo.current.srcObject = stream;

          stream.getTracks().forEach((track) => {
            console.log("user 2 - track when accepting call : ", track);
            peerRef.current.addTrack(track, stream);
          });

          const desc = new RTCSessionDescription(offer);

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
                target: remoteMobile,
                from: myMobile,
                sdp: peerRef.current.localDescription,
              };
              socket.emit("answer", payload);
            });
        });
    },
    [pendingIceCandidates, socket]
  );

  useEffect(() => {
    socket.on("call-user", (data) => {
      console.log("call-user data : ", data);
      setMyMobile(data.from);
      setRemoteMobile(data.target);
      handleSendUserCall(data.from, data.target);
    });

    socket.on("call-received", (data) => {
      setMyMobile(data.target);
      setRemoteMobile(data.from);
      setIncomingOffer(data);
      handleIncomingCallAccept(data.target, data.from, data.sdp);
    });

    socket.on("answer", async (answer) => {
      const desc = new RTCSessionDescription(answer.sdp);
      await peerRef.current
        .setRemoteDescription(desc)
        .catch((e) => console.log(e));
      pendingIceCandidates.forEach(async (candidate) => {
        console.log("ice candidate when receiving answer : ", candidate);
        await peerRef.current
          .addIceCandidate(candidate)
          .catch((e) => console.log(e));
      });
      setPendingIceCandidates([]);
    });

    socket.on("ice-candidate", async (iceCandidate) => {
      const candidate = new RTCIceCandidate(iceCandidate);
      console.log("ice candidate when receiving : ", candidate);
      if (peerRef.current.remoteDescription) {
        await peerRef.current
          .addIceCandidate(candidate)
          .catch((e) => console.log(e));
      } else {
        setPendingIceCandidates((previous) => [...previous, candidate]);
      }
    });

    return () => {
      socket.off("call-user");
      socket.off("call-received");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [
    handleIncomingCallAccept,
    handleSendUserCall,
    myMobile,
    pendingIceCandidates,
    remoteMobile,
    socket,
  ]);

  return (
    <div className="w-full  p-6 m-3 bg-white rounded shadow-md">
      <video
        autoPlay
        ref={userVideo}
        width={1080}
        height={720}
        className=" rounded shadow-lg object-cover"
      />
      <video
        autoPlay
        ref={remoteVideo}
        className="w-full mt-4 rounded shadow-lg object-cover"
      />
    </div>
  );
}

export default VideoCall;
