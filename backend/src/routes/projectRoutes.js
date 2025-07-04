import { Router } from 'express'
import { fetchFileTree } from '../controllers/project.controller'

const projectRoutes = Router()

projectRoutes.route("/projects/:projectId").get(fetchFileTree)

export default projectRoutes