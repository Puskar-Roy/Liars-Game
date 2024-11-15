
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Profile from './components/Profile';
import Lobby from './components/Lobby';

const App = () => {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/profile" element={<Profile/>} />
          <Route path="/room/:roomId" element={<Lobby/>} />
          <Route path="/" element={<Lobby/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

