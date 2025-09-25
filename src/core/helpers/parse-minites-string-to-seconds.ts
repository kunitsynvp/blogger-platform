export function parseStringTimeFormatToSeconds(timeString) {
  // Extract the numerical part using a regular expression
  const timeFormats = ['s','m','h']
  const timeFormat= timeString[timeString.length - 1];
  if(!timeFormats.includes(timeFormat)){
    console.log("Invalid minute string format. Expected  'Xs' | 'Xm'  | 'Xh' (e.g., '60m').");
    return NaN; // Return NaN for invalid input
  }
  const time = parseInt(timeString.slice(0, timeString.length), 10); // Convert the extracted string to an integer
  switch (timeFormat) {
    case "s":
      return time;
    case "m":
      return time * 60;
    case "h":
      return time * 3600;
  }
}

