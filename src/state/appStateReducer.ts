import { Action } from "./actions"
import { nanoid } from "nanoid"
import { DragItem } from "../components/DragItem"
import {findItemIndexById, findTaskIndex, moveItem, removeItemAtIndex} from "../utils/arrayUtils"
import { getCurrentDateAndTime } from "../utils/timeUtils"
import { BreakfastDiningOutlined } from "@mui/icons-material"
import { eventEmitter } from "./EventEmitter"


export const appStateReducer = (
  draft: AppState,
  action: Action
): AppState | void => {
  switch (action.type) {
    case "ADD_LIST": {
      const {text, department, processSave, id} = action.payload;
      draft.processSave = processSave;
      const newList = {
        id: id || nanoid(),
        department: department,
        text: text,
        tasks: []
      }

      draft.lists.unshift(newList)

      if (processSave){
        eventEmitter.emit('added_list', newList)
        draft.listsToAdd[newList.id] = newList
      }
        break
    }
    case "ADD_TASK": {
      const { text, listId, article, price, quantity, date, unit, comment, deliveryDate, orderedBy, status, payment, processSave, id} = action.payload;
      draft.processSave = processSave;
      let targetListIndex: number = findItemIndexById(draft.lists, listId);
      const newTask: Task =  {
        id: id || nanoid(),
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
      }

      if (targetListIndex !== -1) {
        draft.lists[targetListIndex].tasks.push(newTask);
        if (processSave) {
        draft.listsToUpdate[draft.lists[targetListIndex]._id || draft.lists[targetListIndex].id] = draft.lists[targetListIndex].tasks
        eventEmitter.emit('added_material', {projectId: listId, material: newTask})
        }
      }
      else {
        targetListIndex = findItemIndexById(draft.archive, listId);
        if (targetListIndex === -1)
          return ;
        draft.archive[targetListIndex].tasks.push(newTask);
        if (processSave){
        draft.archiveToUpdate[draft.archive[targetListIndex]._id || draft.archive[targetListIndex].id] = draft.archive[targetListIndex].tasks
        eventEmitter.emit('added_material', {projectId: listId, material: newTask})
        }
      }
      break;
    }
    case "EDIT_TASK": {
      const { id, listId, text,article, price, quantity, date, unit, comment, deliveryDate, orderedBy, status, payment, processSave } = action.payload;
      const { location, listIndex, taskIndex }= findTaskIndex(id, draft)
      draft.processSave = processSave;
      if (taskIndex !== -1 && listIndex !== -1) {
        const task = location === 'lists' ? draft.lists[listIndex].tasks[taskIndex] : draft.archive[listIndex].tasks[taskIndex];
        
        const isTextChanged = text !== undefined && text !== task.text;
        const isArticleChanged = article !== undefined && article !== task.article;
        
        task.text = text ?? task.text;
        task.article = article ?? task.article;
        task.price = price ?? task.price;
        task.quantity = quantity ?? task.quantity;
        task.date = date ?? task.date;
        task.unit = unit ?? task.unit;
        task.comment = comment ?? task.comment;
        task.deliveryDate = deliveryDate ?? task.deliveryDate;
        task.orderedBy = orderedBy ?? task.orderedBy;
        task.status = status ?? task.status;
        task.payment = payment ?? task.payment;

        if (isTextChanged || isArticleChanged) {
          const currentDate = getCurrentDateAndTime();
          task.date = currentDate;
        }
        if (!processSave) break
        location === 'lists' 
        ? draft.listsToUpdate[draft.lists[listIndex]._id || draft.lists[listIndex].id] = draft.lists[listIndex].tasks
        : draft.archiveToUpdate[draft.archive[listIndex]._id || draft.archive[listIndex].id] = draft.archive[listIndex].tasks
      }
      break;
    }


    case "REMOVE_LIST": {
        const { listId, processSave } = action.payload
        draft.processSave = processSave;
        const targetListIndex = findItemIndexById(draft.lists, listId);

        if (targetListIndex !== -1){
          if (processSave){ 
            draft.listsToRemove[draft.lists[targetListIndex]._id || draft.lists[targetListIndex].id] = 1
            eventEmitter.emit("remove_list", listId)
          }
          draft.lists = draft.lists.filter(list => list.id !== listId);
        } else {
          const targetListIndex = findItemIndexById(draft.archive, listId);
          if (processSave){ 
            draft.archiveToRemove[draft.archive[targetListIndex]._id || draft.archive[targetListIndex].id] = 1;
            eventEmitter.emit("remove_list", listId)
          }
          draft.archive = draft.archive.filter(list => list.id !== listId);
        }
        break;
      }
    case "MOVE_TO_ARCHIVE":{
      const {listId, processSave} = action.payload
      draft.processSave = processSave
      const listIndex  = findItemIndexById(draft.lists, listId);
      if (listIndex < 0) return; // If list not found, exit the case

      const listToArchive = draft.lists[listIndex];
      if (processSave){
        draft.archiveToAdd[draft.lists[listIndex]._id || draft.lists[listIndex].id] = draft.lists[listIndex];
        draft.listsToRemove[draft.lists[listIndex]._id || draft.lists[listIndex].id] = 1; 
        eventEmitter.emit("move_to_archive", listId)
      }
      draft.archive.push(listToArchive); // Add the list to archive
      draft.lists.splice(listIndex, 1); // Remove the list from lists
      
      break;

    }
    case "MOVE_FROM_ARCHIVE":{
      const {listId, processSave} = action.payload
      draft.processSave = processSave;
      const listIndex  = findItemIndexById(draft.archive, listId);
      if (listIndex < 0) return; // If list not found, exit the case
      const listFromArchive = draft.archive[listIndex];
      if (processSave){
        draft.archiveToRemove[draft.archive[listIndex]._id || draft.archive[listIndex].id ] = 1;
        draft.listsToAdd[draft.archive[listIndex]._id || draft.archive[listIndex].id] = draft.archive[listIndex];
        eventEmitter.emit('move_from_archive',listId)
      }
      draft.lists.unshift(listFromArchive); // Add the list to archive
      draft.archive.splice(listIndex, 1); // Remove the list from lists

      break;

    }
      case "REMOVE_TASK": {
        const { listId, taskId, processSave } = action.payload;
        draft.processSave = processSave;
          let targetListIndex = findItemIndexById(draft.lists, listId);
          if (targetListIndex > -1) {
            draft.lists[targetListIndex].tasks = draft.lists[targetListIndex].tasks.filter(task => task.id !== taskId);
            if (processSave) {
              draft.listsToUpdate[draft.lists[targetListIndex]._id || draft.lists[targetListIndex].id] = draft.lists[targetListIndex].tasks
              eventEmitter.emit('removed_material', {projectId: listId, material: taskId})
            }
          }
          else {
            targetListIndex = findItemIndexById(draft.archive, listId);
            if (targetListIndex === -1) return;
            draft.archive[targetListIndex].tasks = draft.archive[targetListIndex].tasks.filter(task => task.id !== taskId);
            if (processSave){ 
              draft.archiveToUpdate[draft.archive[targetListIndex]._id || draft.archive[targetListIndex].id] = draft.archiveToAdd[targetListIndex].tasks
              eventEmitter.emit('removed_material', {projectId: listId, material: taskId})
            }
          }
          break;
        
      }
      case "ADD_SAVED_TASK_TO_PROJECT": {
        const {projectId, materialId} = action.payload
        let targetListIndex = findItemIndexById(draft.lists, projectId);
        break;
      }
      case "RESET_REQUESTS": {
        draft.listsToAdd = {}
        draft.listsToRemove = {}
        draft.listsToUpdate = {}
        draft.archiveToAdd = {}
        draft.archiveToRemove = {}
        draft.archiveToUpdate = {}
        break;
      }
    default: {
      break
    }
  }
}
