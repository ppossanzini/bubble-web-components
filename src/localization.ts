export const pickerMessages = {
  en: {
    required: "Select an option.",
    open: "Open picker",
    cancel: "Cancel",
    confirm: "OK",
    previous: "Previous month",
    next: "Next month",
    month: "Month",
    year: "Year",
    start: "Start date",
    end: "End date",
    hour: "Hour",
    minute: "Minute",
    period: "AM or PM",
    input: "Use keyboard input",
    dial: "Use dial",
    hours: "hours",
    minutes: "minutes",
  },
  it: {
    required: "Seleziona un’opzione.",
    open: "Apri selettore",
    cancel: "Annulla",
    confirm: "OK",
    previous: "Mese precedente",
    next: "Mese successivo",
    month: "Mese",
    year: "Anno",
    start: "Data iniziale",
    end: "Data finale",
    hour: "Ora",
    minute: "Minuti",
    period: "AM o PM",
    input: "Usa tastiera",
    dial: "Usa quadrante",
    hours: "ore",
    minutes: "minuti",
  },
} as const;
export type PickerLabels = { [K in keyof typeof pickerMessages.en]: string };
export function messages(
  locale: string,
  overrides: Partial<PickerLabels>,
): PickerLabels {
  return {
    ...pickerMessages[locale.startsWith("it") ? "it" : "en"],
    ...overrides,
  };
}

/** Etichette dei comandi di espansione degli elenchi annidati. */
export const listMessages = {
  en: { expand: "Expand", collapse: "Collapse" },
  it: { expand: "Espandi", collapse: "Comprimi" },
} as const;

export type ListLabels = { [K in keyof typeof listMessages.en]: string };

export function listLabels(
  locale: string,
  overrides: Partial<ListLabels> = {},
): ListLabels {
  return {
    ...listMessages[locale.startsWith("it") ? "it" : "en"],
    ...overrides,
  };
}
