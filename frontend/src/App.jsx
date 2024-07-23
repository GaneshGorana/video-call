/* eslint-disable no-unused-vars */
import adapter from "webrtc-adapter";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import DefaultPage from "./components/DefaultPage.jsx";
import AssetsAttribution from "./components/AssetsAttribution.jsx";
import FaqPage from "./components/FaqPage.jsx";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<DefaultPage />}></Route>
        <Route
          path="/assets-attribution"
          element={<AssetsAttribution />}
        ></Route>
        <Route path="/faq" element={<FaqPage />} />
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
