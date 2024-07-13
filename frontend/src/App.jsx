// eslint-disable-next-line no-unused-vars
import adapter from "webrtc-adapter";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import DefaultPage from "./components/DefaultPage.jsx";
import AssetsAttribution from "./components/AssetsAttribution.jsx";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<DefaultPage />}></Route>
        <Route
          path="/assets-attribution"
          element={<AssetsAttribution />}
        ></Route>
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
