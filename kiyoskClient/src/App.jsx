import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have your own CSS file
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const App = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(""); 
  const [queueList, setQueueList] = useState([]);

  // Connect to WebSocket server
  useEffect(() => {
    const socket = socketIOClient('https://newsocketback.onrender.com'); 
    // Replace with your server endpoint
    // aikhane localhost:3000 bodole ami kiyosk backend url debo jate okhane giye sobh connect hoe.

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('broadcastData', (newQueueData) => {
      setQueueList(prevQueueList => [...prevQueueList, newQueueData]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const getQueue = async() => {
      const {data} = await axios.get("https://newsocketback.onrender.com/api/queuelist")
      setQueueList(data)
    }

    getQueue()

  },[])

  const submitHandler = async() => {
    const queueData = { title, author };
    
    const {data} = await axios.post("https://newsocketback.onrender.com/api/addqueue", queueData)

    setTitle("");
    setAuthor("");
  };
  

  // jehutu amr kiyosk e addqueue api call hoche jeta queue add korche so socket server 
  // kiyoske banate hbe.
  // iqb_web sudhu matro list dekhche add korchena.
  // same both iqb_web frontend and kiyosk frontend both will have const socket = socketIOClient('http://localhost:3000'); as kiyosk backend url.
  // only for the queuelist arghy will remove the cookie verification for this api.


  return (
    <>
      <main>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Title"/>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Enter Author"/>
        <button onClick={submitHandler}>Submit</button>
      </main>

      <main>
        <h2>This is local host <b>5174</b></h2>
        <h2>List of queue data:</h2>
        <ul>
          {queueList?.map((queue, index) => (
            <li key={index}>
              <strong>Title:</strong> {queue?.title}, <strong>Author:</strong> {queue?.author}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default App;
