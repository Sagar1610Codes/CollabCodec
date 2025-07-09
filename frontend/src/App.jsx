import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import CodeSpace from './components/CodeSpace.jsx'
import CreateProject from './pages/createProjectPage.jsx'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateProject />} /> 
        <Route path="/editor/:projectId/*" element={<CodeSpace />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
