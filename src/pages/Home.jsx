import React, {useState, useEffect, useCallback} from 'react'
import {useSocket} from '../providers/Socket';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const {socket} = useSocket();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleRoomJoined = useCallback(({roomId}) =>{
    console.log('Room Joined', roomId);
    navigate(`/room/${roomId}`);
},[navigate]);
  
  useEffect(()=>{
      socket.on('joined-room', handleRoomJoined);
      return () => {
        socket.off('joined-room', handleRoomJoined);
      }
  }, [socket, handleRoomJoined]);

  const handleJoinRoom = useCallback(() => {
    socket.emit('room:join', {emailId: email, roomId});
}, [email, roomId, socket]);
  return (
    <div className='home-container'>
           <div className='input-container'>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder='Enter your email here'/>
                <input value={roomId} onChange={e=>setRoomId(e.target.value)} type="text" placeholder='Enter Room Code'/>
                <button onClick={handleJoinRoom}>Enter Room</button>
            </div>  
    </div>
  )
}

export default Home
