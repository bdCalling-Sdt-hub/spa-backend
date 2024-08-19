import  path from 'path';
// Import the 'express' module
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import logger from './logger/logger';



// Create an Express application
const app: Application = express();

//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.static("public"));
// app.use("/public", express.static(__dirname + "/public"));

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

//application router
app.use('/api/v1',router)


// Set the port number for the server

// Define a route for the root path ('/')
app.get('/', (req: Request, res: Response) => {
  logger.info('Root endpoint hit');
  res.send('Hello, This is Ahad Hossaion Aiman from Bangladesh!');
});

app.all('*',notFound)
app.use(globalErrorHandler)


// Log errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
  next(err);
});


// Start the server and listen on the specified port



export default app