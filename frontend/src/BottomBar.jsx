import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  CameraIcon,
  MicrophoneIcon,
  PhoneIcon,
  VideoCameraIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/solid";
import PropTypes from "prop-types";

const BottomBar = ({ onEnd }) => {
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

  const endCall = useCallback(() => {
    onEnd();
  }, [onEnd]);

  useEffect(() => {
    async function devices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        devices.forEach((d) => {
          const option = document.createElement("option");
          option.value = d.deviceId;
          option.text = d.label;

          audioInputRef.current.appendChild(option);
        });
      } catch (error) {
        console.log(error);
      }
    }
    devices();
  }, []);

  return (
    <div className="fixed bottom-0 w-full flex justify-around items-center p-4 bg-gray-800 text-white shadow-md sm:flex-row">
      <button
        onClick={() => setMicMuted(!micMuted)}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        title="Mic Toggle"
      >
        {micMuted ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <MicrophoneIcon className="h-6 w-6" />
        )}
      </button>
      <button
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
        onClick={() => setCameraOff(!cameraOff)}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        title="Camera Toggle"
      >
        {cameraOff ? (
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
          <div onClick={handleCloseClick} className="fixed inset-0 z-10">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="fixed inset-0 flex items-center justify-center z-20">
              <div
                className="bg-white p-4 rounded shadow-lg w-64 max-w-xs relative"
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
                      ref={audioInputRef}
                      id="audioInput"
                      value={audioOption}
                      onChange={(e) => setAudioOption(e.target.value)}
                    ></select>
                  </li>
                  <li>
                    <p className="font-bold">Video Input</p>
                    <select
                      ref={videoInputRef}
                      id="videoInput"
                      value={videoOption}
                      onChange={(e) => setVideoOption(e.target.value)}
                    ></select>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

BottomBar.propTypes = {
  onEnd: PropTypes.func.isRequired,
};

export default BottomBar;
