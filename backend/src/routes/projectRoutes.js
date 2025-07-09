import { Router } from 'express'
import { addFile, addFolder, createProject, fetchFileContent, fetchFileTree, saveFileContent } from '../controllers/project.controller.js'

const projectRoutes = Router()

projectRoutes.route("/create").post(createProject)

projectRoutes.route("/:projectId/fetchFiles").get(fetchFileTree)

projectRoutes.route("/:projectId/addFile").post(addFile)

projectRoutes.route("/:projectId/addFolder").post(addFolder)

projectRoutes.route("/:projectId/saveFileContent").post(saveFileContent)

projectRoutes.route("/:projectId/fetchFileContent").get(fetchFileContent)
export default projectRoutes
