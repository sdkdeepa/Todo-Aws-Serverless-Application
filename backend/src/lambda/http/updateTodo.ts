import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {updateTodo} from "../../businessLogic/ToDo";
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    
    const todoId = event.pathParameters.todoId;
    const updatedProperties: UpdateTodoRequest = JSON.parse(event.body) 
    console.log("Processing update Event ", {updatedProperties});
    if(!todoId){
    return {
        statusCode: 400,
        body: JSON.stringify({error: 'Todo is missing'})
    }
}

    const userId = getUserId(event)
        console.log("Updating a todo of user", {userId, todoId})
        await updateTodo(todoId, userId, updatedProperties)

        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}