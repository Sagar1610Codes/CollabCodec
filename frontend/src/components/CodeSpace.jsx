import { useParams, useLocation } from 'react-router-dom'
import EditorComponent from './Editor'
import FileTree from './FileTree';
import Terminal from './Terminal';
import { useEffect, useRef, useState } from 'react';
import socket from '../lib/socket';


const CodeSpace = () => {
    const location = useLocation()
    const { projectId, '*': filePath } = useParams();
    const [fileSelected, setFileSelected] = useState(null)
    const [projectUsers, setProjectUsers] = useState(null)



    const [notification, setNotification] = useState(null);

    const [output, setOutput] = useState('')


    const handleSelectedFile = (filePath) => {
        setFileSelected(filePath)
    }

    useEffect(() => {
        console.log("fileSelected :", fileSelected)
    }, [fileSelected])

    useEffect(() => {
        if (!projectId) return;

        const username = location.state?.username;
        console.log("username :", username)

        socket.auth = {
            userId: 'u123',      // Replace with real values
            username: username,
            // projectId: projectId,
        };

        const projectRoomId = `room-${projectId}`;

        if (!socket.connected) {
            socket.connect();
            socket.once('connect', () => {
                console.log('🟢 Connected:', socket.id);
                // Join global project room
                socket.emit('join-project-room', projectRoomId);
                console.log("projectRoomId joined :", projectRoomId)
            });
        } else {
            // Join global project room
            socket.emit('join-project-room', projectRoomId);
            console.log("projectRoomId joined :", projectRoomId)
        }



        socket.on('project-user-map', (users) => {
            console.log('👥 Users in project with active files:', users);
            setProjectUsers(users)
        });

        return () => {
            socket.off('connect')
            socket.off('project-user-map')
            socket.emit('leave-project-room', projectId);
            socket.disconnect()
        };
    }, [projectId]);

    const timeoutRef = useRef();

    useEffect(() => {
        const handleUserJoined = ({ username }) => {
            clearTimeout(timeoutRef.current);
            setNotification({ status: "join", username });
            timeoutRef.current = setTimeout(() => setNotification(null), 3000);
        };

        const handleUserLeft = ({ username }) => {
            clearTimeout(timeoutRef.current);
            setNotification({ status: "left", username });
            timeoutRef.current = setTimeout(() => setNotification(null), 3000);
        };

        socket.on('project-user-joined', handleUserJoined);
        socket.on('project-user-left', handleUserLeft);

        return () => {
            socket.off('project-user-joined', handleUserJoined);
            socket.off('project-user-left', handleUserLeft);
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">

            {/* Explorer */}
            <div className="w-fit bg-[#1e1e1e] text-white overflow-clip">
                {/* Select File from the tree then to Editor */}
                <FileTree handleSelectedFile={handleSelectedFile} projectUsers={projectUsers} />
            </div>

            <div className="flex flex-col flex-1 ">
                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                    <EditorComponent projectId={projectId} filePath={filePath} setOutput={setOutput} />
                </div>

                {/* Terminal */}
                <div className="h-60 border-t border-gray-700 overflow-y-scroll bg-black text-white scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <Terminal output={output} />
                </div>
            </div>

            {notification && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className={`px-4 py-2 rounded shadow-md text-white transition-all duration-300 ease-out
      ${notification.status === 'join' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {notification.username} {notification.status === 'join' ? 'joined' : 'left'} the project
                    </div>
                </div>
            )}
        </div>
    )
}

export default CodeSpace
