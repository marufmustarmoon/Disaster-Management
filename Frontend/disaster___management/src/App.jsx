// src/App.js

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import Footer from "./components/Footer"; // Reusable Footer component
// import Navbar from "./components/Navbar"; // Reusable Navbar component
import AuthLayout from "./layouts/AuthLayout"; // Layout for auth pages
import MainLayout from "./layouts/MainLayout"; // Layout for main pages
import Crisis from "./pages/Crisis";
import Donation from "./pages/Donation";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Volunteer from "./pages/Volunteer";
import ProfilePage from "./pages/Profilepage";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <Router>
      <div className="App">
        {/* <Navbar /> Display Navbar on all pages */}
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <MainLayout>
                  <Home />
              </MainLayout>
              
             
            }
          />

          {/* Auth Pages (Register, Login) */}
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />

          <Route
            path="/account"
            element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          />
          {/* Donation Page */}
          <Route
            path="/donation"
            element={
              <MainLayout>
                <Donation />
              </MainLayout>
            }
          />

         <Route
            path="/inventory"
            element={
              <MainLayout>
                <Inventory />
              </MainLayout>
            }
          />

          {/* Crisis Page */}
          <Route
            path="/crisis"
            element={
              <MainLayout>
                <Crisis />
              </MainLayout>
            }
          />

          {/* Volunteer Page */}
          <Route
            path="/volunteer"
            element={
              <MainLayout>
                <Volunteer />
              </MainLayout>
            }
          />

          {/* Add more routes as needed */}
        </Routes>
        {/* <Footer /> Display Footer on all pages */}
      </div>
    </Router>
  );
}

export default App;
