import {
  IReport,
  IReportPeriod,
  IActiveProject,
  IReportMaterial,
} from '../models/types';
import { AppError } from './errors';
import Transaction from '../models/transaction.model';
import { ITask, List } from 'server/models/List/list.model';

export class Period implements IReportPeriod {
  start: string;
  end: string;

  constructor(start: string, end: string) {
    if (new Date(start) >= new Date(end)) {
      throw new AppError(400, 'Start date must be before end date');
    }
    this.start = start;
    this.end = end;
  }
}

const transformTask = async (task: ITask, listParent: IActiveProject): Promise<IReportMaterial> => {
  const transaction = await Transaction.findOne({ reference: task._id }).lean();
  return {
  id: task._id as string,
  name: task.name,
  article: task.article,
  price: task.price?.toString() ?? '0',
  quantity: task.quantity ?? 0,
  date: task.date ?? new Date(),
  unit: task.unit,
  comment: task.comment,
  deliveryDate: task.deliveryDate?.toISOString(),
  orderedBy: task.orderedBy,
  status: task.status,
  payment: task.payment,
  listParent,
  transaction: transaction?._id?.toString() ?? null,
  };
};

export const generateReport = async (
  period: Period,
  lists: List[],
  payment: string,
  department: string
): Promise<IReport> => {
  const startDate = new Date(period.start);
  const endDate = new Date(period.end);
  const activeProjects: IActiveProject[] = lists.map((list) => ({
    id: list._id as string,
    name: list.name || 'Unnamed',
  }));
  const materials = await collectMaterials(lists, startDate, endDate);
  const debits = await Transaction.find({ department, date: { $gte: startDate, $lte: endDate }, debit: { $gte: 0} });
  return {
    materials,
    month: period,
    debit: debits,
    credit: calculateCredit(materials),
    department,
    activeProjects,
    payment,
  };
};

const collectMaterials = async (lists: List[], startDate: Date, endDate: Date): Promise<IReportMaterial[]> => {
  const materials = await Promise.all(
    lists.flatMap((list) =>
      list.tasks
        .filter((task) => {
          if (!task.date) return false;
          const taskDate = new Date(task.date);
          const condition = taskDate >= startDate && taskDate <= endDate;
          return condition;
        })
        .map((task) =>
          transformTask(task, {
            id: list._id as string,
            name: list.name,
          })
        )
    )
  );
  console.log('Collected materials count:', materials.length);
  return materials;
};

const calculateCredit = (materials: IReportMaterial[]): number => {
  return materials.reduce((total, material) => {
    const price = Number(material.price) || 0;
    const quantity = material.quantity || 0;
    return total + price * quantity;
  }, 0);
};
