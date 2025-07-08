const dye = (color: string, text: string) => `${color}${text}${CLEAN}`;

const CLEAN = "\x1b[0m";

const COLORS = Object.freeze({
  __proto__: null,
  yellow: "\x1b[1;33m",
  red: "\x1b[1;31m",
  white: "\x1b[1;37m",
  blue: '\x1b[1;34m',
  green: '\x1b[1;32m',
});

const { blue, green, red, yellow } = COLORS;
const intl = new Intl.DateTimeFormat(undefined,
  {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatDate = (date = new Date()) => intl.format(date);
const date = () => dye(blue, formatDate());

const logger = Object.assign({}, console, {
  log(...logs: any[]) {
    const title = dye(green, "[log]:");
    console.log(title, date(), ...logs);
  },
  error(...logs: any[]) {
    const title = dye(red, "[error]:");
    console.log(title, date(), ...logs);
  },
  warn(...logs: any[]) {
    const title = dye(yellow, "[warn]:");
    console.log(title, date(), ...logs);
  },
  info(...logs: any[]) {
    const title = dye(blue, "[info]:");
    console.log(title, date(), ...logs);
  },
});

export default logger;