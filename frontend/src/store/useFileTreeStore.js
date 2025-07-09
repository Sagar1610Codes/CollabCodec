import { create } from 'zustand';
import axiosInstance from '../lib/axios.js';

const useFileTreeStore = create((set,get) => ({
    fileTreeData : null,

    fetchFileTreeData : async (projectId) => {
        try {
            const res = await axiosInstance.get(`/projects/${projectId}/fetchFiles`)
            // console.log("res in fetchFileTreeData :",res)
            const data = res.data.data
            set({ fileTreeData : data })
        } catch (error) {
            console.error("Error in fetchFileTreeData : ", error)   
        }
    },

    addFile : async ( projectId, filePath ) => {
        try {
            const res = await axiosInstance.post(`/projects/${projectId}/addFile`,{filePath})
            console.log("res in addFile :",res)
            if(res.statusText === "OK"){
                console.log("Refetching filetree")
                get().fetchFileTreeData(projectId)
            }
        } catch (error) {
            console.error("Error in addFile :", error)
        }
    },

    addFolder : async ( projectId, folderPath ) => {
        try {
            const res = await axiosInstance.post(`/projects/${projectId}/addFolder`,{folderPath})
            
            if(res.statusText === "OK"){
                console.log("Refetching filetree")
                get().fetchFileTreeData(projectId)
            }
        } catch (error) {
            console.error("Error in addFolder :", error)
        }
    },
}))

export { useFileTreeStore }