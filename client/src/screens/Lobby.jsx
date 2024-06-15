import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import {Navigate, useNavigate} from 'react-router-dom';

const LobbyScreen = () => {

  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');

  const socket = useSocket();
  const navigate = useNavigate();


  const handleSubmitForm = useCallback((e) => {
    e.preventDefault(); // form automaticly submit nah ho
    socket.emit('room:join', {email, room});
  },[email,room,socket]
);
  
  const handleJoinRoom = useCallback((data) => {
    const{email,room} = data;
    navigate(`/room/${room}`);
  },[navigate]);



  useEffect(() => {
    socket.on('room:join', handleJoinRoom);
    return () => {
      socket.off('room:join',handleJoinRoom);
    }
  },[socket]);


  return (
    <div>
      <h1 className="title">Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor='email'>Email Id</label>
        <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required/>
        <br/>
        <label htmlFor='room'>Room Number</label>
        <input type="text" name="room" value={room} onChange={e=>setRoom(e.target.value)} required/>
        <br/>
        <button type="submit" className="join-button">Join Room</button>
      </form>
    </div>
  )
}

export default LobbyScreen;