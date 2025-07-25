import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import CodeSpace from './components/CodeSpace.jsx'
import CreateProject from './pages/createProjectPage.jsx'
import LandingPage from './pages/LandingPage.jsx'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< LandingPage />} /> 
        <Route path="/editor/:projectId/*" element={<CodeSpace />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
