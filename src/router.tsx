import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Snake from './pages/games/Snake';
import Typing from './pages/games/Typing';
import Reaction from './pages/games/Reaction';
import Game2048 from './pages/games/Game2048';
import Memory from './pages/games/Memory';
import Tetris from './pages/games/Tetris';
import AboutUs from './pages/AboutUs'; // Import the new AboutUs component
import Minesweeper from './pages/games/Minesweeper';
import Breakout from './pages/games/Breakout';
import Leaderboard from './pages/Leaderboard';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="game/snake" element={<Snake />} />
          <Route path="game/2048" element={<Game2048 />} />
          <Route path="game/tetris" element={<Tetris />} />
          <Route path="game/minesweeper" element={<Minesweeper />} />
          <Route path="about" element={<AboutUs />} /> {/* Add the new route */}
          <Route path="game/breakout" element={<Breakout />} />
          <Route path="game/typing" element={<Typing />} />
          <Route path="game/memory" element={<Memory />} />
          <Route path="game/reaction" element={<Reaction />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
