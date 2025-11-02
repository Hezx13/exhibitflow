import { Category } from '../server/models/List/list.model';
import { Material, Supplier } from '../server/models/savedMaterials';

async function checkAndUpdateCategories(): Promise<void> {
  try {
    // Find materials added since last checked
    const allMaterialCategories: string[] = await Material.distinct('category', { category: { $ne: null } });
    const allSuppplierCategories: string[] = await Supplier.distinct('category', { category: { $ne: null } });
    const allCategories = await Category.find().select('name -_id').lean();

    const setMaterialCategories = new Set(allMaterialCategories);
    const setSuppplierCategories = new Set(allSuppplierCategories); 
    const setSavedCategories = new Set(allCategories.map((category) => category.name));

    const toSave = Array.from(setMaterialCategories).filter(
      (item) => !setSavedCategories.has(item)
    );
    const toUnsave = Array.from(setSavedCategories).filter(
      (item) => !setMaterialCategories.has(item)
    );

    const objectsToSave = toSave.map((name) => ({ name }));

    if (objectsToSave.length) {
      await Category.insertMany(objectsToSave);
    }
    if (toUnsave.length) {
      await Category.deleteMany({ name: { $in: toUnsave } });
    }
  } catch (error) {
    console.error('Failed to update categories:', error);
  }
}

export {
  checkAndUpdateCategories,
};
