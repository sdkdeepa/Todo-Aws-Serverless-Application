import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('images-dao')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export class ImagesDao {
    constructor(
        private readonly bucketName = process.env.S3_BUCKET_NAME,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) { }

    async getSignedUrl(todoId: string): Promise<string> {
        const signedUrl = s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        })
        logger.info("Retrieved signed url", {signedUrl, todoId})
        return signedUrl
    }
}