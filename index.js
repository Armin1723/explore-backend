require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectToDB = require('./databaseConnection');
const cookieParser = require('cookie-parser');
const advertisementCron = require('./cron/advertisementCron.js');

const userRoutes = require('./routes/userRoutes.js');
const companyRoutes = require('./routes/companyRoutes.js')

const path = require('path');
const fs = require('fs');
const { fileURLToPath } = require('url');

// Get the current directory in an ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure the 'temp' directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, 'https://explore-main.netlify.app'],
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));    
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'https://explore-main.netlify.app'],
    credentials: true
}));
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/", 
  })
);

// Database Connection
connectToDB();

//Cron Jobs
advertisementCron();

app.get('/', (req, res) => {
    res.send('Hello from explore backend');
});

// Routes
app.use('/api/user', userRoutes(io))
app.use('/api/company', companyRoutes(io))
app.use('/api/enquiries', require('./routes/enquiryRoutes.js'))
app.use('/api/admin', require('./routes/adminRoutes.js'))
app.use('/api/advertisement', require('./routes/advertisementRoutes.js'))
app.use('/api/categories', require('./routes/categoryRoutes.js'))


server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})