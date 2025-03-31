import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
dotenv.config();

//Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
})

//Upload file to S3 bucket
export const uploadToBucket = async (fileBuffer, fileName, fileType, userId, location) => {
    try{
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: location == "transaction" ? `user-${userId}/transactions/${fileName}` : `user-${userId}/${fileName}` ,
                Body: fileBuffer,
                ContentType: fileType,
            },
        });

        const result = await upload.done();
        return result
    }
    catch(error){
        console.log(error)
        throw new Error("Error uploading file")
    }
}

//Delete file from S3 bucket
export const deleteFromBucket = async (fileName, userId) => {
    try{
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `user-${userId}/transactions/${fileName}`,
            })
        )
    }
    catch(error){
        console.log(error)
        throw new Error("Error deleting file")
    }
}