import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {deleteTodo} from "../../businessLogic/ToDo";
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete-todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug("Processing delete todo event", {event})
  const todoId = event.pathParameters.todoId
  // TODO: Remove a TODO item by id
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing todoId' })
    }
  }

  const userId = getUserId(event)
  logger.info("Deleting todo for user", {userId, todoId})

  await deleteTodo(todoId, userId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
}
