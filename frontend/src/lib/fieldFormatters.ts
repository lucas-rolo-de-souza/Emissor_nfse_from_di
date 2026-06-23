import type { FieldDef } from "./fieldSchema";
import { cleanAscii } from "./fieldSchema";

function isZeroOrEmpty(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  // All zeros (possibly with a single dot)
  return /^0*\.?0*$/.test(trimmed);
}

function parseNumericRaw(raw: string, decimals: number): number | null {
  const trimmed = raw.trim();
  if (!trimmed || isZeroOrEmpty(trimmed)) return null;
  if (decimals > 0 && trimmed.includes(".")) {
    return parseFloat(trimmed);
  }
  if (decimals > 0) {
    // Stored without dot — last `decimals` digits are the decimal part
    const intStr = trimmed.slice(0, trimmed.length - decimals) || "0";
    const decStr = trimmed.slice(-decimals);
    return parseFloat(`${intStr}.${decStr}`);
  }
  return parseInt(trimmed, 10);
}

function formatDate(raw: string, format: NonNullable<FieldDef["dateFormat"]>): string {
  const s = raw.trim();
  if (!s || s === "00000000" || s === "000000") return "—";
  if (format === "DDMMAAAA" && s.length === 8) {
    return `${s.slice(0, 2)}/${s.slice(2, 4)}/${s.slice(4)}`;
  }
  if (format === "AAAAMMDD" && s.length === 8) {
    return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
  }
  return s;
}

export function formatFriendly(def: FieldDef, rawValue: string): string {
  if (def.category === "filler") return "—";

  if (def.category === "date" && def.dateFormat) {
    return formatDate(rawValue, def.dateFormat);
  }

  if (def.type === "N" && def.decimals !== undefined) {
    const val = parseNumericRaw(rawValue, def.decimals);
    if (val === null) return "—";

    if (def.category === "value") {
      const formatted = val.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `R$ ${formatted}`;
    }

    if (def.category === "tax") {
      const decimalsToShow = Math.min(def.decimals, 2);
      const formatted = val.toLocaleString("pt-BR", {
        minimumFractionDigits: decimalsToShow,
        maximumFractionDigits: decimalsToShow,
      });
      return def.unit ? `${formatted}${def.unit}` : formatted;
    }

    if (def.category === "quantity") {
      const formatted = val.toLocaleString("pt-BR", {
        minimumFractionDigits: def.decimals,
        maximumFractionDigits: def.decimals,
      });
      return def.unit ? `${formatted} ${def.unit}` : formatted;
    }

    // Numeric id fields (nota, NCM, etc.)
    if (def.category === "id") {
      return val.toString();
    }

    return val.toLocaleString("pt-BR");
  }

  // Alpha/text/id fields
  return rawValue.trim() || "—";
}

export function formatRawFromUserInput(def: FieldDef, userInput: string): string {
  if (def.type === "N" && def.decimals !== undefined && def.decimals > 0) {
    // intWidth is the number of digits before the dot
    const intWidth = def.len - def.decimals - 1; // -1 for the literal dot
    let intPart: string;
    let decPart: string;

    const cleaned = userInput.replace(/[^0-9.]/g, "");

    if (cleaned.includes(".")) {
      const dotIdx = cleaned.indexOf(".");
      intPart = cleaned.slice(0, dotIdx);
      decPart = cleaned.slice(dotIdx + 1, dotIdx + 1 + def.decimals);
    } else {
      // Treat last `decimals` digits as decimal part
      if (cleaned.length <= def.decimals) {
        intPart = "0";
        decPart = cleaned.padStart(def.decimals, "0");
      } else {
        intPart = cleaned.slice(0, cleaned.length - def.decimals);
        decPart = cleaned.slice(-def.decimals);
      }
    }

    intPart = intPart.padStart(intWidth, "0").slice(-intWidth);
    decPart = decPart.padEnd(def.decimals, "0").slice(0, def.decimals);

    return `${intPart}.${decPart}`;
  }

  if (def.type === "N" && (def.decimals === 0 || def.decimals === undefined)) {
    const cleaned = userInput.replace(/[^0-9]/g, "");
    return cleaned.padStart(def.len, "0").slice(-def.len);
  }

  // Alpha / C / D fields are cleaned to printable ASCII and padded
  return cleanAscii(userInput).padEnd(def.len, " ").slice(0, def.len);
}

