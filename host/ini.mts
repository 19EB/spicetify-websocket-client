// Tiny ini reader: [sections], key = value, ; and # comments.

export type IniSection = Record<string, string>;
export type IniFile = Record<string, string | IniSection>;

export const parseIni = (text: string): IniFile => {
  const result: IniFile = {};
  let section: IniSection = result as IniSection;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) continue;

    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      const name = sectionMatch[1].trim();
      if (typeof result[name] !== "object") result[name] = {};
      section = result[name] as IniSection;
      continue;
    }

    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key) section[key] = value;
  }

  return result;
};

export const getSection = (ini: IniFile, name: string): IniSection => {
  const value = ini[name];
  return typeof value === "object" ? value : {};
};

export const asBoolean = (value: unknown, fallback = false): boolean => {
  if (value === undefined || value === null || value === "") return fallback;
  return /^(1|true|yes|on)$/i.test(String(value).trim());
};

export const asNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
};
