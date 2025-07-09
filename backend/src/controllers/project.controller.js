import { Project } from "../models/Project.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import mongoose from "mongoose";

const createProject = asyncHandler(async (req, res) => {
    console.log(req.body)
    const name = req.body.name

    if (!name) {
        throw new ApiError(400, "Project name is required")
    }

    let newProject;
    try {
        newProject = new Project({
            projectName: name,
            files: [
                { path: `${name}`, type: 'folder' }
            ]
        })

        await newProject.save()
        console.log("newProjectId :", newProject._id)
    } catch (error) {
        throw new ApiError(500, "Server error in createProject :", error)
        console.log("Server error in createProject :", error)
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newProject._id
            )
        )
})

const fetchFileTree = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId

    let sortedFiles;
    try {
        const result = await Project.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(projectId) }
            },
            {
                $unwind: '$files'
            },
            {
                $addFields: {
                    sortType: {
                        $cond: [{ $eq: ['$files.type', 'folder'] }, 0, 1] // folders first
                    }
                }
            },
            {
                $sort: {
                    sortType: 1,
                    'files.path': 1
                }
            },
            {
                $group: {
                    _id: '$_id',
                    files: { $push: '$files' }
                }
            }
        ]);

        if (!result || result.length === 0) {
            throw new ApiError(404, 'Project Not Found');
        }

        sortedFiles = result[0].files;

    } catch (error) {
        throw new ApiError(500, "Server Error in fetchFileTree :", error)
    }

    // console.log("projectFiles in fetchFileTree:", sortedFiles)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                sortedFiles,
                "Successfully Fetched FileTree"
            )
        )
})

const saveFileContent = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId
    const filePath = req.body.filePath
    const content = req.body.content

    // console.log("req.body in saveFileContent :",req.body)

    if (!filePath) {
        throw new ApiError(400, "filePath is required")
    }
    try {

        const project = await Project.findById(projectId)

        if (!project) {
            throw new ApiError(404, "Project not found")
        }

        const file = project.files.find((item) => item.path === filePath)
        if (!file) {
            throw new ApiError(404, "File not found")
        }

        file.content = content
        await project.save()

        console.log("Updated File : ", file)
    } catch (error) {
        console.log("Error in the saveFileContent :", error)
        throw new ApiError(500, "Error in saveFileContent")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "File Contents Saved"
            )
        )
})

const fetchFileContent = asyncHandler(async (req, res) => {
    // console.log("req.body in fetchFileContent :",req.body)
    const projectId = req.params.projectId
    const filePath = req.query.filePath
    console.log("filePath :",filePath)

    let content;
    try {
        const project = await Project.findById(projectId)

        if (!project) {
            throw new ApiError(404, "Project not found")
        }

        const file = project.files.find((item) => item.path === filePath)

        if (!file || file.type !== 'file') {
            throw new ApiError(404, "File not found")
        }

        content = file.content 

        console.log("Content of file at " , filePath, " :", content)
    } catch (error) {
        console.log("Error in fetchFileContent :",error)
        throw new ApiError(500, "Error in fetchFileContent ")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                content,
                "Content of File fetched"
            )
        )
})

const addFolder = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId
    const folderPath = req.body.folderPath

    if (!folderPath) {
        throw new ApiError(404, "Folder Path is required")
    }

    try {
        const project = await Project.findById(projectId)

        if (!project) {
            throw new ApiError(404, "Project not Found")
        }

        const folderExists = project.files.some((item) => item.path === folderPath)

        if (folderExists) {
            throw new ApiError(400, "Folder Already Exists")
        }

        project.files.push({ path: folderPath, type: 'folder' })
        await project.save()

        console.log("projectFiles after addFolder : ", project.files)

    } catch (error) {
        console.log("Server Error in addFolder :", error)
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

const addFile = asyncHandler(async (req, res) => {
    console.log(req.body)

    const projectId = req.params.projectId
    const filePath = req.body.filePath
    const content = ''

    if (!filePath) {
        throw new ApiError(404, "FilePath is required")
    }

    try {
        const project = await Project.findById(projectId)
        if (!project) {
            throw new ApiError(404, "Project Not Found")
        }

        const fileExists = project.files.some((item) => item.path === filePath)
        if (fileExists) {
            throw new ApiError(400, "File Already Exists")
        }

        project.files.push({ path: filePath, type: 'file', content })
        await project.save()

        console.log("projectFiles after addFile : ", project.files)
    } catch (error) {
        console.log("Server Error in addFile :", error)
        throw new ApiError(500, "Server Error in addFile ")
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
    createProject,
    fetchFileTree,
    saveFileContent,
    fetchFileContent,
    addFolder,
    addFile
}