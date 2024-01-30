import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success('Created a new room');
    // console.log(id);
  };
  const joinRoom = () => {
    if (!roomId) {
      toast.error('Room ID is required');
      return;
    }
    if (!username) {
      toast.error('Username is required');
      return;
    }
    //redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputHandle = (e) => {
    // console.log('Event key', e.code);
    if (e.code == 'Enter') {
      joinRoom();
    }
  };
  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <div>
          <img
            src="/code-sync.png"
            alt="logo"
            className="logo"
            style={{ width: '10%' }}
          />
          <span className="heading">CODE SYNC</span>
        </div>
        <h4 className="mainLabel">Paste invitation Room Id</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputHandle}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="Username.."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputHandle}
          />
          <button onClick={joinRoom} className="btn joinBtn">
            Join
          </button>
          <span className="createInfo">
            If you dont have an invite then create &nbsp;
            <a onClick={createNewRoom} href="#" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built By <a href="#">Sparsh Goel</a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
