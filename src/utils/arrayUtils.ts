type Item = {
  id: string
}

export function removeItemAtIndex<TItem>(
  array: TItem[],
  index: number
) {
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function hasNonEmptyObject(obj, keysToCheck) {
  for (let key of keysToCheck) {
      if (obj.hasOwnProperty(key) && Object.keys(obj[key]).length > 0) {
          return true;
      }
  }
  return false;
}

export function insertItemAtIndex<TItem>(
  array: TItem[],
  item: TItem,
  index: number
) {
  return [...array.slice(0, index), item, ...array.slice(index)]
}

export const findItemIndexById = <TItem extends Item>(
  items: TItem[],
  id: string
) => {
  return items.findIndex((item: TItem) => item.id === id)
}

export const moveItem = <TItem>(
  array: TItem[],
  from: number,
  to: number
) => {
  const item = array[from]
  return insertItemAtIndex(removeItemAtIndex(array, from), item, to)
}

export const findTaskIndex = (id: string, draft: any) => {
  // Check in lists
  for (let i = 0; i < draft.lists.length; i++) {
    const taskIndex = draft.lists[i].tasks.findIndex((task: any) => task.id === id);
    if (taskIndex !== -1) {
      return { location: 'lists', listIndex: i, taskIndex };
    }
  }

  // Check in archive
  for (let i = 0; i < draft.archive.length; i++) {
    const taskIndex = draft.archive[i].tasks.findIndex((task: any) => task.id === id);
    if (taskIndex !== -1) {
      return { location: 'archive', listIndex: i, taskIndex };
    }
  }

  // Task not found
  return { location: 'none', listIndex: -1, taskIndex: -1 };
};


