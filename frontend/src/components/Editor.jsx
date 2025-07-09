// Editor.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Editor } from '@monaco-editor/react';
import * as Y from 'yjs';
import useEditorStore from '../store/useEditorStore.js';
import { useParams } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:3000';

const EditorComponent = () => {
  const { projectId, '*': filePath } = useParams();
  const ydocRef = useRef(new Y.Doc());
  const ytextRef = useRef(ydocRef.current.getText('monaco'));

  const fileContent = useEditorStore((state) => state.fileContent)
  const showEditor = useEditorStore((state) => state.showEditor)
  const loading = useEditorStore((state) => state.loading)
  const fetchContentFromDB = useEditorStore((state) => state.fetchContentFromDB);
  const saveContentToDB = useEditorStore((state) => state.saveContentToDB);


  const [editorValue, setEditorValue] = useState(''); // State to manage Monaco editor value

const roomId = useMemo(() => {
  return (projectId && filePath)
    ? `room-${projectId}-${filePath}`
    : 'Temp-room';
}, [projectId, filePath]);




  useEffect(() => {
    console.log("Fetch Content in Editor")
    fetchContentFromDB(projectId, filePath)

  }, [projectId, filePath, fetchContentFromDB]);

  useEffect(() => {
    console.log("fileContent changed in Editor :", fileContent)
    setEditorValue(fileContent)

    // const ytext = ytextRef.current;
    // ytext.doc.transact(() => {
    //   ytext.delete(0, ytext.length);
    //   ytext.insert(0, fileContent);
    // });
    // console.log("✅ Yjs seeded with initial file content.");
  }, [fileContent])


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
  }, [roomId]);

  // Handle Monaco editor content changes
  const handleEditorChange = (value) => {
    const ytext = ytextRef.current;

    // Update Yjs document with Monaco editor content
    ytext.doc.transact(() => {
      ytext.delete(0, ytext.length); // Clear the Yjs text
      ytext.insert(0, value); // Insert the new value from Monaco editor
    });
  };

  const handleSaveKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault()

      const content = ytextRef.current.toString()

      console.log("filePath in handleSaveKeyDown :", filePath)

      saveContentToDB(projectId, filePath, content)
    }
  }

  useEffect(() => {
    // Add event listener for keydown event
    window.addEventListener('keydown', handleSaveKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleSaveKeyDown);
    };
  }, []);

  if (!showEditor || loading) {
    return <div>Editor Loading...</div>
  }

  return (
    <div className='overflow-hidden'>
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
