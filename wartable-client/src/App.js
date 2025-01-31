import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000"; // DM server URL
const socket = io(SERVER_URL);

function App() {
  const [players, setPlayers] = useState({});
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    socket.on("updatePlayers", (playerList) => {
      setPlayers(playerList);
    });

    return () => socket.disconnect();
  }, []);

  const joinGame = () => {
    if (playerName) {
      socket.emit("joinGame", playerName);
    }
  };

  return (
    <div>
      <h1>Player Interface</h1>
      <p>DM Server: <a href={SERVER_URL} target="_blank" rel="noreferrer">{SERVER_URL}</a></p>
      
      <input 
        type="text" 
        placeholder="Enter Player Name" 
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>

      <h3>Connected Players:</h3>
      <ul>
        {Object.values(players).map((player, index) => (
          <li key={index}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
