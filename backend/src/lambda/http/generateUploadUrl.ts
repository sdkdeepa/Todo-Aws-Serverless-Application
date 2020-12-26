import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import { getSignedUrl, updateAttachmentUrl} from "../../businessLogic/ToDo"
import * as middy from 'middy'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('generate-upload-url-todo')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    console.log("Processing Event ", event);
    const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'todoId parameter is required' })
    }
  }

  const userId = getUserId(event)
  logger.info("Getting signed URL for todo", {todoId, userId})

  const signedUrl: string = await getSignedUrl(todoId)
  logger.info("Got signed URL for todo", {signedUrl})

  await updateAttachmentUrl(signedUrl, todoId, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },    
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
})

