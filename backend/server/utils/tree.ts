const buildTree = (items: any[], parentId: string | null = null): any[] => {
  return items
    .filter((item) => String(item.parentId) === String(parentId))
    .map((item) => {
      // Check if item has pending tasks
      let hasNewOrders = false;
      if (item.tasks) {
        hasNewOrders = item.tasks.some(
          (task: any) => task.status === 'Pending' || task.status === '' || !task.status
        );
      }

      // Create base node
      const node = {
        id: item._id.toString(),
        label: item.name || item.documentName || '',
        hasNewOrders,
        positionKey: item.positionKey,
        isActive: item.isActive,
      };

      // Find children
      const children = buildTree(items, item._id.toString());

      // Only add children property if there are children
      if (children.length > 0) {
        return { ...node, children };
      }

      return node;
    });
};

export default buildTree;
