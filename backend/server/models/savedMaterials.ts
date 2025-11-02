import mongoose, { Document, Schema } from 'mongoose';

interface IParentProject {
  id: string;
  name: string;
}

interface ISupplier {
  name: string;
  phone: string;
  email: string;
  web: string;
  category: string;
}

interface IMaterial extends Document {
  id: string;
  name: string;
  article: string;
  supplier: ISupplier;
  category: string;
  price: number;
  unit: string;
  comment: string;
  listParent: IParentProject[];
}

const parentProjectsSchema = new Schema<IParentProject>({
  id: String,
  name: String,
});

const supplierSchema = new Schema<ISupplier>({
  name: String,
  phone: String,
  email: String,
  web: String,
  category: String,
});

const savedMaterialSchema = new Schema<IMaterial>({
  id: String,
  name: String,
  article: String,
  supplier: supplierSchema,
  category: String,
  price: Number,
  unit: String,
  comment: String,
  listParent: [parentProjectsSchema],
});

const Material = mongoose.model<IMaterial>('Material', savedMaterialSchema);
const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

export { Material, Supplier, IMaterial, ISupplier };
