import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Editor } from '@monaco-editor/react';
import * as Y from 'yjs';

const BACKEND_URL = 'http://localhost:3000';

const EditorComponent = ({ projectId, filePath }) => {
  const roomId = (projectId && filePath) ? `room-${projectId}-${filePath}` : "Temp-room";
  const ydocRef = useRef(new Y.Doc());
  const ytextRef = useRef(ydocRef.current.getText('monaco'));

  const [editorValue, setEditorValue] = useState(''); // State to manage Monaco editor value

  useEffect(() => {
    const ydoc = ydocRef.current;
    const ytext = ytextRef.current;

    const socket = io(BACKEND_URL); // Connect to the backend 

    socket.connect();

    socket.on('connect', () => {
      console.log('🟢 Connected:', socket.id);
      socket.emit('join-room', roomId);
    });

    // Sync from Yjs doc to Monaco editor (local)
    const updateMonaco = () => {
      const newText = ytext.toString();
      if (editorValue !== newText) {
        console.log("newText : ", newText)
        setEditorValue(newText); // Set editor content if Yjs document changes
      }
    };

    // Observe Yjs text changes
    ytext.observe(updateMonaco);
    updateMonaco();

    // Receive remote Yjs update from server
    const handleRemoteUpdate = (updateBuffer) => {
      // console.log('Updates Received:', updateBuffer);
      const update = new Uint8Array(updateBuffer);
      // console.log(update)

      try {
        Y.applyUpdate(ydoc, update);
      } catch (err) {
        console.error('❌ Error applying Yjs update:', err);
      }
    };
    socket.on('y-update', handleRemoteUpdate);

    // Emit local Yjs updates to Server
    const handleYDocUpdate = (update) => {
      socket.emit('y-update', update);
      // console.log('Updates Emitted:', update);   Working good
    };
    ydoc.on('update', handleYDocUpdate);

    // Cleanup socket and editor on unmount
    return () => {
      ytext.unobserve(updateMonaco);
      socket.off('y-update', handleRemoteUpdate);
      ydoc.off('update', handleYDocUpdate);
      socket.disconnect();
    };
  }, []);

  // Handle Monaco editor content changes
  const handleEditorChange = (value) => {
    const ytext = ytextRef.current;

    // Update Yjs document with Monaco editor content
    ytext.doc.transact(() => {
      ytext.delete(0, ytext.length); // Clear the Yjs text
      ytext.insert(0, value); // Insert the new value from Monaco editor
    });
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Editor
        height="100vh"
        language="javascript"
        value={editorValue} // Bind state to Monaco editor value
        theme="vs-dark"
        onChange={handleEditorChange} // Handle content change
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default EditorComponent;
