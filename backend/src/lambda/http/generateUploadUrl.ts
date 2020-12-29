import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import { getUploadUrl} from '../../businessLogic/ToDo';
import * as middy from 'middy';
import { getUserId } from '../utils'


const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.debug("Processing generateUploadUrl event", {event})

  const todoId = event.pathParameters.todoId
  console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'todoId parameter is missing' })
    }
  }
  const userId = getUserId(event)
  logger.info("Getting signed URL for todo", {todoId, userId})

  const signedUrl:string  = await getUploadUrl(todoId,jwtToken)
  logger.info("Got signed URL for todo", {signedUrl})

  // Return presigned url to client
  return {
    statusCode: 201,
    body: JSON.stringify({
       uploadUrl: signedUrl
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Credentials': true
    }
  } 
})