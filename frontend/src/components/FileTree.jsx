// FileTree.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useFileTreeStore } from '../store/useFileTreeStore';
import { useMemo } from 'react';


const FileNode = ({ node, path = '', handleSelectedFile, projectUsers }) => {

  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { projectId } = useParams()
  const { addFile, addFolder } = useFileTreeStore()
  const [showInput, setShowInput] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [inputType, setInputType] = useState(null) // 'file' or 'folder'

  // console.log("handleSelectedFile in FileNode:", handleSelectedFile);

  const fullPath = path ? `${path}/${node.name}` : node.name

  const usersInThisFile = useMemo(() => {
    return projectUsers?.filter(
      (user) => user.onFile === fullPath
    ) || [];
  }, [projectUsers, fullPath]);


  const handleClick = () => {
    if (node.type === 'folder') {
      setOpen(!open)
    } else {
      navigate(`/editor/${projectId}/${fullPath}`)
      handleSelectedFile(fullPath)
    }
  }

  const addFileButtonClick = (e) => {
    e.stopPropagation()
    setOpen(true)
    setShowInput(true)
    setInputType('file')
  }

  const addFolderButtonClick = (e) => {
    e.stopPropagation()
    setOpen(true)
    setShowInput(true)
    setInputType('folder')
  }

  const handleInputNewFileFolder = async (e) => {
    if (e.key === 'Enter') {
      const name = inputVal.trim()

      const newPath = `${fullPath}/${name}`

      if (inputType == 'file') {
        await addFile(projectId, newPath)
      } else {
        await addFolder(projectId, newPath)
      }

      setOpen(true)
      setShowInput(false)
      setInputType(null)
      setInputVal('')
    }
    else if (e.key === 'Escape') {  // here we have to reset state for all but we cannot do it for all else as it includes "ABCD...abcd..."
      setShowInput(false)
      setInputType(null)
      setInputVal('')
    }

  }

  return (
    <div>
      <div
        onClick={handleClick}
        className="flex items-center justify-between group cursor-pointer text-sm md:text-base py-1 px-1 hover:bg-gray-700 rounded"
      >
        <div className="flex items-center gap-2">
          {node.type === 'folder' ? (
            open ? (
              // Upward arrow
              <svg
                viewBox="0 0 1024 1024"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="#979595"
              >
                <path d="M903.232 768l56.768-50.432L512 256l-448 461.568 56.768 50.432L512 364.928z" />
              </svg>
            ) : (
              // Downward arrow
              <svg
                viewBox="0 0 1024 1024"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="#979595"
              >
                <path d="M903.232 256l56.768 50.432L512 768 64 306.432 120.768 256 512 659.072z" />
              </svg>
            )
          ) : (
            <span className="w-4 h-4 inline-block" />
          )}

          {/* Name of file/folder */}
          <span className="truncate max-w-[150px]">{node.name}</span>

          {/* Online user in file */}
          {usersInThisFile.length > 0 && node.type === 'file' && (
            <div
              className="ml-2 px-1.5 text-xs rounded-full bg-blue-600 text-white flex items-center justify-center"
              title={`${usersInThisFile.length} user(s) in this file`}
            >
              {usersInThisFile.length}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1 h-4 w-4 text-yellow-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

          )}

        </div>

        {node.type === 'folder' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1 mr-1">
            <button
              onClick={addFileButtonClick}
              className="text-blue-400 hover:text-blue-200"
              title="Add File"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
              >
                <path
                  d="M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H12M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19M19 9V12M17 19H21M19 17V21"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              onClick={addFolderButtonClick}
              className="text-green-400 hover:text-green-200"
              title="Add Folder"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
              >
                <path
                  d="M9 13H15M12 10V16M12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

          </div>
        )}
      </div>

      {showInput && (
        <div className='ml-4'>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleInputNewFileFolder}
            onBlur={() => setShowInput(false)}
            placeholder={`Enter ${inputType} name`}
            autoFocus
            className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm w-48"
          />
        </div>
      )}


      {/* Only show children if folder is open */}
      {open && node.children?.length > 0 && (
        <div className="ml-4">
          {node.children.map((child, index) => (
            <div key={index} className='ml-0.5'>
              <FileNode key={index} node={child} path={fullPath} handleSelectedFile={handleSelectedFile} projectUsers={projectUsers} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const buildTree = (files) => {
  const root = []
  // console.log("files in buildTree :", files)

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root

    parts.forEach((part) => {
      let existing = current.find((item) => item.name === part)

      if (!existing) {
        existing = {
          name: part,
          type: file.type,
          children: []
        }
        current.push(existing)
      }

      current = existing.children
    });
  }
  // console.log("Result of buildTree :", root)

  return root
}

const FileTree = ({ handleSelectedFile, projectUsers }) => {
  const { projectId } = useParams()
  const { fetchFileTreeData } = useFileTreeStore()
  const fileTreeData = useFileTreeStore((state) => state.fileTreeData);
  const [treeData, setTreeData] = useState([]);

  // console.log("handleSelectedFile in filetree :",handleSelectedFile)

  console.log("projectUsers :",projectUsers)

  // useEffect(() => {
  //   console.log(fileTreeData)
  // },[fileTreeData])

  useEffect(() => {
    console.log("fetching fileTreeData")
    fetchFileTreeData(projectId);
  }, [projectId, fetchFileTreeData]);

  useEffect(() => {
    // console.log("fileTreeData :", fileTreeData)
    if (fileTreeData) {
      const tree = buildTree(fileTreeData);
      setTreeData(tree);
      console.log("tree :", tree)
    }
  }, [fileTreeData]);


  return (
    <div className="w-full md:w-[250px] bg-[#1e1e1e] border-blue-400 border-1 text-white p-4 flex flex-col h-screen">
      {/* Main Content (Explorer) */}
      <div className="flex-grow">
        <h4 className="text-sm font-semibold mb-4">Explorer</h4>
        {treeData.map((node, i) => (
          <FileNode key={i} node={node} handleSelectedFile={handleSelectedFile} projectUsers={projectUsers} />
        ))}
      </div>

      {/* Footer displaying Project ID */}
      <div className="w-full bg-[#2d2d2d] text-white py-2 flex justify-center items-center mt-4">
        <div className="text-center">
          <span>Room ID:</span>
          <br />
          <span>{projectId}</span>
        </div>
      </div>
    </div>

  )
}

export default FileTree




// Test project
// http://localhost:5173/editor/686ae1ed9e2e11f2cbeac403/