import { useParams } from 'react-router-dom'
import EditorComponent from './Editor'
import FileTree from './FileTree';
import Terminal from './Terminal';
import { useEffect, useState } from 'react';

const CodeSpace = () => {
    const { projectId, '*':filePath } = useParams();
    const [fileSelected , setFileSelected] = useState(null)

    const handleSelectedFile = ( filePath ) => {
        setFileSelected(filePath)
    }

    useEffect(() => {
        console.log("fileSelected :", fileSelected)
    },[fileSelected])

    return (
        <div className="flex h-screen">
            {/* Explorer */}
            <div className="w-80 bg-[#1e1e1e] text-white overflow-clip">
                {/* Select File from the tree then to Editor */}
                <FileTree handleSelectedFile={handleSelectedFile} />   
            </div>

            <div className="flex flex-col flex-1">
                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                    <EditorComponent projectId={projectId} filePath={filePath} />
                </div>

                {/* Terminal */}
                <div className="h-48 border-t border-gray-700 overflow-auto bg-black text-white">
                    <Terminal />
                </div>
            </div>
        </div>
    )
}

export default CodeSpace
