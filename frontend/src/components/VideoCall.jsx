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

// eslint-disable-next-line no-unused-vars
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkRoomData, setCheckRoomData] = useState({});
  const [userJoinData, setUserJoinData] = useState({});
  const [userMobileRemoveData, setUserMobileRemoveData] = useState({});
  const [friendJoinData, setFriendJoinData] = useState({});
  const [userMobileDeleteData, setUserMobileDeleteData] = useState({});

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
    window.location.reload();
    setCallActive(false);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/outCall/${userMobile}`
      );
    } catch (error) {
      console.log(error?.response?.data?.message);
    }

    return () => {
      socket.off("call-ended");
    };
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

  // useEffect(() => {
  //   const handleBeforeUnload = async (event) => {
  //     socket.emit("call-ended", remoteMobile);
  //     try {
  //       navigator.sendBeacon(
  //         `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/outCall/${userMobile}`
  //       );
  //     } catch (error) {
  //       console.error("Error sending status updates on window close", error);
  //     }
  //     event.returnValue = "";
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     socket.off("call-ended");
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [remoteMobile, socket, userMobile]);

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
          console.log(error?.response?.data?.message);
        }
      } else {
        try {
          console.log("Peers connection failed!");
        } catch (error) {
          console.log(error);
        }
      }
    };

    return () => {
      socket.off("ice-candidate");
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

  const handleUserJoinRoom = useCallback(async () => {
    setDialogOpen(true);
    if (!myMobile || !myPassKey) {
      alert("Please enter your Room ID and Pass-Key.");
      return;
    }
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/createRoom/${myMobile}/${myPassKey}`
      );

      if (!data) return;

      if (data?.alreayExists || data?.newCreated) {
        socket.emit("join-room", myMobile);
      }

      if (data?.isLogged) {
        setUserJoinData(data);

        localStorage.removeItem("myMobile");
        localStorage.removeItem("myPassKey");
        setUserMobile(null);
        setUserPassKey(null);
        setMyMobile(null);
        setMyPassKey(null);
        return;
      } else {
        localStorage.setItem("myMobile", myMobile);
        localStorage.setItem("myPassKey", myPassKey);
        setUserMobile(myMobile);
        setUserPassKey(myPassKey);
        setDialogOpen(true);
        setUserJoinData(data);
      }
    } catch (error) {
      setUserJoinData(error?.response?.data);
    }
    return () => {
      socket.off("join-room");
    };
  }, [myMobile, myPassKey, socket]);

  const handleRemoveMobile = useCallback(async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/logout/${userMobile}`
      );
      if (!data) return;

      localStorage.removeItem("myMobile");
      localStorage.removeItem("myPassKey");
      setUserMobile(null);
      setUserPassKey(null);
      setMyMobile(null);
      setMyPassKey(null);

      setDialogOpen(true);
      setUserMobileRemoveData(data);
    } catch (error) {
      setUserMobileRemoveData(error?.response?.data);
    }
  }, [userMobile]);

  const handleDeleteMobile = async () => {
    localStorage.removeItem("myMobile");
    localStorage.removeItem("myPassKey");
    setUserMobile(null);
    setUserPassKey(null);
    handleIncomingCallReject();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/deleteRoom/${userMobile}`
      );

      if (!data) return;

      setDialogOpen(true);
      setUserMobileDeleteData(data);
    } catch (error) {
      setUserMobileDeleteData(error?.response?.data);
    }
  };

  const handleSendUserCall = useCallback(
    async (e) => {
      e.preventDefault();
      setDialogOpen(true);
      if (!remoteMobile) {
        alert("Please enter your Room ID.");
        return;
      }
      if (!userMobile || !userPassKey) {
        alert("Please enter your Room ID and Pass-Key.");
        return;
      }
      try {
        if (userMobile == remoteMobile) {
          setFriendJoinData({
            inCall: true,
            message: "You can't call yourself!",
          });
          setRemoteMobile("");
          return;
        }

        const { data } = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/friendCall/${remoteMobile}`
        );
        setFriendJoinData(data);

        if (data.inCall || data.haveInComingCall) {
          setRemoteMobile("");
          return;
        }
      } catch (error) {
        setFriendJoinData(error?.response?.data);
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
      return () => {
        socket.off("offer");
      };
    },
    [activeCall, myMobile, myPassKey, remoteMobile, socket, userMobile]
  );

  const handleIncomingCallAccept = useCallback(async () => {
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
    try {
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/resetIncomingCall/${userMobile}`
      );
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
    return () => {
      socket.off("answer");
    };
  }, [activeCall, incomingOffer, pendingIceCandidates, socket, userMobile]);

  const handleIncomingCallReject = useCallback(async () => {
    socket.emit("call-rejected", incomingOffer.from);
    setIncomingOffer([]);
    setIsIncomingCall(false);
    setRemoteMobile("");
    try {
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/resetIncomingCall/${userMobile}`
      );
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  }, [incomingOffer.from, socket, userMobile]);

  useEffect(() => {
    if (userMobile && userPassKey) {
      socket.emit("join-room", userMobile);
    }
    return () => {
      socket.off("join-room");
    };
  }, [socket, userMobile, userPassKey]);

  useEffect(() => {
    (async function () {
      if (isIncomingCall) {
        try {
          await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/incomingCall/${userMobile}`
          );
        } catch (error) {
          console.log(error?.response?.data?.message);
        }
      } else {
        try {
          await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/resetIncomingCall/${userMobile}`
          );
        } catch (error) {
          console.log(error?.response?.data?.message);
        }
      }
    })();
  }, [isIncomingCall, userMobile]);

  useEffect(() => {
    socket.on("user-joined", (mb) => {
      console.log(`User Joined : ${mb}`);
    });

    socket.on("offer", async (offer) => {
      console.log(`Offer from : ${offer.from}`);
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

    socket.on("call-rejected", async () => {
      window.location.reload();
      console.log(`Call Rejected by : ${remoteMobile}`);
      alert(`Call Rejected by : ${remoteMobile}`);
      setCallActive(false);
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/outCall/${userMobile}`
        );
      } catch (error) {
        console.log(error?.response?.data?.message);
      }
    });

    socket.on("call-ended", async () => {
      window.location.reload();
      console.log(`Call Ended by : ${remoteMobile}`);
      if (remoteMobile) alert(`Call Ended by : ${remoteMobile}`);
      setCallActive(false);
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/outCall/${userMobile}`
        );
      } catch (error) {
        console.log(error?.response?.data?.message);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [
    pendingIceCandidates,
    remoteMobile,
    setCallActive,
    socket,
    userJoinData,
    userMobile,
  ]);

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
          {dialogOpen && (
            <>
              {checkRoomData.roomExists == false && (
                <CustomAlertBox
                  title={"User Room Error"}
                  description={`${checkRoomData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setCheckRoomData({});
                  }}
                />
              )}
              {userJoinData.newCreated == true && (
                <CustomAlertBox
                  title={"User Room"}
                  description={`${userJoinData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    {
                      setDialogOpen(false);
                      setUserJoinData({});
                    }
                  }}
                />
              )}
              {userJoinData.alreayExists == true && (
                <CustomAlertBox
                  title={"User Room"}
                  description={`${userJoinData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserJoinData({});
                  }}
                />
              )}
              {userJoinData.isLogged == true && (
                <CustomAlertBox
                  title={"User Room Warning"}
                  description={`${userJoinData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserJoinData({});
                  }}
                />
              )}
              {userJoinData.success == false && (
                <CustomAlertBox
                  title={"User Room Error"}
                  description={`${userJoinData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserJoinData({});
                  }}
                />
              )}
              {userMobileRemoveData.isAlreadyLoggedOut && (
                <CustomAlertBox
                  title={"User Room Warning"}
                  description={`${userMobileRemoveData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserMobileRemoveData({});
                  }}
                />
              )}
              {userMobileRemoveData.isAlreadyLoggedOut == false && (
                <CustomAlertBox
                  title={"User Room Warning"}
                  description={`${userMobileRemoveData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserMobileRemoveData({});
                  }}
                />
              )}
              {userMobileRemoveData.success == false && (
                <CustomAlertBox
                  title={"User Room Remove Error"}
                  description={`${userMobileRemoveData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserMobileRemoveData({});
                  }}
                />
              )}
              {friendJoinData.inCall && (
                <CustomAlertBox
                  title={"Room Warning"}
                  description={`${friendJoinData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setFriendJoinData({});
                  }}
                />
              )}
              {friendJoinData.haveInComingCall && (
                <CustomAlertBox
                  title={"Room Warning"}
                  description={`Your friend have another incoming call, try again later.`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setFriendJoinData({});
                  }}
                />
              )}
              {friendJoinData.success == false && (
                <CustomAlertBox
                  title={"Friend Room Error"}
                  description={`${friendJoinData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setFriendJoinData({});
                  }}
                />
              )}
              {userMobileDeleteData.roomDeleted && (
                <CustomAlertBox
                  title={"User Room Warning"}
                  description={`${userMobileDeleteData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserMobileDeleteData({});
                  }}
                />
              )}
              {userMobileDeleteData.success == false && (
                <CustomAlertBox
                  title={"User Room Warning"}
                  description={`${userMobileDeleteData.message}`}
                  text={"Ok"}
                  isOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                    setUserMobileDeleteData({});
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
                required
                fullWidth
                margin="normal"
                label={"Enter Your Room ID"}
              />
              <TextField
                type="number"
                id="mymp"
                value={myPassKey ? myPassKey : ""}
                onChange={(e) => setMyPassKey(e.target.value)}
                disabled={!!userPassKey}
                variant="outlined"
                required
                fullWidth
                margin="normal"
                label={"Enter Your Room Pass-Key"}
              />
              {userMobile ? (
                <>
                  <Button
                    onClick={handleRemoveMobile}
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                      mt: 1,
                      mb: 2,
                      "&:hover": {
                        backgroundColor: "darkred",
                      },
                    }}
                    className="transition duration-200 ease-in-out"
                  >
                    Remove ID
                  </Button>
                  <Button
                    onClick={handleDeleteMobile}
                    type="submit"
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
                </>
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
                required
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
                      borderRadius: "9999px",
                      padding: "12px 48px",
                    }}
                    className="w-auto transition duration-200 ease-in-out mb-2 sm:mb-0 text-lg"
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
                cursor: "pointer",
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
