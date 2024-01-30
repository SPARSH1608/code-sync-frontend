import { useEffect, useRef, useState } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../Socket';
import { useLocation } from 'react-router-dom';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';
import axios from 'axios';

import { useParams, useNavigate, Navigate } from 'react-router-dom';
const EditorPage = () => {
  const codeRef = useRef(null);
  const socketRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [compiledCode, setCompiledCode] = useState('');
  const [privateKey, setPrivateKey] = useState(null);

  async function compileCodeFunction() {
    try {
      const response = await axios.post(
        'https://code-compiler.p.rapidapi.com/v2',
        {
          LanguageChoice: '17', // Assuming the language code for JavaScript
          Program: codeRef.current, // Assuming codeRef.current contains the user's code
        },
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-rapidapi-host': 'code-compiler.p.rapidapi.com',
            'x-rapidapi-key':
              'eba0226bc6mshc006440642c4249p1de281jsnc5d4a2caa4e0',
          },
        }
      );
      // console.log('response', response.data.Result);
      const compiledOutput = response.data.Result;
      // console.log(compiledOutput);
      setCompiledCode(compiledOutput);

      // Broadcast the compiled code to other clients
      socketRef.current.emit(ACTIONS.COMPILED_CODE, {
        roomId,
        output: compiledOutput,
      });
    } catch (error) {
      console.error(error);
      toast.error('Code compilation failed');
    }
  }

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            // console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
      socketRef.current.on(ACTIONS.COMPILED_CODE, ({ roomId, output }) => {
        console.log(roomId, output);
        setCompiledCode(output);
      });
    };
    init();
    //cleaning function
    //component unmount hoga toh listeners ko clear kardenge
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);
  //re render nhi hota component

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to clipboard');
    } catch (error) {
      toast.error('Couldnt copy the Room ID');
      console.log(error);
    }
  }
  const compileCode = async () => {
    try {
      // Assuming compileCode is asynchronous and returns a promise
      await compileCodeFunction();

      // Update the state with the compiled code

      // Broadcast the compiled code to other clients
      socketRef.current.emit(ACTIONS.COMPILED_CODE, {
        roomId,
        output: compiledCode,
      });
    } catch (error) {
      console.error(error);
      toast.error('Code compilation failed');
    }
  };
  function leaveRoom() {
    reactNavigator('/');
  }
  if (!location.state) {
    return <Navigate to="/" />;
  }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/code-sync.png" className="logoImage" alt="logo" />
            <span className="head">CODE SYNC</span>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => {
              {
                /* console.log(client); */
              }
              return (
                <Client
                  className="client"
                  key={client.socketId}
                  username={client.username}
                />
              );
            })}
          </div>
        </div>
        <button className="btn" onClick={compileCode}>
          Run
        </button>
        <br />
        <button className="btn copyBtn " onClick={copyRoomId}>
          Copy Room ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
      <div className="editorwrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
          compiledCode={compiledCode}
          compileCode={compileCode} // Pass the compileCode function to the Editor component
        />
      </div>
    </div>
  );
};

export default EditorPage;
