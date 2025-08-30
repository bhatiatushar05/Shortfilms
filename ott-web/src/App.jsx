// import React from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import AppRoutes from './app/routes';

// // Main App Component
// function App() {
//   return <AppRoutes />;
// }

// // Wrapper with Router
// function AppWrapper() {
//   return (
//     <Router>
//       <App />
//     </Router>
//   );
// }

// export default AppWrapper;




import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

// Layout
import Header from "./components/layout/TopNav"; // TopNav is your Header

// Auth
import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";

// Browse & Home
import Home from "./features/browse/pages/Home";
import Browse from "./pages/Browse"; // you already have Browse.jsx

// Search
import Search from "./features/browse/pages/Search";

// Profile / User
import MySpace from "./features/user/pages/MySpace";
import MyList from "./features/user/pages/MyList";
import Continue from "./features/user/pages/Continue";

// Playback
import Watch from "./features/playback/pages/Watch";

// Title Detail
import TitleDetail from "./features/title/pages/TitleDetail";

// Providers
import { AuthProvider } from "./AppProviders";

// Layout with Header
function MainLayout() {
  return (
    <>
      <Header />
      <Outlet /> {/* nested routes render here */}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Routes>
            {/* Public routes (no Header) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Routes with Header */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/search" element={<Search />} />
              <Route path="/my-space" element={<MySpace />} />
              <Route path="/my-list" element={<MyList />} />
              <Route path="/continue" element={<Continue />} />
            </Route>

            {/* Fullscreen routes (no Header) */}
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/title/:id" element={<TitleDetail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;