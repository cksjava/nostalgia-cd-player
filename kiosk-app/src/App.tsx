import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { PlayerPage } from './pages/PlayerPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
