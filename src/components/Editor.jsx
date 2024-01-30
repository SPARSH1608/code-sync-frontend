/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import toast from 'react-hot-toast';
import axios from 'axios';
import ACTIONS from '../Actions';
const Editor = ({
  socketRef,
  roomId,
  onCodeChange,
  compiledCode,
  compileCode,
}) => {
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: { name: 'javascript', json: true },
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current.on('change', (instance, changes) => {
        // console.log('changes', instance, changes);
        const { origin } = changes;
        const code = instance.getValue(); //getter just like setter
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
        // console.log('code', code);
      });
      // editorRef.current.setValue(`console.log('hello)`);
    }
    init();
  }, []);
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.COMPILED_CODE, ({ output }) => {
        if (output !== null) {
          outputRef.current.innerHTML = output;
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.COMPILED_CODE);
    };
  }, [socketRef.current]);

  const handleRunClick = async () => {
    await compileCode();
  };
  return (
    <div>
      <textarea className="" name="" id="realtimeEditor" cols="1" rows="10" />

      <div
        className="output"
        ref={outputRef}
        style={{
          height: '50px',
          fontFamily: 'monospace',
          backgroundColor: '#f4f4f4',
          padding: '10px',
          fontSize: '25px',
        }}
      >
        {/* Display the compiled code here */}
        {compiledCode && (
          <pre
            style={{
              height: '50px',
              fontFamily: 'monospace',
              backgroundColor: '#f4f4f4',
              padding: '10px',
            }}
          >
            {compiledCode}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Editor;
