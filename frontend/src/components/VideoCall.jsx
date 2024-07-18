import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../App.css";
import { useSocket } from "../../context/SocketProvider.jsx";
import Peer from "../utils/Peer.js";
import PropTypes from "prop-types";
import "../styles/Video.css";
// BottomBar code
import {
  FaMicrophone,
  FaPhone,
  FaVideo,
  FaMicrophoneSlash,
  FaVideoSlash,
} from "react-icons/fa";

import adapter from "webrtc-adapter";

import {
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  IconButton,
  Box,
} from "@mui/material";

import axios from "axios";
import CustomAlertBox from "./CustomAlertBox.jsx";

function VideoCall({ callActive, setCallActive }) {
  const socket = useSocket();

  const [myMobile, setMyMobile] = useState("");
  const [myPassKey, setMyPassKey] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState([]);

  const [dialogData, setDialogData] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState({});
  const [friendData, setFriendData] = useState({});
  const [friendError, setFriendError] = useState({});
  const [deleteRoomId, setDeleteRoomId] = useState("");

  const [userMobile, setUserMobile] = useState(
    localStorage.getItem("myMobile") || null
  );
  const [userPassKey, setUserPassKey] = useState(
    localStorage.getItem("myPassKey") || null
  );

  const activeCall = useCallback(() => {
    setCallActive(true);
  }, [setCallActive]);

  const endCall = useCallback(async () => {
    socket.emit("call-ended", remoteMobile);
    setCallActive(false);
    await axios.post(
      `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/outCall/${userMobile}`
    );
    window.location.reload();
  }, [remoteMobile, setCallActive, socket, userMobile]);

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

    peerRef.current.onconnectionstatechange = async () => {
      if (peerRef.current.connectionState === "connected") {
        console.log("Peers successfully connected!");

        try {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/inCall/${userMobile}`
          );
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          console.log("Peers connection failed!");
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, [
    activeCall,
    friendData.inCall,
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

  const handleUserJoinRoom = useCallback(async () => {
    localStorage.setItem("myMobile", myMobile);
    localStorage.setItem("myPassKey", myPassKey);
    setUserMobile(myMobile);
    setUserPassKey(myPassKey);
    socket.emit("join-room", myMobile);

    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/createRoom/${myMobile}/${myPassKey}`
      );

      if (data) setDialogData(data);
    } catch (error) {
      console.log(error?.response?.data);
      setDialogError(error?.response?.data);
      if (error?.response?.data?.success == false) {
        setUserMobile(null);
        setUserPassKey(null);
      }
    }
    setIsDialogOpen(true);
  }, [myMobile, myPassKey, socket]);

  const handleDeleteMobile = async () => {
    localStorage.removeItem("myMobile");
    localStorage.removeItem("myPassKey");
    setUserMobile(null);
    setUserPassKey(null);
    setDialogData({});
    setDialogError({});
    handleIncomingCallReject();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/deleteRoom/${userMobile}`
      );

      if (!data) return;

      setDeleteRoomId(data);
      setIsDialogOpen(true);
    } catch (error) {
      console.log(error?.response?.data);
    }
  };

  const handleSendUserCall = useCallback(
    async (e) => {
      e.preventDefault();

      setIsDialogOpen(true);
      try {
        const { data } = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/friendCall/${remoteMobile}`
        );

        if (data) setFriendData(data);

        if (data.inCall) {
          setRemoteMobile("");
          return;
        }
      } catch (error) {
        console.log(error?.response?.data);
        setFriendError(error?.response?.data);
        return;
      }

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

    socket.on("call-ended", async () => {
      console.log(`Call Ended by : ${remoteMobile}`);
      alert(`Call Ended by : ${remoteMobile}`);
      setCallActive(false);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/outCall/${userMobile}`
      );
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
  }, [pendingIceCandidates, remoteMobile, setCallActive, socket, userMobile]);

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
        <>
          {isDialogOpen && (
            <>
              {dialogData.newCreated && (
                <CustomAlertBox
                  description="User room created and joined successfully."
                  isOpen={isDialogOpen}
                  text="Ok"
                  title="User Room"
                  onClose={() => {}}
                />
              )}
              {dialogData.alreayExists && (
                <CustomAlertBox
                  description="User room already exists, joined in."
                  isOpen={isDialogOpen}
                  text="Ok"
                  title="User Room"
                  onClose={() => {}}
                />
              )}
              {dialogError.success == false && (
                <CustomAlertBox
                  description={`${dialogError.message}`}
                  isOpen={isDialogOpen}
                  text="Ok"
                  title="User Room Error"
                  onClose={() => {}}
                />
              )}
              {friendData.inCall && (
                <CustomAlertBox
                  description={`${friendData.message}`}
                  isOpen={isDialogOpen}
                  text="Ok"
                  title="Friend Call"
                  onClose={() => setFriendData({})}
                />
              )}
              {friendError.success == false && (
                <CustomAlertBox
                  description={`${friendError.message}`}
                  isOpen={isDialogOpen}
                  text="Ok"
                  title="Friend Call Error"
                  onClose={() => setFriendError({})}
                />
              )}
              {deleteRoomId.success == true && (
                <CustomAlertBox
                  description={`${deleteRoomId.message}`}
                  isOpen={isDialogOpen}
                  text="Ok"
                  title="User Room"
                  onClose={() => {
                    setDeleteRoomId({});
                    setIsDialogOpen(false);
                  }}
                />
              )}
            </>
          )}
          <Container
            id="service-section"
            className="flex flex-col items-center justify-center min-h-screen"
            maxWidth="md"
          >
            <Typography
              variant="h3"
              margin={"1.3rem 0"}
              textAlign={"center"}
              fontWeight={"bold"}
            >
              Let&apos;s Start
            </Typography>
            <Paper elevation={3} className="w-full p-6 m-3">
              <Typography
                variant="h6"
                component="label"
                htmlFor="mymb"
                className="block mb-2"
              >
                Create Room ID
              </Typography>
              {userMobile ? (
                <Typography
                  variant="span"
                  margin={"0.4rem 0"}
                  className="block mb-2"
                >
                  You Joined : {userMobile}
                </Typography>
              ) : (
                ""
              )}
              <TextField
                type="number"
                id="mymb"
                value={myMobile ? myMobile : ""}
                onChange={(e) => setMyMobile(e.target.value)}
                disabled={!!userMobile}
                variant="outlined"
                fullWidth
                margin="normal"
                label={"Enter Your Room ID"}
              />
              <TextField
                type="number"
                id="mymb"
                value={myPassKey ? myPassKey : ""}
                onChange={(e) => setMyPassKey(e.target.value)}
                disabled={!!userPassKey}
                variant="outlined"
                fullWidth
                margin="normal"
                label={"Enter Your Room Pass-Key"}
              />
              {userMobile ? (
                <Button
                  onClick={handleDeleteMobile}
                  type="button"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "red",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "darkred",
                    },
                  }}
                  className="transition duration-200 ease-in-out"
                >
                  Delete Your ID
                </Button>
              ) : (
                <Button
                  onClick={handleUserJoinRoom}
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="transition duration-200 ease-in-out"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "blue",
                    },
                  }}
                >
                  Join
                </Button>
              )}
            </Paper>
            <Paper elevation={3} className="w-full p-6 m-3">
              <Typography
                variant="h6"
                component="label"
                htmlFor="remotemb"
                className="block mb-2"
              >
                Friend Room ID
              </Typography>
              <TextField
                type="number"
                id="remotemb"
                value={remoteMobile}
                onChange={(e) => setRemoteMobile(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                label={"Enter Friend Room ID"}
              />
              <Button
                onClick={handleSendUserCall}
                disabled={isIncomingCall}
                variant="contained"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "blue",
                  },
                }}
                fullWidth
                className="transition duration-200 ease-in-out"
              >
                Call
              </Button>
            </Paper>
            {isIncomingCall && (
              <Paper elevation={3} className="w-full p-6 m-3">
                <Typography variant="h6" component="h1" className="mb-2">
                  Incoming Call from : {incomingOffer.from}
                </Typography>
                <Box className="w-full mt-3 flex flex-col sm:flex-row justify-center items-center gap-8">
                  <Button
                    onClick={handleIncomingCallAccept}
                    variant="contained"
                    sx={{
                      backgroundColor: "green",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "darkgreen",
                      },
                      borderRadius: "9999px", // Make the button circular
                      padding: "12px 48px", // Increase the size of the button
                    }}
                    className="w-auto transition duration-200 ease-in-out mb-2 sm:mb-0 text-lg" // Adjust text size for bigger buttons
                  >
                    Accept
                    <FaPhone className="ml-2" />
                  </Button>
                  <Button
                    onClick={handleIncomingCallReject}
                    variant="contained"
                    type="button"
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "darkred",
                      },
                      borderRadius: "9999px", // Make the button circular
                      padding: "12px 48px", // Increase the size of the button
                    }}
                    className="w-auto transition duration-200 ease-in-out text-lg" // Adjust text size for bigger buttons
                  >
                    Reject
                    <FaPhone className="ml-2" />
                  </Button>
                </Box>
              </Paper>
            )}
          </Container>
        </>
      ) : (
        <></>
      )}

      <div className="videoAreaBox">
        <div className="videoArea">
          <video
            autoPlay
            ref={remoteVideo}
            id="remote-video"
            style={{ display: callActive ? "block" : "none" }}
          />
          <video
            autoPlay
            ref={userVideo}
            id="user-video"
            style={{ display: callActive ? "block" : "none" }}
          />
        </div>

        {/* BottomBar of call */}
        {callActive && (
          <div className="bottomArea fixed bottom-0 w-full flex justify-around items-center p-4 bg-gray-800 text-white shadow-md sm:flex-row">
            <IconButton
              onClick={handleMicToggle}
              sx={{
                backgroundColor: micMuted ? "red" : "gray",
                "&:hover": {
                  backgroundColor: micMuted ? "darkred" : "darkgray",
                },
              }}
              className="p-2 rounded-full"
              title="Mic Toggle"
            >
              {micMuted ? (
                <FaMicrophoneSlash className="h-6 w-6 text-white" />
              ) : (
                <FaMicrophone className="h-6 w-6 text-white" />
              )}
            </IconButton>
            <IconButton
              onClick={endCall}
              className="p-2 rounded-full bg-red-600 hover:bg-red-500"
              title="End Call"
              sx={{
                backgroundColor: "red",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "darkred",
                },
                transform: "rotate(225deg)",
              }}
            >
              <FaPhone className="h-6 w-6" />
            </IconButton>
            <IconButton
              onClick={handleVideoToggle}
              sx={{
                backgroundColor: cameraOff ? "red" : "gray",
                "&:hover": {
                  backgroundColor: cameraOff ? "darkred" : "darkgray",
                },
              }}
              className="p-2 rounded-full"
              title="Camera Toggle"
            >
              {cameraOff ? (
                <FaVideoSlash className="h-6 w-6 text-white" />
              ) : (
                <FaVideo className="h-6 w-6 text-white" />
              )}
            </IconButton>
          </div>
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
