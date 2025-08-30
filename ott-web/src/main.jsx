// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './app/App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './app/App.jsx'
import MovieTest from "./components/media/MovieTest.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MovieTest />
  </StrictMode>,
)
