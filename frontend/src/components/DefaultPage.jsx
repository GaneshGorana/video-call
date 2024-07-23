import { CircularProgress } from "@mui/material";
import { lazy, Suspense, useState } from "react";

const NavigationBar = lazy(() => import("./NavigationBar"));
const Home = lazy(() => import("./Home"));
const VideoCall = lazy(() => import("./VideoCall"));
const Introduction = lazy(() => import("./Introduction"));
const HowToUse = lazy(() => import("./HowToUse"));
const AboutMe = lazy(() => import("./AboutMe"));
const Footer = lazy(() => import("./Footer"));

function DefaultPage() {
  const [callActive, setCallActive] = useState(false);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <CircularProgress className="text-blue-500" />
        </div>
      }
    >
      {!callActive && <NavigationBar />}
      {!callActive && <Home />}
      {!callActive && <Introduction />}
      {!callActive && <HowToUse />}
      <VideoCall callActive={callActive} setCallActive={setCallActive} />
      {!callActive && <AboutMe />}
      {!callActive && <Footer />}
    </Suspense>
  );
}

export default DefaultPage;
