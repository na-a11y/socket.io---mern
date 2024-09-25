import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow'; // Separate chat component
import './Chat.css'; // CSS styles

const App = () => {
  const [currentUser] = useState('Luffy'); 
  const [users] = useState(['Robin', 'Nami']);
  
  return (
    <Router>
      <div className="chat-app">
        <div className="user-list">
          <h3>Available Users</h3>
          {users.map((user, index) => (
            <UserLink key={index} user={user} />
          ))}
        </div>

        <Routes>
          <Route path="/chat/:username" element={<ChatWindow currentUser={currentUser} />} />
        </Routes>
      </div>
    </Router>
  );
};

const UserLink = ({ user }) => {
  const navigate = useNavigate(); 

  const handleUserClick = () => {
    navigate(`/chat/${user}`); // Navigate to the chat route for the selected user
  };

  return (
    <div className="user" onClick={handleUserClick}>
      {user}
    </div>
  );
};

export default App;
