import AWS from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
import dotenv from 'dotenv'
dotenv.config()

//configure aws
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
})

const s3 = new AWS.S3()

//multer config
export const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET,
        acl: 'public-read',
        metadata: (req,file,cb) => {
            cb(null, {fieldName: file.fieldname})
        },
        key: (req,file,cb) => {
            const fileName = `transactions/${Date.now()}_${file.originalname}`
            cb(null, fileName)
        }
    })
})