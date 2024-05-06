// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import VideoCall from "./VideoCall.jsx";
import Home from "./Home.jsx";
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Home />}></Route>
        <Route path="/user/:id" element={<VideoCall />}></Route>
      </>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
