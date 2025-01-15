export type Action =
  | {
      type: "ADD_LIST"
      payload: {
        text: string,
        department: string,
        processSave?: boolean,
        id?: string
      }
    }
  | {
      type: "REMOVE_LIST",
      payload: {
        listId: string,
        processSave?: boolean
      }
    }
  |{
    type: "MOVE_TO_ARCHIVE",
    payload: {
      listId: string,
      processSave?: boolean
    }
    }
| {
  type: "MOVE_FROM_ARCHIVE",
      payload: {
    listId: string,
    processSave?: boolean
  }
  }
| {
  type: "ADD_SAVED_TASK_TO_PROJECT",
  payload: {
    projectId: string,
    materialId: string,
    processSave?: boolean
  }
  }
  | {
      type: "ADD_TASK"
      payload: {
        text: string,
        listId: string,
        article: string,
        price: string,
        quantity: number,
        date: Date,
        unit: string,
        comment: string,
        orderedBy: string,
        deliveryDate: Date,
        status: string,
        payment: string,
        processSave?: boolean
        id?: string
      }
    }


    | {
      type: "EDIT_TASK"
      payload: {
        id: string,
        listId: string,
        text: string,
        article: string,
        price: string,
        quantity: number,
        date: Date,
        unit: string,
        comment: string,
        deliveryDate: Date,
        orderedBy: string,
        status: string,
        payment: string,
        processSave?: boolean
      }
    }
  
  | {
      type: "REMOVE_TASK"
      payload: { 
        listId: string, 
        taskId: string, 
        processSave?: boolean 
      }
    }
  | {
    type: "RESET_REQUESTS",
    payload: {}
  }

export const addTask = (
    text: string,
    listId: string,
    article: string,
    price: string,
    quantity: number,
    date: Date,
    unit: string,
    comment: string,
    deliveryDate: Date,
    orderedBy: string,
    status: string,
    payment: string,
    processSave: boolean = true,
    id?: string
): Action => ({
  type: "ADD_TASK",
  payload: {
    text,
    listId,
    price,
    article,
    quantity,
    date,
    unit,
    comment,
    deliveryDate,
    orderedBy,
    status,
    payment,
    processSave,
    id
  }
});

export const editTask = (
    id: string,
    listId: string,
    text: string,
    article: string,
    price: string,
    quantity: number,
    date: Date,
    unit: string,
    comment: string,
    deliveryDate: Date,
    orderedBy: string,
    status: string,
    payment: string,
    processSave: boolean = true
) :Action => ({
  type: "EDIT_TASK",
  payload: {
    id,
    listId,
    text,
    article,
    price,
    quantity,
    date,
    unit,
    comment,
    deliveryDate,
    orderedBy,
    status,
    payment,
    processSave
  },
});


export const addList = (text: string, department: string, processSave: boolean=true, id?: string): Action => ({
  type: "ADD_LIST",
  payload: {
    text,
    department,
    processSave,
    id
  }
})

export const removeList = (listId: string, processSave: boolean = true): Action => ({
  type: "REMOVE_LIST",
  payload: {
    listId,
    processSave
  }
})

export const moveToArchive = (listId: string, processSave: boolean = true) : Action => ({
  type: "MOVE_TO_ARCHIVE",
  payload: {listId, processSave},
});

export const moveFromArchive = (listId: string, processSave: boolean = true) : Action => ({
  type: "MOVE_FROM_ARCHIVE",
  payload: {listId, processSave},
});

export const removeTask = (listId: string, taskId: string, processSave: boolean = true): Action => ({
  type: "REMOVE_TASK",
  payload:{
  listId,
  taskId,
  processSave
  }
})

export const resetRequests = (): Action => ({
  type: "RESET_REQUESTS",
  payload: {}
})