import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

export class ImagesDao {
   
    constructor(
        private logger: any = createLogger('images-dao'),
        private uploadId = uuid.v4(),
        private readonly s3: AWS.S3 = ImagesDao.createS3Client(),
        private readonly bucketName = process.env.S3_BUCKET_NAME,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}

    static createS3Client() {
            return new XAWS.S3({
             signatureVersion:'v4'               
        })
    }   
    get getBucketName() {
        return this.bucketName
    }

    async getUploadUrl(todoId: string) {

            this.logger.info('Getting PreSignedURL', {
                uploadId: this.uploadId
        })

        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        })
    }
}