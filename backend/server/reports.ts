import List, { List as IList, ITask, Payment } from './models/List/list.model';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Transaction, { ITransaction } from './models/transaction.model';

dayjs.extend(customParseFormat);

interface Parent {
  id: string;
  name: string;
}

interface DebitRecord {
  amount: number;
  date: Date;
  check?: string;
}

class Parent implements Parent {
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class Period {
  start: string;
  end: string;

  constructor(start: string, end: string) {
    // Validate that start is before end
    if (new Date(start) >= new Date(end)) {
      throw new Error('Start date must be before end date');
    }
    this.start = start; // Date string (YYYY-MM-DD)
    this.end = end; // Date string (YYYY-MM-DD)
  }
}

class Report {
  materials: Partial<ITask>[];
  month: Period;
  debit: ITransaction[];
  credit: number;
  department: string;
  activeProjects: Parent[];
  payment: string;

  constructor(materials: Partial<ITask>[], month: Period, department: string) {
    this.materials = materials;
    this.month = month;
    this.debit = [];
    this.credit = 0;
    this.department = department;
    this.activeProjects = [];
    this.payment = '';
  }

  extractMaterialsFromPeriod(payment: string): void {
    let extracted = this.materials.filter((material) => {
      let date = dayjs(material.date).format('DD-MM-YYYY HH:MM');
      const [, month, year] = date?.split(' ')[0]?.split('-') ?? [];
      const isCash = material.payment && material.payment?.toLowerCase() === payment;
      const isFiltered =
        material.status?.toLowerCase() !== 'pending' &&
        month === this.month.start.split('-')[1] &&
        year === this.month.start.split('-')[2] &&
        isCash;
      return isFiltered;
    });
    this.materials = extracted;
  }

  sortByDate(): void {
    this.materials.sort((a, b) => {
      let date1 = dayjs(a.date).format('DD-MM-YYYY HH:MM');
      let date2 = dayjs(b.date).format('DD-MM-YYYY HH:MM');

      if (
        date1 === 'Invalid Date' ||
        date2 === 'Invalid Date' ||
        date1 === null ||
        date2 === null
      ) {
        return 0;
      }

      const dateA = Number(date1.slice(0, 2));
      const dateB = Number(date2.slice(0, 2));
      return dateA - dateB;
    });
  }

  calculateCredit(): void {
    for (let material of this.materials) {
      let price = Number(material.price);
      if (material.price && material.quantity && !isNaN(price) && !isNaN(Number(material.quantity)))
        this.credit += price * Number(material.quantity);
    }
  }

  addDebit(amount: number, date: Date, check?: string): void {
    amount = Number(amount);
    if (!isNaN(amount)) {
      const transaction = new Transaction({
        debit: amount,
        credit: 0,
        date,
        account: Payment.CASH,
        currency: 'USD',
        description: check ?? '',
        reference: null,
        department: this.department
      });
      this.debit.push(transaction);
    }
  }

  extractActiveProjects(): void {
    this.activeProjects = Array.from(
      this.materials
        .reduce((map, task) => {
          const key = `${task.listParent?.id}-${task.listParent?.name}`;
          map.set(key, task.listParent as Parent);
          return map;
        }, new Map<string, Parent>())
        .values()
    );
  }

  async fetchDebits(): Promise<void> {
    const startDate = dayjs(this.month.start, 'DD-MM-YYYY').startOf('day').toDate();
    const endDate = dayjs(this.month.end, 'DD-MM-YYYY').endOf('day').toDate();

    // Construct the query
    const query = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      department: this.department,
    };

    // Use the query to find records
    const res = await Transaction.find(query).lean();
    this.debit = res;
  }
}

async function generateReport(
  period: Period,
  fetchedLists: IList[],
  fetchedArchives: IList[],
  payment: string,
  department: string
): Promise<Report> {
  try {
    let concat: ITask[] = [];

    for (let list of fetchedLists) {
      for (let task of list.tasks) {
        let parent = new Parent(list.id, list.name);
        task.listParent = parent;
        concat.push(task);
      }
    }

    for (let arch of fetchedArchives) {
      for (let task of arch.tasks) {
        let parent = new Parent(arch.id, arch.name);
        task.listParent = parent;
        concat.push(task);
      }
    }
    const report = new Report(concat, period, department);
    report.extractMaterialsFromPeriod(payment);
    report.sortByDate();
    report.calculateCredit();
    report.extractActiveProjects();

    if (payment.toLowerCase() === 'cash') await report.fetchDebits();

    report.payment = payment;
    return report;
  } catch (err) {
    throw new Error(err as string);
  }
}

export { Report, Period, generateReport };
