import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import PrivateRoute from './guard/PrivateRoute'

// Auth pages
import Login from '../features/auth/pages/Login'
import Signup from '../features/auth/pages/Signup'

// Browse pages
import Home from '../features/browse/pages/Home'
import Search from '../features/browse/pages/Search'
import Movies from '../features/browse/pages/Movies'
import Series from '../features/browse/pages/Series'
import Shorts from '../features/browse/pages/Shorts'
import Trending from '../features/browse/pages/Trending'
import Categories from '../features/browse/pages/Categories'

// Title pages
import TitleDetail from '../features/title/pages/TitleDetail'

// Playback pages
import Watch from '../features/playback/pages/Watch'

// User pages (protected)
import MyList from '../features/user/pages/MyList'
import Continue from '../features/user/pages/Continue'
import MySpace from '../features/user/pages/MySpace'

// Billing pages (protected)
import Plans from '../features/billing/pages/Plans'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Layout wrapper for main app */}
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="movies" element={<Movies />} />
        <Route path="series" element={<Series />} />
        <Route path="shorts" element={<Shorts />} />
        <Route path="trending" element={<Trending />} />
        <Route path="categories" element={<Categories />} />
        <Route path="title/:id" element={<TitleDetail />} />
        <Route path="watch/:id" element={<Watch />} />
        
        {/* Protected routes */}
        <Route path="my-list" element={<PrivateRoute><MyList /></PrivateRoute>} />
        <Route path="continue" element={<PrivateRoute><Continue /></PrivateRoute>} />
        <Route path="my-space" element={<PrivateRoute><MySpace /></PrivateRoute>} />
        <Route path="plans" element={<PrivateRoute><Plans /></PrivateRoute>} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
