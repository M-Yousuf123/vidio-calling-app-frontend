import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../providers/Socket';
import ReactPlayer from 'react-player';
import peer from "../service/peer";

const Room = () => {
    const {socket} = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleCallUser = useCallback(async ()=>{
           const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
           const offer = await peer.getOffer();
           socket.emit("user:call", {to: remoteSocketId, offer});
           setMyStream(stream);
          //  console.log(stream);
    }, [remoteSocketId, socket]);

    const handleNewUserJoined = useCallback((data)=>{
      const {emailId, id} = data;
      console.log('New User joined room ', emailId);
      setRemoteSocketId(id);

 }, []);
    
    const handleIncommingCall = useCallback(async ({from, offer})=>{
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
      setMyStream(stream);
         console.log('incomming call', from , offer);
          const ans = await peer.getAnswer(offer);
          socket.emit('call:accepted', {to:from, ans});
    }, [socket]);

    const sendStreams = useCallback(()=>{
      for(const track of myStream.getTracks()){
        peer.peer.addTrack(track, myStream);
       } 
    }, [myStream]);

    const handleCallAccepted = useCallback(({from, ans})=>{
          peer.setLocalDescription(ans);
         console.log('CALL ACCEpted', ans)
         sendStreams();
    }, [sendStreams]);

   const handleNegoNeeded = useCallback(async () =>{
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', {to:remoteSocketId, offer});
}, [remoteSocketId, socket]);

    useEffect(()=>{
          peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
          return ()=>{
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
          }
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(async ({from, offer}) => {
      const ans = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', {to:from, ans});
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({from, ans})=>{
      console.log("iamansthat is set as local dis",ans)
      await peer.setLocalDescription(ans);
    }, [])

    useEffect(()=>{
        peer.peer.addEventListener('track', async ev => {
           const stream = ev.streams;
           console.log("got Tracks");
           setRemoteStream(stream[0]);    
        })
    }, []);

    useEffect(()=>{
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incomming:call', handleIncommingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeedIncomming);
        socket.on('peer:nego:final', handleNegoNeedFinal);
        return ()=>{
           socket.off('user-joined', handleNewUserJoined);
           socket.off('incomming:call', handleIncommingCall);
           socket.off('call:accepted', handleCallAccepted);
           socket.off('peer:nego:needed', handleNegoNeedIncomming);
        socket.off('peer:nego:final', handleNegoNeedFinal);
        }
    }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);
  return (
    <div className="room-container">
          <h1>Room Page</h1>
          <h4>{remoteSocketId ? 'Connected':'No one in room'}</h4>
          {myStream && <button onClick={sendStreams}>Send Stream</button>}
          {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
          {myStream && <ReactPlayer playing muted height="300px" width="500px" url={myStream} />}
          {remoteStream && <ReactPlayer playing muted height="300px" width="500px" url={remoteStream} />}
    </div>
  )
}

export default Room
