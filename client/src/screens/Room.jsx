import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../service/peer';

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [mystream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    // Callback function to handle when a user joins the room
    const handleUserJoined = useCallback((data) => {
        setRemoteSocketId(data.id);
    }, []);

    // Callback function to handle making a call to another user
    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const offer = await peer.getOffer();

        // Emit a 'user:call' event to the server with the offer and the remote socket ID
        socket.emit('user:call', { offer, to: remoteSocketId });

        setMyStream(stream);
    }, [remoteSocketId, socket]);

    // Callback function to handle an incoming call from another user
    const handleIncomingCall = useCallback(async (_ref) => {
        const { from, offer } = _ref || {};
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);

        const answer = await peer.getAnswer(offer);

        // Emit a 'call:accepted' event to the server with the answer and the remote socket ID
        socket.emit('call:accepted', { answer, to: from });

    }, []);

    // Callback function to send the streams to the other user
    const sendStreams = useCallback(() => {
        for(const track of mystream.getTracks()){
            const sender = peer.peer.getSenders().find((s) => s.track === track);
            if (!sender) {
                peer.peer.addTrack(track, mystream);
            } else {
                // Sender already exists for the track
            }
        }
    }, [mystream]);

    // Callback function to handle when a call is accepted by the other user
    const handleCallAccepted = useCallback(async ({ from,answer }) => {
        await peer.setLocalDescription(answer);
        sendStreams();
    }, [sendStreams]);

    // Callback function to handle when negotiation is needed
    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    }, [peer, socket, remoteSocketId]);

    // Callback function to handle incoming negotiation needed event
    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const answer = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { answer, to: from }); 
    }, [socket]);

    // Callback function to handle final negotiation
    const handleNegoNeedFinal = useCallback(async ({ answer }) => {
        await peer.setLocalDescription(answer);
    }, []);

    useEffect(() => {
        // Add event listener for 'negotiationneeded' event
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
        return () => {
            // Remove event listener when component unmounts
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    useEffect(() => {
        // Add event listener for 'track' event
        peer.peer.addEventListener('track', async (event) => {
            const remoteStream = event.streams;
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    useEffect(() => {
        // Add event listeners for various socket events
        socket.on('user:joined', handleUserJoined);
        socket.on('call:ayi', handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeedIncoming);
        socket.on('peer:nego:final', handleNegoNeedFinal);

        return () => {
            // Remove event listeners when component unmounts
            socket.off('user:joined', handleUserJoined);
            socket.off('call:ayi', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeedIncoming);
            socket.off('peer:nego:final', handleNegoNeedFinal);
        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

    useEffect(() => {
        if (mystream) {
            // Log the tracks of the mystream
            for (const track of mystream.getTracks()) {
                // console.log('Track:', track);
            }
        }
    }, [mystream]);

    useEffect(() => {
        if (remoteStream) {
            // Log the tracks of the remoteStream
            for (const track of remoteStream.getTracks()) {
                // console.log('Track:', track);
            }
        }
    }, [remoteStream]);

    return (
        <div className="room-container">
            <h1 className="room-title">Room</h1>
            <h4>{remoteSocketId ? 'Connected' : 'None in the Room'}</h4>
            {mystream ? <button onClick={sendStreams}>Send Stream</button>: null}
            {remoteSocketId ? <button onClick={handleCallUser}>Start Video Call</button> : null}
            <div>
                <h2>My Video</h2>
                {mystream ? <ReactPlayer url={mystream} playing={true} muted /> : null}
            </div>
            <div>
                <h2>Remote Video</h2>
                {remoteStream ? <ReactPlayer url={remoteStream} playing={true}  /> : null}
            </div>
        </div>
    );
};

export default RoomPage;
