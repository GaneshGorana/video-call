import { useState } from "react";
import NavigationBar from "./NavigationBar";
import Home from "./Home";
import VideoCall from "./VideoCall";
import Intoduction from "./Introduction";
import HowToUse from "./HowToUse";
import AboutMe from "./AboutMe";
import Footer from "./Footer";

function DefaultPage() {
  const [callActive, setCallActive] = useState(false);
  return (
    <>
      {!callActive && <NavigationBar />}
      {!callActive && <Home />}
      {!callActive && <Intoduction />}
      {!callActive && <HowToUse />}
      <VideoCall callActive={callActive} setCallActive={setCallActive} />
      {!callActive && <AboutMe />}
      {!callActive && <Footer />}
    </>
  );
}

export default DefaultPage;
