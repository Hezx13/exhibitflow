const getCurrentDateAndTime = (): Date => {
  const today = new Date();
  // const now = new Date();
  //
  // const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
  // const date = today.getDate().toString().padStart(2, '0') + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getFullYear();
  return today;
};

function extractDateFromString(inputString: string): Date | null {
  // Regular expression to match date formats DD/MM/YYYY or DD.MM.YYYY
  const regex = /(\d{2})[\/.](\d{2})[\/.](\d{4})/;
  const matches = inputString.match(regex);

  if (matches) {
    const day = matches[1];
    const month = matches[2];
    const year = matches[3];

    // Construct a date string in ISO format (YYYY-MM-DD) which is reliably parsed across environments
    const isoDateString = `${year}-${month}-${day}`;

    // Convert to a Date object
    const dateObject = new Date(isoDateString);

    return dateObject;
  }

  // Return null or throw an error if no date is found
  return null;
}

function excelDateToDate(serial: number): Date {
  const leapYear1900 = 60; // Excel's false leap year
  if (serial < leapYear1900) serial++;
  const daysSinceUnixEpoch = serial - 25569; // 25569 is the number of days between 01/01/1900 and 01/01/1970.
  return new Date(daysSinceUnixEpoch * 24 * 60 * 60 * 1000);
}

function excelDateToJSDate(value: number | string): Date | null {
  if (typeof value === 'number') {
    return excelDateToDate(value);
  } else if (typeof value === 'string') {
    // Extract date from string using regex for formats DD/MM/YYYY or DD.MM.YYYY
    const regex = /(\d{2})[\/.](\d{2})[\/.](\d{4})/;
    const matches = value.match(regex);

    if (matches) {
      const [_, day, month, year] = matches;
      const isoDateString = `${year}-${month}-${day}`;
      return new Date(isoDateString);
    }
  }

  // Return null or throw an error if no valid date is found
  return null;
}

export {
  extractDateFromString,
  excelDateToJSDate,
  getCurrentDateAndTime,
};
