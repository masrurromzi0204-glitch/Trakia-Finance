export const formatIDR = (amount) => {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absStr = Math.round(Math.abs(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return isNegative ? `-${absStr}` : absStr;
};

export const formatInputThousand = (val) => {
  if (val === undefined || val === null) return '';
  const rawDigits = String(val).replace(/\D/g, '');
  if (!rawDigits) return '';
  return rawDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseRawAmount = (formattedVal) => {
  if (!formattedVal) return 0;
  const cleaned = String(formattedVal).replace(/\./g, '').replace(/\D/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatCompactIDR = (val) => {
  const n = Number(val) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.0', '')}jt`;
  if (n >= 1000) return `${Math.round(n / 1000)}rb`;
  return String(n);
};

export const getMonthYearStr = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

export const formatShortDate = (dateObj) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
};