import dayjs from 'dayjs';
import { excelDateToJSDate } from '../../utils/timeUtils';
import * as XLSX from 'xlsx';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';

async function processExcelFile(file: Express.Multer.File, department: string) {
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;
  const results = [];

  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.error(`Sheet "${sheetName}" not found in the workbook.`);
      continue;
    }
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: 1,
    });

    // Generate consecutive position keys for all tasks
    let lastKey: string | null = null;
    const tasks = jsonData
      .filter((row: any) => row['Material'])
      .map((row: any) => {
        // Generate position key between previous and next
        const positionKey =
          lastKey === null
            ? generateJitteredKeyBetween(null, null)
            : generateJitteredKeyBetween(lastKey, null);

        // Update lastKey for next iteration
        lastKey = positionKey;

        return {
          name: row['Material'],
          article: row['Article number'] ?? '',
          price: isNaN(Number(row['Price'])) ? null : Number(row['Price']),
          quantity: row['Qty'],
          date:
            dayjs(excelDateToJSDate(row['Date of order'])).format('DD-MM-YYYY HH:mm') ===
            'Invalid Date'
              ? new Date()
              : (excelDateToJSDate(row['Date of order']) as Date),
          unit: row['Unit(pcs/mtr/ltr...)'],
          comment: row['Coment'],
          deliveryDate:
            row['Delivery date (not late than..)'] === ''
              ? null
              : excelDateToJSDate(row['Delivery date (not late than..)']),
          orderedBy: row['Name who order'],
          status: row['Status of order']?.toLowerCase(),
          payment: row['Payment method']?.toLowerCase(),
          positionKey,
        };
      });

    results.push({
      department,
      name: sheetName,
      tasks,
    });
  }

  return results;
}

export { processExcelFile };
