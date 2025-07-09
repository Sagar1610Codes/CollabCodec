import http from 'http';
import connectDB from './db/connect.db.js';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});
import { app } from './app.js';
import { setupSocketIO } from './socket/socket.js';

const server = http.createServer(app)

setupSocketIO(server)

connectDB()
.then(() => {
    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB Connection failed ", err)
})


export default server