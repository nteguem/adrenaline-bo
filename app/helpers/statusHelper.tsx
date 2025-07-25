export const currentDayComparator = (date: string) => {
  const currDate = new Date();
  const givenDate = new Date(date);

  if (isDay(date)) {
    return "en cours";
  } else if (givenDate > currDate) {
    return "à venir";
  } else if (givenDate < currDate) {
    return "passé";
  }
};

export const isDay = (startDate: string) => {
  const currentDate = new Date();
  const tourDate = new Date(startDate);
  // Check if the current date's year, month, and day are equal to the tour date's year, month, and day
  const isSameDay =
    currentDate.getFullYear() === tourDate.getFullYear() &&
    currentDate.getMonth() === tourDate.getMonth() &&
    currentDate.getDate() === tourDate.getDate();
  return isSameDay;
};
