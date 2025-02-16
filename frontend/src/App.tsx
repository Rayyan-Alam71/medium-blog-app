import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Blog from './pages/Blog'
import Home from './pages/Home'
function App() {

  return (
    <>
      <Router>
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/signin" element={<Signin/>}/>
            <Route path="/blog/:id" element={<Blog/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
