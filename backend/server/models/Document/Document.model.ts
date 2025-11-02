import { generateKeyBetween } from 'fractional-indexing-jittered';
import mongoose from 'mongoose';

interface Document extends mongoose.Document {
  documentName: string;
  department: string;
  isActive: boolean;
  positionKey: string;
  data: Uint8Array;
  path: string[];
  parentId: string | null;
}
interface Position {
  parentId: string | null;
  index: number;
}
const documentSchema = new mongoose.Schema(
  {
    documentName: { type: String, index: true, default: '' },
    department: { type: String, required: true, index: true },
    data: { type: Buffer },
    textData: { type: String, default: '' },
    html: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    positionKey: { type: String, required: true },
    path: { type: [String] },
    parentId: { type: String, default: null },
  },
  {
    timestamps: { updatedAt: true, createdAt: true },
  }
);

documentSchema.statics.updatePosition = async function (
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

interface DocumentModel extends mongoose.Model<Document> {
  updatePosition(itemId: string, newPosition: Position, oldPosition: Position): Promise<void>;
}

const DocumentModel = mongoose.model<Document, DocumentModel>('Document', documentSchema);
export default DocumentModel;
