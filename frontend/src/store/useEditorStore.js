import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useEditorStore = create((set) => ({
    fileContent: '',
    showEditor: false,
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
        set({ loading : true, showEditor: false })
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
            console.log("fileContent changed in Store : ", useEditorStore.getState().fileContent)
            set({ loading : false, showEditor: true })
        }
    }
}))

export default useEditorStore