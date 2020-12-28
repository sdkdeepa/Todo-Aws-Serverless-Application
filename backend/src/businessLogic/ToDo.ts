import { TodoItem } from '../models/TodoItem'
import { TodosDao } from '../dataLayer/TodoDao'
import { ImagesDao } from '../dataLayer/ImagesDao'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('todo-business')
const todoDao = new TodosDao()
const imagesDao = new ImagesDao()

//Get all the TODO items for the user

export async function getTodos(userId: string): Promise<TodoItem[]> {
    return await todoDao.getTodos(userId)
}

//Create a TODO
export async function createTodo(newTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4()
    logger.info('Create TODO with generated uuid', { todoId })

    const newTodoItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        ...newTodoRequest,
        done: false
    }


    return await todoDao.createTodo(newTodoItem)
}

// Remove an item from TODO by id
 
export async function deleteTodo(todoId: string, userId: string) {
    return await todoDao.deleteTodo(todoId, userId)
}

// Update an item from TODO by id
 
export async function updateTodo(todoId: string, userId: string, updatedProperties: UpdateTodoRequest) {
    return await todoDao.updateTodo(todoId, userId, updatedProperties)
}

//Get a generated signed url to put an image
// export async function getSignedUrl(todoId: string, userId: string ): Promise<string> {
//     return await imagesDao.getSignedUrl(todoId, userId)
// }

  export async function getUploadUrl(userId: string, todoId: string): Promise<string> {

    logger.info('Entering Business Logic function');

    // Write final url to datastore
    await todoDao.updateAttachmentUrl(userId, todoId, imagesDao.getBucketName)


    return await imagesDao.getUploadUrl(todoId)
  }

//Update a todo with an attachmentUrl (image)
 
export async function updateAttachmentUrl(signedUrl: string, todoId: string, userId: string) {
    
    const attachmentUrl: string = signedUrl.split("?")[0]
    logger.info("Found the attachment url from signed url", {attachmentUrl})
    return await todoDao.updateAttachmentUrl(attachmentUrl, todoId, userId)
}
