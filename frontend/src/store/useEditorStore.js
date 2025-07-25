import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useEditorStore = create((set) => ({
    fileContent: '',
    loading : false,

    saveContentToDB: async (projectId, filePath, content) => {
        
        try {
            const res = await axiosInstance.post(`/projects/${projectId}/saveFileContent`, { filePath, content })

            // console.log("res in saveContentToDB :",res)
            if (res.statusText === 'OK') {
                console.log("Content saved in file :", filePath)
            }

        } catch (error) {
            console.error("Error in saveContentToDB :", error)
        }
    },

    fetchContentFromDB: async (projectId, filePath) => {
        set({ loading : true })
        try {
            const res = await axiosInstance.get(`/projects/${projectId}/fetchFileContent`, { 
                params: { filePath } // Send filePath as a query parameter
             })

            // console.log("res in fetchContentFromDB :", res)
            set({ fileContent : res.data.data })
            
        } catch (error) {
            console.error("Error in fetchContentFromDB :", error)
            
        }
        finally {
            set({ loading : false })
            // console.log("fileContent changed in Store : ", useEditorStore.getState().fileContent)
        }
    }
}))

export default useEditorStore