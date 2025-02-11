import {connect} from 'mongoose'

const connectDB = async (dbUri) => {
    try{
        const respone = await connect(dbUri)
        console.log(`MongoDB connected: ${respone.connection.host}`)
    }
    catch(error){
        console.error("Error connecting to the database ", error)
        process.exit(1)
    }
}
export default connectDB;