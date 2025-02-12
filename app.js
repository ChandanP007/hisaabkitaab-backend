import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

import connectDB from './config/db.connection.js'
import userRoutes from './routes/route.user.js'
import transactionRoutes from './routes/route.transaction.js'

//env variables
dotenv.config()

//app initialization
export const app = express()

//middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({limit : '10kb'}))


//routes
app.use('/api/users', userRoutes)
app.use('/api/transactions', transactionRoutes)


connectDB(process.env.MONGO_URI)

app.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}`)
})
