import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useSocket } from "../context/SocketProvider";
import Peer from "./utils/Peer.js";
import PropTypes from "prop-types";
import "./Video.css";
// BottomBar code
import {
  CameraIcon,
  MicrophoneIcon,
  PhoneIcon,
  VideoCameraIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/solid";
// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";

function VideoCall({ callActive, setCallActive }) {
  const socket = useSocket();

  const [myMobile, setMyMobile] = useState("");
  const [remoteMobile, setRemoteMobile] = useState("");
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState([]);

  const [userMobile, setUserMobile] = useState("");
  // eslint-disable-next-line no-unused-vars
  let [stream, setStream] = useState({});

  const [callAnswered, setCallAnswered] = useState(false);

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

    peerRef.current.onicecandidate = (e) => {
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
      const remoteStream = remoteVideo.current.srcObject;
      if (remoteStream) {
        remoteStream.addTrack(e.track);
      } else {
        // If no remote stream exists yet, create a new one with the first track
        remoteVideo.current.srcObject = new MediaStream([e.track]);
      }
    };

    peerRef.current.ondatachannel = (e) => {
      const dataChannel = e.channel;

      dataChannel.onopen = (e) => {
        console.log("Data channel is open and ready to be used.", e);
      };

      dataChannel.onmessage = (event) => {
        // Parse the track data
        let trackData = event.data;

        console.log("track data : ", trackData);
      };
    };

    peerRef.current.onconnectionstatechange = (event) => {
      if (peerRef.current.connectionState === "connected") {
        console.log("Peers successfully connected!");
      } else {
        console.log("Peers connection failed!", event);
      }
    };
  }, [activeCall, incomingOffer, myMobile, peerConfig, remoteMobile, socket]);

  const getUserMedia = useCallback(async () => {
    try {
      const strm = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(strm);
      return strm;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const sendCall = useCallback(
    async (stream) => {
      try {
        activeCall();

        userVideo.current.srcObject = stream;

        // Check if the PeerConnection is in a stable state
        if (peerRef.current.signalingState === "stable") {
          peerRef.current
            .createOffer()
            .then((offer) => {
              console.log("offer normal : ", offer);
              return peerRef.current.setLocalDescription(offer);
            })
            .then(() => {
              const payload = {
                target: remoteMobile,
                from: myMobile,
                sdp: peerRef.current.localDescription,
              };
              console.log("payload : ", payload);
              socket.emit("offer", payload);
            });
        }
      } catch (error) {
        console.log(error);
      }
    },
    [activeCall, myMobile, remoteMobile, socket]
  );

  const handleSendUserCall = useCallback(
    async (e) => {
      e.preventDefault();
      const strm = await getUserMedia();
      strm.getTracks().forEach((track) => {
        console.log("adding tracks always : ", track);
        peerRef.current.addTrack(track, strm);
      });
      await sendCall(strm);
    },
    [getUserMedia, sendCall]
  );
  const acceptCall = useCallback(
    async (stream) => {
      try {
        activeCall();
        setCallAnswered(true);
        userVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          console.log("stream normal: ", track);
          peerRef.current.addTrack(track, stream);
        });

        console.log("incomingOffer : ", incomingOffer);

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
            console.log("answer normal : ", answer);
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
      } catch (error) {
        console.log(error);
      }
    },
    [activeCall, incomingOffer, myMobile, pendingIceCandidates, socket]
  );

  const handleIncomingCallAccept = useCallback(async () => {
    const strm = await getUserMedia();
    await acceptCall(strm);
  }, [acceptCall, getUserMedia]);

  useEffect(() => {
    socket.on("user-joined", (mb) => {
      setUserMobile(mb);
      console.log("user joined : ", mb);
    });

    socket.on("offer", async (offer) => {
      console.log("offer come from first : ", offer);
      setIncomingOffer(offer);
      setIsIncomingCall(true);

      try {
        if (callAnswered) {
          console.log("get offer during call : ", offer);
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("answer", async (answer) => {
      try {
        console.log("call accepted normal : ", answer);
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

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [callAnswered, myMobile, pendingIceCandidates, socket]);

  // BottomBar code

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [audioOption, setAudioOption] = useState("default");
  const [videoOption, setVideoOption] = useState("default");
  const [menuOpen, setMenuOpen] = useState(false);

  const audioInputRef = useRef();
  const videoInputRef = useRef();

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseClick = () => {
    setMenuOpen(false);
  };

  const handleMenuItemClick = (e) => {
    e.stopPropagation();
  };

  const devices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Clear existing options
      audioInputRef.current.innerHTML = "";
      videoInputRef.current.innerHTML = "";

      let firstVideoDeviceId = null;

      devices.forEach((d) => {
        const option = document.createElement("option");
        option.classList.add("w-full", "p-2", "rounded", "border");
        option.value = d.deviceId;
        option.text = d.label || d.deviceId;
        if (d.kind === "audioinput" && audioInputRef.current) {
          audioInputRef.current.appendChild(option);
        } else if (d.kind === "videoinput" && videoInputRef.current) {
          if (!firstVideoDeviceId) {
            firstVideoDeviceId = d.deviceId;
          }
          videoInputRef.current.appendChild(option);
        }
      });

      // Set the selected option to match the current audioOption and videoOption
      if (audioInputRef.current) {
        audioInputRef.current.value = audioOption;
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = videoOption;
      }
    } catch (error) {
      console.log(error);
    }
  }, [audioOption, videoOption]);

  useEffect(() => {
    if (callActive && menuOpen) {
      devices();
    }
  }, [callActive, devices, menuOpen]);

  useEffect(() => {
    const setDefaultVideoOption = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const firstVideoDevice = devices.find(
        (device) => device.kind === "videoinput"
      );
      if (firstVideoDevice) {
        setVideoOption(firstVideoDevice.deviceId);
      }
    };

    setDefaultVideoOption();
  }, []);

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

  const handleSwitchCamera = useCallback(async () => {
    try {
      const video = navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      console.log(video);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAudioInputChange = useCallback(async (e) => {
    setAudioOption(e.target.value);
  }, []);

  const handleVideoInputChange = useCallback(async (e) => {
    try {
      setVideoOption(e.target.value);
      const deviceId = e.target.value;

      if (peerRef.current) {
        peerRef.current.getSenders().forEach((sender) => {
          if (sender.track) {
            // Check if the track is not null
            console.log("removing old track: ", sender.track);
            sender.track.stop(); // Stop the track
            peerRef.current.removeTrack(sender); // Remove the track from the peer connection
          }
        });
      }

      userVideo.current.srcObject = null;
      setStream(null);

      const constraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      userVideo.current.srcObject = newStream;
      console.log("stream of second camera : ", newStream);

      // Add the new tracks to the PeerConnection
      newStream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, newStream);
      });

      //create datachannel
      const dataChannel = peerRef.current.createDataChannel("chat");

      // Wait for the data channel to open before sending data
      dataChannel.onopen = () => {
        dataChannel.send(newStream);
        console.log("data channel send data : ", newStream);
      };

      // Handle incoming data
      dataChannel.onmessage = (event) => {
        console.log("data channel incoming data : ", event.data);
      };
    } catch (error) {
      console.log(error);
    }
  }, []);

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
        <div className={`video-wrapper ${callActive ? "video-active" : ""}`}>
          <video
            autoPlay
            ref={userVideo}
            className="user-video"
            id="user-video"
          />
        </div>

        {/* this is BottomBar of call */}

        {callActive && (
          <>
            <div className="fixed bottom-0 w-full flex justify-around items-center p-4 bg-gray-800 text-white shadow-md sm:flex-row">
              <button
                onClick={() => handleMicToggle()}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                title="Mic Toggle"
              >
                {!micMuted ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MicrophoneIcon className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={handleSwitchCamera}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                title="Switch Camera"
              >
                <CameraIcon className="h-6 w-6" />
              </button>
              <button
                onClick={endCall}
                className="p-2 rounded-full bg-red-600 hover:bg-red-500"
                title="End Call"
              >
                <PhoneIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleVideoToggle()}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                title="Camera Toggle"
              >
                {!cameraOff ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <VideoCameraIcon className="h-6 w-6" />
                )}
              </button>
              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="p-2 rounded bg-blue-500 text-white"
                  title="Settings"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>

                {menuOpen && (
                  <div
                    onClick={handleCloseClick}
                    className="fixed inset-0 z-10"
                  >
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-20">
                      <div
                        className="bg-white p-4 rounded shadow-lg w-full sm:w-80 max-w-xs relative overflow-auto max-h-60"
                        onClick={handleMenuItemClick}
                      >
                        <button
                          onClick={handleCloseClick}
                          className="absolute top-0 right-0 p-2"
                          title="Close"
                        >
                          <XIcon className="h-6 w-6 text-black" />
                        </button>
                        <ul className="space-y-2 text-black">
                          <li>
                            <p className="font-bold">Audio Input</p>
                            <select
                              className="w-full p-2 rounded border"
                              ref={audioInputRef}
                              id="audioInput"
                              value={audioOption}
                              onChange={handleAudioInputChange}
                            ></select>
                          </li>
                          <li>
                            <p className="font-bold">Video Input</p>
                            <select
                              className="w-full p-2 rounded border"
                              ref={videoInputRef}
                              id="videoInput"
                              value={videoOption}
                              onChange={handleVideoInputChange}
                            ></select>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
