import './App.css';
import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import { SocketProvider } from './providers/Socket';
import Room from './pages/Room';

function App() {
  return (
    <div className="App">
          <SocketProvider>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/room/:roomId" element={<Room/>}/>
        </Routes>
          </SocketProvider>
    </div>
  );
}

export default App;
