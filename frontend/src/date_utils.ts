export function parseDate(s: string): Date {
  let epochUTC: number = Date.parse(s);
  return new Date(epochUTC)
}

export function formatDateNicely(date: Date): string {
  let now = new Date();

  let opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  };

  if (date.getFullYear() === now.getFullYear()) {
    if(date.getMonth() === now.getMonth()) {
      if (date.getDay() === now.getDay()) {
        opts.dateStyle = undefined;
      }
    }
  }

  return new Intl.DateTimeFormat(navigator.language, opts).format(date)
}


// NOTE: chucking this in here for now
// function getLang() {
//   if (navigator.languages !== undefined)
//     return navigator.languages[0];
//   return navigator.language;
// }
