import mongoose, { Document, Schema } from 'mongoose';
import { Roles } from 'server/middleware/permit';
import { IDepartment } from './List/list.model';
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  departments: IDepartment[];
  selectedDepartment: IDepartment;
  role: 'Admin' | 'User' | 'Manager';
  isApproved: boolean;
  adminAccess: boolean;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  departments: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'Department',
  },
  selectedDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },
  role: {
    type: String,
    enum: Roles,
    default: 'User',
  },
  adminAccess: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

// UserSchema.pre('save', async function(next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 12);
//     }
//     next();
// });

export default mongoose.model<IUser>('User', UserSchema);
