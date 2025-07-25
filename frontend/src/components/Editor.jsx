// Editor.jsx

import React, { useEffect, useRef, useState } from 'react';
import socket from '../lib/socket.js';
import { Editor } from '@monaco-editor/react';
import * as Y from 'yjs';
import useEditorStore from '../store/useEditorStore.js';
import { useParams } from 'react-router-dom';
import { runCode } from '../utils/runtimeRunner.js';


const EditorComponent = ({ setOutput }) => {
  const { projectId, '*': filePath } = useParams();
  const ydocRef = useRef(new Y.Doc());
  const ytextRef = useRef(ydocRef.current.getText('monaco'));
  const langRef = useRef(String);

  const fileContent = useEditorStore((state) => state.fileContent)
  const loading = useEditorStore((state) => state.loading)
  const fetchContentFromDB = useEditorStore((state) => state.fetchContentFromDB);
  const saveContentToDB = useEditorStore((state) => state.saveContentToDB);


  const [editorValue, setEditorValue] = useState(''); // State to manage Monaco editor value


  const getLanguageFromExtension = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();

    const map = {
      js: 'javascript',
      mjs: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cc: 'cpp',
      md: 'markdown',
      txt: 'plaintext'
    };

    return map[ext] || 'plaintext';
  };


  // const language = useMemo(() => {
  //   const lang = getLanguageFromExtension(filePath || '');
  //   console.log("language changed : ", lang);
  //   return lang;
  // }, [filePath]);

  useEffect(() => {
    const lang = getLanguageFromExtension(filePath || '');
    langRef.current = lang;
  },[filePath])

  useEffect(() => {
    // console.log("fileContent changed in Editor :", fileContent);

    if (!fileContent || fileContent.trim() === '') {

      const defaultTemplates = {
        javascript: `console.log("Hello, JavaScript!");`,
        typescript: `console.log("Hello, TypeScript!");`,
        python: `sum([1,2,3,5])`,
        html: `<!DOCTYPE html>
<html>
  <head><title>Hello</title></head>
  <body>
    <h1>Hello, HTML!</h1>
  </body>
</html>`,
        css: `body {\n  background-color: #f0f0f0;\n}`,
        json: `{\n  "message": "Hello, JSON!"\n}`,
        markdown: `# Hello Markdown\nThis is a **Markdown** document.`,
        plaintext: `Welcome! Start typing...`
      };


      const fallback = defaultTemplates[langRef.current] || '';
      setEditorValue(fallback);
    } else {
      setEditorValue(fileContent);
    }
  }, [fileContent,filePath]);




  useEffect(() => {
    setEditorValue('') // if saved comes empty then editor remains empty and doesn't carry another files content
    // console.log("Fetch Content in Editor")
    fetchContentFromDB(projectId, filePath)

  }, [projectId, filePath, fetchContentFromDB]);

  useEffect(() => {
    // console.log("fileContent changed in Editor :", fileContent)
    setEditorValue(fileContent)

    const ytext = ytextRef.current;
    ytext.doc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, fileContent);
    });
    // console.log("✅ Yjs seeded with initial file content.");
  }, [fileContent])



  // socketLogic
  useEffect(() => {
    if (!projectId || !filePath) return;

    const fileRoomId = `room-${projectId}-${filePath}`;
    console.log('Joining room:', fileRoomId);

    const ydoc = ydocRef.current;
    const ytext = ytextRef.current;


    // socket.connect();

    socket.emit('join-file-room', fileRoomId, projectId, filePath);

    // Sync from Yjs doc to Monaco editor (local)
    const updateMonaco = () => {
      const newText = ytext.toString();
      if (editorValue !== newText) {
        console.log("newText : ", newText)
        setEditorValue(newText);
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
      socket.emit('leave-file-room',projectId, fileRoomId);
    };
  }, [projectId, filePath]);

  // Handle Monaco editor content changes
  const handleEditorChange = (value) => {
    const ytext = ytextRef.current;

    // Update Yjs document with Monaco editor content
    ytext.doc.transact(() => {
      ytext.delete(0, ytext.length); // Clear the Yjs text
      ytext.insert(0, value); // Insert the new value from Monaco editor
    });
  };

  const handleRunClick = async () => {
    const lang = langRef.current;
    const code = ytextRef.current.toString();
    console.log("filePath :",filePath,", language :", lang, ", code:", code)
    const result = await runCode(lang, code);

    const currentOutput = {
      timestamp: new Date().toLocaleTimeString(),
      language: lang,
      result,
    }

    console.log("currentOutput :", currentOutput)

    setOutput((prev) => [
      ...prev,
      currentOutput
      ,
    ]);
  }


  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's')) {
      e.preventDefault()

      const content = ytextRef.current.toString()

      console.log("filePath in handleKeyDown :", filePath, ",,, content :", content)

      saveContentToDB(projectId, filePath, content)
    }

    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key.toLowerCase() === 'n')) {
      e.preventDefault();
      handleRunClick(); // Trigger Run
    }
  }

  useEffect(() => {
    // Add event listener for keydown event
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return <div className="h-full bg-gray-900 text-gray-300 flex items-center justify-center">
      {/* Loading State */}

      <div className="text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading Editor...</p>
      </div>

    </div>
  }

  if (!loading && !filePath) {
    return <div className="h-full bg-gray-900 text-gray-300 flex items-center justify-center">
      {/* No File Selected */}

      <div className="text-center px-4">
        <div className="text-6xl mb-4 text-gray-600">📄</div>
        <h2 className="text-2xl font-semibold mb-2">No file selected</h2>
        <p className="text-gray-400">Please select or create a file to begin editing.</p>
      </div>

    </div>
  }

  return (
    <div className='w-full h-full overflow-hidden'>
      <Editor
        className='h-full'
        // height="100vh"
        language={langRef.current.toString()}
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
