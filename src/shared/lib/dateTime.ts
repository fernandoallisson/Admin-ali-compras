export const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

const dateInputFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BRASILIA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BRASILIA_TIME_ZONE,
  month: 'numeric',
});

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BRASILIA_TIME_ZONE,
  hour: 'numeric',
  hourCycle: 'h23',
});

export function dateInputInBrasilia(value: Date | string = new Date()) {
  return dateInputFormatter.format(typeof value === 'string' ? new Date(value) : value);
}

export function monthInBrasilia(value: Date = new Date()) {
  return monthFormatter.format(value);
}

export function hourInBrasilia(value: Date = new Date()) {
  return Number(hourFormatter.format(value));
}

export function formatBrasiliaDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short' },
) {
  return new Intl.DateTimeFormat('pt-BR', {
    ...options,
    timeZone: BRASILIA_TIME_ZONE,
  }).format(typeof value === 'string' ? new Date(value) : value);
}

export function formatBrasiliaTime(value: Date | string) {
  return formatBrasiliaDate(value, { hour: '2-digit', minute: '2-digit' });
}

export function startOfBrasiliaDayInput(value: string) {
  return value ? `${value}T00:00:00.000` : null;
}

export function endOfBrasiliaDayInput(value: string) {
  return value ? `${value}T23:59:59.999` : null;
}
