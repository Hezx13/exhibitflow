import mongoose, { Document, Schema } from 'mongoose';
import { generateKeyBetween } from 'fractional-indexing-jittered';
import { setupTransactionMiddleware } from './middleware/transaction.middleware';

interface ITask extends Document {
  _id: string;
  name: string;
  article: string;
  price: number | null;
  quantity: number | null;
  date: Date;
  unit: string;
  comment: string;
  deliveryDate: Date | null;
  orderedBy: string;
  status: Status;
  payment: string;
  listParent?: { id: string; name: string };
  positionKey: string;
}

interface Position {
  parentId: string | null;
  index: number;
}

enum Status {
  PENDING = 'pending',
  IN_PROCESS = 'in process',
  WAITING_FOR_APPROVAL = 'waiting for approval',
  WAITING_FOR_PAYMENT = 'waiting for payment',
  DONE = 'done',
}

interface List extends Document {
  name: string;
  department: string;
  tasks: ITask[];
  parentId: string | null;
  index: number;
  positionKey: string;
  path: string[];
  isActive: boolean;
  hasUnfinishedTasks: boolean;
  updatedAt: Date;
}

interface IDepartment extends Document {
  name: string;
  users: string[];
}

interface ICategory extends Document {
  name: string;
}

export enum Payment {
  BANK_TRANSFER = 'bank transfer',
  CASH = 'cash',
  PEMO_CARD = 'pemo card',
  CREDIT = 'credit',
}

const taskSchema = new Schema<ITask>(
  {
    name: { type: String, required: true, default: 'New material' },
    article: { type: String, default: '' },
    price: Number || null,
    quantity: Number || null,
    date: { type: Date, default: new Date() }, // If you want to store the current date-time as a string
    unit: String,
    comment: String,
    deliveryDate: Date,
    orderedBy: String,
    status: { type: String, required: true, default: Status.PENDING, enum: Object.values(Status) },
    payment: {
      type: String,
      default: null,
      enum: [...Object.values(Payment), null],
      nullable: true,
    },
    positionKey: String,
  },
  { timestamps: true }
);

export const listSchema = new Schema<List>(
  {
    id: String,
    name: { type: String, default: '' },
    department: { type: String, index: true },
    isActive: { type: Boolean, default: true },
    tasks: [taskSchema],
    parentId: { type: Schema.Types.ObjectId, default: null, ref: 'List' },
    index: { type: Number, default: 0 },
    positionKey: { type: String, required: true },
    path: [{ type: Schema.Types.ObjectId, ref: 'List' }],
  },
  {
    timestamps: { updatedAt: true },
  }
);

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, unique: true },
  users: [String],
});

const categorySchema = new Schema<ICategory>({
  name: { type: String, unique: true },
});

listSchema.index({
  name: 'text',
  'tasks.name': 'text',
  'tasks.comment': 'text',
});

listSchema.index({ parentId: 1, index: 1 });
listSchema.index({ path: 1 });

listSchema.statics.updatePosition = async function (
  itemId: string,
  newPosition: Position,
  _oldPosition: Position
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get the items at the target position and the one after it
    const targetItems = await this.find({
      parentId: newPosition.parentId,
      isActive: true,
    }).sort({ positionKey: 1 });

    // Calculate the new position key
    let newKey;
    if (newPosition.index === 0) {
      // Moving to the start
      const afterKey = targetItems?.[0]?.positionKey || null;
      newKey = generateKeyBetween(null, afterKey);
    } else if (newPosition.index >= targetItems.length - 1) {
      // Moving to the end
      const beforeKey = targetItems?.[targetItems.length - 1]?.positionKey || null;
      newKey = generateKeyBetween(beforeKey, null);
    } else {
      // Moving between two items
      const isMovingDown = newPosition.index > _oldPosition.index;
      const beforeKey = targetItems?.[newPosition.index + (isMovingDown ? 0 : -1)]?.positionKey;
      const afterKey = targetItems?.[newPosition.index + (isMovingDown ? 1 : 0)]?.positionKey;
      newKey = generateKeyBetween(beforeKey, afterKey);
    }

    // Update the item's position
    const item = await this.findById(itemId, { isActive: true });
    if (!item) throw new Error('Item not found');

    const newParent = newPosition.parentId
      ? await this.findById(newPosition.parentId).select('path _id isActive').lean()
      : null;

    item.parentId = newPosition.parentId;
    item.index = newPosition.index;
    item.positionKey = newKey;
    console.log(newParent);
    item.path = newParent ? [...newParent.path, newParent._id] : [];

    await item.save();
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

interface ListModel extends mongoose.Model<List> {
  updatePosition(itemId: string, newPosition: Position, oldPosition: Position): Promise<void>;
}

setupTransactionMiddleware(listSchema);

const ListModel = mongoose.model<List, ListModel>('List', listSchema);
const Department = mongoose.model<IDepartment>('Department', departmentSchema);
const Category = mongoose.model<ICategory>('Category', categorySchema);

export { ListModel, Category, Department, List, ITask, IDepartment, ICategory, Status };
export default ListModel;
