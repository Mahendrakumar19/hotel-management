/**
 * Format date to ISO string format (YYYY-MM-DD HH:MM:SS)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date to ISO date format (YYYY-MM-DD)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDateOnly(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get current date in database format
 * @returns {string} Current date in YYYY-MM-DD HH:MM:SS format
 */
function getCurrentDate() {
  return formatDate(new Date());
}

/**
 * Parse ISO date string to JavaScript Date
 * @param {string} dateString - Date string in ISO format
 * @returns {Date} JavaScript Date object
 */
function parseDate(dateString) {
  return new Date(dateString);
}

module.exports = {
  formatDate,
  formatDateOnly,
  getCurrentDate,
  parseDate
};
