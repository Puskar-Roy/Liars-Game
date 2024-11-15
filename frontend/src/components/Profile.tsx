import { useState, useEffect } from 'react';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setPfpUrl(`https://robohash.org/${storedUsername}`);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setPfpUrl(`https://robohash.org/${e.target.value}`);
  };

  const saveProfile = () => {
    localStorage.setItem('username', username);
    localStorage.setItem('pfpUrl', pfpUrl);
    window.location.href = '/';

  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Enter your username"
        className="p-2 border border-gray-400 rounded"
      />
      <img src={pfpUrl} alt="Profile" className="mt-4 w-20 h-20 rounded-full" />
      <button onClick={saveProfile} className="mt-4 bg-blue-500 text-white p-2 rounded">
        Save Profile
      </button>
    </div>
  );
};

export default Profile;
