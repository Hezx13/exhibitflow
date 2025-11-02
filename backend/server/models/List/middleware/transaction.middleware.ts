import { Schema } from 'mongoose';
import List, { List as IList, ITask, Payment } from '../list.model';
import Transaction from 'server/models/transaction.model';

const createOrUpdateTransactionsForTasks = async (tasks: ITask[], department: string) => {
  // Filter out tasks without price or quantity
  const validTasks = tasks.filter((task) => task.price && task.quantity);
  if (validTasks.length === 0) return;

  // Get all existing transactions for these tasks in one query
  const taskIds = validTasks.map((task) => task._id!.toString());
  const existingTransactions = await Transaction.find({
    reference: { $in: taskIds },
  });

  // Create a map for quick lookup of existing transactions
  const transactionMap = new Map(existingTransactions.map((t) => [t.reference, t]));

  // Prepare bulk operations
  const bulkOps = validTasks
    .map((task) => {
      const amount = task.price! * task.quantity!;
      if (isNaN(amount)) return null;

      const existingTransaction = transactionMap.get(task._id!.toString());
      const transactionData = {
        date: existingTransaction ? existingTransaction.date : new Date(),
        account: task.payment as Payment,
        debit: 0,
        credit: amount,
        currency: 'AED', // make this configurable
        description: task.name,
        reference: task._id!.toString(),
        department,
      };

      if (existingTransaction) {
        return {
          updateOne: {
            filter: { _id: existingTransaction._id },
            update: transactionData,
          },
        };
      } else {
        return {
          insertOne: {
            document: transactionData,
          },
        };
      }
    })
    .filter((op) => op !== null);

  if (bulkOps.length > 0) {
    await Transaction.bulkWrite(bulkOps);
  }
};

export function setupTransactionMiddleware(schema: Schema<IList>) {
  console.log('setupTransactionMiddleware');

  schema.post('findOneAndUpdate', async function (list) {
    console.log('findOneAndUpdate');
    const update = this.getUpdate() as any;

    // Handle full array update
    if (update?.$set?.tasks) {
      const validTasks = update.$set.tasks.filter((task: ITask) => task.price && task.quantity);
      if (validTasks.length > 0) {
        await createOrUpdateTransactionsForTasks(validTasks, list.department);
      }
    }

    // Handle single element update using $ operator
    const taskKeys = Object.keys(update?.$set || {}).filter((key) => key.startsWith('tasks.'));
    if (taskKeys.length > 0) {
      // We need to fetch the updated document to get the full tasks array
      const updatedDoc = await List.findOne(this.getQuery());
      if (updatedDoc?.tasks) {
        const validTasks = updatedDoc.tasks.filter((task) => task.price && task.quantity);
        if (validTasks.length > 0) {
          await createOrUpdateTransactionsForTasks(validTasks, list.department);
        }
      }
    }
  });

  schema.post('updateOne', async function (list) {
    console.log('updateOne');
    const update = this.getUpdate() as any;

    // Handle full array update
    if (update?.$set?.tasks || update?.$push?.tasks || update?.$pull?.tasks) {
      const tasksToAdd = update?.$push?.tasks || [];
      const tasksToRemove = update?.$pull?.tasks?._id?.$in || []; // Extract IDs from $pull query
      console.log('tasksToRemove', tasksToRemove);
      const tasksToUpdate = update?.$set?.tasks || [];
      const validTasks = [...tasksToAdd, ...tasksToUpdate].filter(
        (task: ITask) => task.price && task.quantity
      );
      if (validTasks.length > 0) {
        await createOrUpdateTransactionsForTasks(validTasks, list.department);
      }
      if (tasksToRemove.length > 0) {
        await Transaction.deleteMany({
          reference: { $in: tasksToRemove.map((id: any) => id.toString()) },
        });
      }
    }

    // Handle single element update using $ operator
    const taskKeys = Object.keys(update?.$set || {}).filter((key) => key.startsWith('tasks.'));

    if (taskKeys.length > 0) {
      const updatedDoc = await List.findOne(this.getQuery());
      if (updatedDoc?.tasks) {
        const validTasks = updatedDoc.tasks.filter((task) => task.price && task.quantity);
        if (validTasks.length > 0) {
          await createOrUpdateTransactionsForTasks(validTasks, list.department);
        }
      }
    }
  });

  schema.post('save', async function (list: IList) {
    const oldList = await List.findById(list._id);
    if (!oldList) return;

    const oldTaskIds = oldList.tasks.map((task: ITask) => task._id.toString());
    const currentTaskIds = list.tasks?.map((task: ITask) => task._id.toString()) ?? [];
    const removedTaskIds = oldTaskIds.filter((id) => !currentTaskIds.includes(id));

    if (removedTaskIds.length > 0) {
      await Transaction.deleteMany({ reference: { $in: removedTaskIds } });
    }

    const validTasks = list.tasks?.filter((task) => task.price && task.quantity) ?? [];
    if (validTasks.length > 0) {
      await createOrUpdateTransactionsForTasks(validTasks, list.department);
    }
  });

  schema.post('deleteOne', async function (list: IList) {
    console.log('deleteOne');
    const taskIds = list.tasks.map((task: ITask) => task._id.toString());
    await Transaction.deleteMany({ reference: { $in: taskIds } });
  });

  schema.post('deleteMany', async function () {
    console.log('deleteMany');
    const lists = await this.model.find(this.getQuery());
    const taskIds = lists.flatMap((list: IList) =>
      list.tasks.map((task: ITask) => task._id.toString())
    );
    await Transaction.deleteMany({ reference: { $in: taskIds } });
  });

  schema.post('insertMany', async function (docs: IList[]) {
    console.log('insertMany');
    const validTasks = docs.flatMap((list) =>
      list.tasks.filter((task) => task.price && task.quantity)
    );
    if (validTasks.length > 0) {
      await createOrUpdateTransactionsForTasks(validTasks, docs[0]?.department || '');
    }
  });
}
