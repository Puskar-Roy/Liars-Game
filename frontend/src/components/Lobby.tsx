import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Card from './Card';

const socket = io('https://liars-game.onrender.com');

const Lobby = () => {
    const [roomId, setRoomId] = useState('');
    const [targetSuit, setTargetSuit] = useState('');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [pfpUrl, setPfpUrl] = useState(localStorage.getItem('pfpUrl') || '');
    const [joinedUsers, setJoinedUsers] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerCards, setPlayerCards] = useState<any>(null);
    

    useEffect(() => {
        if (!username) {
            setPfpUrl("");
            setUsername("");
            window.location.href = '/profile';
            
        }
    }, [username]);

    const joinRoom = () => {
        if (!roomId) return;
        socket.emit('join-room', { roomId, username, pfpUrl });
    };

    useEffect(() => {
        socket.on('room-update', (users) => {
            setJoinedUsers(users);
        });

        socket.on('chat-message', (message) => {
            setChatHistory((prev) => [...prev, message]);
        });

        socket.on('game-started', (message) => {
            setGameStarted(true);
            alert(message);
        });

        socket.on('deal-cards', (cards) => {
            setPlayerCards(cards);
        });

        // Receive the random suit and store it in state
        socket.on('random-suit', (suit) => {
            setTargetSuit(suit); // Create a state for the target suit
        });

        return () => {
            socket.off('room-update');
            socket.off('chat-message');
            socket.off('game-started');
            socket.off('deal-cards');
            socket.off('random-suit');
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('send-message', { roomId, message, username, pfpUrl });
            setMessage('');
        }
    };

    const startGame = () => {
        socket.emit('start-game', roomId);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex space-x-4 mb-4">
                <button onClick={joinRoom} className="bg-blue-500 text-white p-2 rounded">
                    Join Room
                </button>
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room ID"
                    className="p-2 border border-gray-400 rounded"
                />
            </div>

            <h2 className="text-xl">Users in Lobby</h2>
            <div className="flex flex-wrap justify-center space-x-4 mt-4">
                {joinedUsers.map((user, index) => (
                    <div key={index} className="flex items-center">
                        <img src={user.pfpUrl} alt={user.username} className="w-12 h-12 rounded-full" />
                        <span className="ml-2">{user.username}</span>
                    </div>
                ))}
            </div>
            {gameStarted && targetSuit && (
                <div className="mt-4 text-center flex flex-col justify-center items-center gap-2">
                    <h1 className='text-center font-light '>Randomly Generated Card</h1>
                    <Card card={`Lol${targetSuit}`} />
                </div>
            )}
            {gameStarted ? (
                <div className="mt-4">
                    <h3 className="text-xl">Your Cards:</h3>
                    <div className="flex space-x-4">
                        {playerCards?.map((card: string, index: number) => (
                            <Card key={index} card={card} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-4">
                    {joinedUsers.find((user) => user.username === username) && (
                        <button onClick={startGame} className="bg-green-500 text-white p-2 rounded">
                            Start Game
                        </button>
                    )}
                </div>
            )}

<div className="mt-4 w-full max-w-lg mx-auto">
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Chat</h2>
    <div className="overflow-auto h-64 mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-inner">
      {chatHistory.map((msg, index) => (
        <div key={index} className="text-sm mt-4">
          <div className="flex items-start gap-3 mb-2">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={msg.pfpUrl}
              alt={msg.username}
            />
            <div className="flex flex-col">
              <div className="font-semibold text-gray-800">{msg.username}</div>
              <div className="text-gray-600">{msg.message}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="p-3 border border-gray-300 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send
      </button>
    </div>
  </div>
</div>

        </div>
    );
};

export default Lobby;
