import "./App.css";
import { Route, Routes, Router } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Navbar } from "./components/common/Navbar";
import { Login } from "./Pages/Login";
import { Signup } from "./Pages/Signup";
import { Error } from "./Pages/Error";
import OpenRoute from "./components/core/Auth/OpenRoute";
import { ForgotPassword } from "./Pages/ForgotPassword";
import { UpdatePassword } from "./Pages/UpdatePassword";
import { VerifyEmail } from "./Pages/VerifyEmail";
import { MyProfile } from "./components/core/Dashboard/MyProfile";
import { About } from "./Pages/About";
import { Contact } from "./Pages/Contact";
import { PrivateRoute } from "./components/core/Auth/PrivateRoute";
import { Dashboard } from "./Pages/Dashboard";
import { EnrolledCourses } from "./components/core/Dashboard/EnrolledCourses";
import { ACCOUNT_TYPE } from "./utils/constants";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile)
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />

        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />

        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />

        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        <Route
          path="about"
          element={
            <OpenRoute>
              <About />
            </OpenRoute>
          }
        />

        <Route path="contact" element={<Contact />} />

        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="my-profile" element={<MyProfile />} />
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              {/* <Route path="dashboard/cart" element={<Cart />} /> */}
              <Route
                path="enrolled-courses"
                element={<EnrolledCourses />}
              />
            </>
          )}
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
