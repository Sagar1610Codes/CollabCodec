import { Project } from "../models/Project.model";
import { ApiError } from "../utils/ApiError.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

const fetchFileTree = asyncHandler( async (req,res) => {
    const projectId = req.params.projectId

    let project;
    try {
        project = await Project.findById(projectId)

        if( !project ){
            throw new ApiError(404,"Project Not Found")
        }
    } catch (error) {
        throw new ApiError(500,"Server Error in fetchFileTree :", error)
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                project.files,
                "Successfully Fetched FileTree"
            )
        )
})

const addFolder = asyncHandler( async (req,res) => {
    const projectId = req.params.projectId
    const folderPath = req.body

    if( !folderPath ){
        throw new ApiError(404, "Folder Path is required")
    }

    try {
        const project = await Project.findById(projectId)

        if( !project ){
            throw new ApiError(404, "Project not Found")
        }

        const folderExists = project.files.some((item) => item.path === folderPath )

        if( folderExists ){
            throw new ApiError(400, "Folder Already Exists")
        }

        project.files.push({path : folderPath, type : 'Folder'})
        await project.save()

    } catch (error) {
        throw new ApiError(500, "Server Error in addFolder :", error)        
    }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Folder Created Successfully"
            )
        )
})

const addFile = asyncHandler(async (req,res) => {
    const projectId = req.params.projectId
    const { filePath , content = ''} = req.body

    if( !filePath ){
        throw new ApiError(404, "FilePath is required")
    }

    try {
        const project = await Project.findById(projectId)
        if( !project ){
            throw new ApiError(404, "Project Not Found")
        }

        const fileExists = project.files.some( (item) => item.path === filePath )
        if( fileExists ){
            throw new ApiError(400, "File Already Exists")
        }

        project.files.push({path : filePath, type : 'File', content})
        await project.save()

    } catch (error) {
        throw new ApiError(500, "Server Error in addFile :", error)
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "File Created Successfully"
            )
        )
})

export {
    fetchFileTree,
    addFolder,
    addFile
}