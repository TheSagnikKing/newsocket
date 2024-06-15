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
    const socket = socketIOClient('http://localhost:3000'); // Replace with your server endpoint

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
      const {data} = await axios.get("/api/queuelist")
      setQueueList(data)
    }

    getQueue()

  },[])

  const submitHandler = async() => {
    const queueData = { title, author };
    
    const {data} = await axios.post("/api/addqueue", queueData)

    setQueueList([...queueList, data])

    setTitle("");
    setAuthor("");
  };

  return (
    <>
      <main>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Title"/>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Enter Author"/>
        <button onClick={submitHandler}>Submit</button>
      </main>

      <main>
        <h2>List of queue data:</h2>
        <ul>
          {queueList.map((queue, index) => (
            <li key={index}>
              <strong>Title:</strong> {queue.title}, <strong>Author:</strong> {queue.author}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default App;
