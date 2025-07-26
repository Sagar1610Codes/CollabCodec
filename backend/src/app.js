import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes.js';
import { ApiError } from './utils/ApiError.util.js';
dotenv.config({
    path: './.env'
});

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL ,  // local host and network ip both compatible
    credentials: true
}))

app.use(express.json());

app.use('/api/projects', projectRoutes);

// app.use('/api/projects', (req,res) => {
//     res.send('Projects')
// });


// Catch-all 404 handler (use your ApiError)
app.use((req, res, next) => {
    next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`));
});


// ✅ Global error handler (must be last)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: err.success || false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        data: err.data || null,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export { app }