// eslint-disable-next-line no-unused-vars
import React from "react";
import NavigationBar from "./NavigationBar";
import Home from "./Home";
import AboutMe from "./AboutMe";
import VideoCall from "./VideoCall";

function DefaultPage() {
  return (
    <>
      <NavigationBar />
      <Home />
      <AboutMe />
      <VideoCall />
    </>
  );
}

export default DefaultPage;
