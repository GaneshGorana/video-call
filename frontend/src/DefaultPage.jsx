// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import NavigationBar from "./NavigationBar";
import Home from "./Home";
import AboutMe from "./AboutMe";
import VideoCall from "./VideoCall";

function DefaultPage() {
  const [callActive, setCallActive] = useState(false);
  return (
    <>
      {!callActive && <NavigationBar />}
      {!callActive && <Home />}
      {!callActive && <AboutMe />}
      <VideoCall callActive={callActive} setCallActive={setCallActive} />
    </>
  );
}

export default DefaultPage;
