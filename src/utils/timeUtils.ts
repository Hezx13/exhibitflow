import dayjs from 'dayjs';
export const getCurrentDateAndTime = () => {
  const today = new Date();

  // const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
  // const date = today.getDate().toString().padStart(2, '0') + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getFullYear();
  return today;
};

export function formatDateTime(date: string) {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`;
}

export const getNextWeek = () => {
  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  return dayjs(weekFromNow).format('DD-MM-YYYY').toString();
};

export const debounce = (fn: Function, time = 500) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), time);
  };
};
