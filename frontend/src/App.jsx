import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import CodeSpace from './components/CodeSpace.jsx'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/editor/:projectId/*" element={<CodeSpace />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
