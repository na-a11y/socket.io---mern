import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './ChatWindow.css';

const socket = io("https://socket-io-mern.vercel.app", {
  withCredentials: true, // Allow credentials (cookies)
});


const ChatWindow = ({ currentUser }) => {
  const { username: chattingWith } = useParams();  // Get the username from the URL
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    socket.emit('joinRoom', { sender: currentUser, receiver: chattingWith });

    const fetchMessages = async () => {
      const response = await axios.get(
        `https://socket-io-mern.vercel.app/messages/${currentUser}/${chattingWith}`
      );
      setMessages(response.data);
    };
    fetchMessages();
  }, [currentUser, chattingWith]);

  useEffect(() => {
    const receiveMessageListener = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on('receiveMessage', receiveMessageListener);

    return () => {
      socket.off('receiveMessage', receiveMessageListener);
    };
  }, []);

  const sendMessage = () => {
    if (messageInput.trim()) {
      socket.emit('sendMessage', {
        sender: currentUser,
        receiver: chattingWith,
        message: messageInput,
      });
      setMessageInput('');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        You are now chatting with <strong>{chattingWith}</strong>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === currentUser ? 'message own-message' : 'message their-message'}
          >
            <div className="message-content">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY0hhQsKd4Q2VYGrtcUkaSU_PyywfV4UJAKA&s" alt="avatar" className="avatar" />
              <span className="text">{msg.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Enter your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
