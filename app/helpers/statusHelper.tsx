export const currentDayComparator = (startDate: string, endDate: string) => {
  const currDate = new Date();
  const givenStartDate = new Date(startDate);
  const givenEndDate = new Date(endDate);

  if (currDate >= givenStartDate && currDate <= givenEndDate) {
    return "en cours";
  } else if (givenStartDate > currDate) {
    return "à venir";
  } else if (givenEndDate <= currDate) {
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
