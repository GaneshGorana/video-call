import React, { useCallback, useState } from "react";
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

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseClick = () => {
    setMenuOpen(false);
  };

  const handleMenuItemClick = (e) => {
    e.stopPropagation(); // Prevent menu close when clicking inside menu
  };

  const endCall = useCallback(() => {
    onEnd();
  }, [onEnd]);

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
                    <p className="font-bold">Audio</p>
                    <ul className="ml-4 space-y-1">
                      <li>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="audio"
                            checked={audioOption === "default"}
                            onChange={() => setAudioOption("default")}
                          />
                          <span className="ml-2">Default</span>
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="audio"
                            checked={audioOption === "speaker"}
                            onChange={() => setAudioOption("speaker")}
                          />
                          <span className="ml-2">Speaker</span>
                        </label>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p className="font-bold">Video</p>
                    <ul className="ml-4 space-y-1">
                      <li>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="video"
                            checked={videoOption === "default"}
                            onChange={() => setVideoOption("default")}
                          />
                          <span className="ml-2">Default</span>
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="video"
                            checked={videoOption === "camera"}
                            onChange={() => setVideoOption("camera")}
                          />
                          <span className="ml-2">Camera</span>
                        </label>
                      </li>
                    </ul>
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
