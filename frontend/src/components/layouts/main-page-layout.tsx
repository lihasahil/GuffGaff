import { Outlet } from "react-router";
import Navbar from "../navbar";

function MainPageLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default MainPageLayout;
