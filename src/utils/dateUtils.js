import { format, parseISO, isAfter, isBefore, isSameDay } from "date-fns";

function toDate(date) {
  return typeof date === "string" ? parseISO(date) : date;
}

function getDatedPathParts(date, slug) {
  const dateObj = toDate(date);
  const year = String(dateObj.getUTCFullYear());
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const cleanSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");

  return { year, month, day, slug: cleanSlug };
}

export function getArticlePath(entry) {
  const parts = getDatedPathParts(entry.data.pubDate, entry.slug);
  return `/articles/${parts.year}/${parts.month}/${parts.day}/${parts.slug}`;
}

export function getEventPath(entry) {
  const parts = getDatedPathParts(entry.data.startDate, entry.slug);
  return `/evenements/${parts.year}/${parts.month}/${parts.day}/${parts.slug}`;
}

export function getArticlePathParams(entry) {
  return getDatedPathParts(entry.data.pubDate, entry.slug);
}

export function getEventPathParams(entry) {
  return getDatedPathParts(entry.data.startDate, entry.slug);
}

/**
 * Format a date in a human-readable format
 * @param {Date|string} date The date to format
 * @param {string} formatStr The format string (default: 'dd/MM/yyyy')
 * @returns {string} The formatted date
 */
export function formatDate(date, formatStr = "dd/MM/yyyy") {
  if (!date) return "";

  // If date is a string, parse it
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  return format(dateObj, formatStr);
}

/**
 * Return an event's explicit end date, or its start date for single-day events.
 * @param {{ startDate: Date|string, endDate?: Date|string }} event
 * @returns {Date|string}
 */
export function getEventEndDate(event) {
  return event.endDate ?? event.startDate;
}

/**
 * Check if a date is in the future
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;

  // If date is a string, parse it
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();

  // Treat events occurring today as upcoming
  return isSameDay(dateObj, now) || isAfter(dateObj, now);
}

/**
 * Check if a date is in the past
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is in the past
 */
export function isPastDate(date) {
  if (!date) return false;

  // If date is a string, parse it
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();

  // Exclude today's events from past
  return isBefore(dateObj, now) && !isSameDay(dateObj, now);
}
