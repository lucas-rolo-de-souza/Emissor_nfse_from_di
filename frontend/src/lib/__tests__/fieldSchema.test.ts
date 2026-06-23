import { describe, it, expect } from "vitest";
import {
  LAYOUT_LENGTHS,
  HEADER_SCHEMA,
  ITEM_SCHEMA,
  getSchemaForLine,
  detectLayoutVersion,
  padLineToLayout,
  convertLinesToLayout,
} from "../fieldSchema";

// ---------------------------------------------------------------------------
// LAYOUT_LENGTHS — correct sizes per layout-for-ai.md §1
// ---------------------------------------------------------------------------

describe("LAYOUT_LENGTHS", () => {
  it("DI header is 380", () => {
    expect(LAYOUT_LENGTHS.v3_DI.header).toBe(380);
  });
  it("DI item is 717", () => {
    expect(LAYOUT_LENGTHS.v3_DI.item).toBe(717);
  });
  it("DUIMP header is 399", () => {
    expect(LAYOUT_LENGTHS.v3_DUIMP.header).toBe(399);
  });
  it("DUIMP item is 717 (same as DI per spec §1)", () => {
    expect(LAYOUT_LENGTHS.v3_DUIMP.item).toBe(717);
  });
});

// ---------------------------------------------------------------------------
// getSchemaForLine — header selection and item position correction
// ---------------------------------------------------------------------------

describe("getSchemaForLine — type 1 (header)", () => {
  const line = "1" + " ".repeat(398);

  it("returns HEADER_SCHEMA reference for type-1 lines", () => {
    expect(getSchemaForLine(line)).toBe(HEADER_SCHEMA);
  });

  it("HEADER_SCHEMA total coverage reaches 399 (last DUIMP field)", () => {
    const last = HEADER_SCHEMA[HEADER_SCHEMA.length - 1];
    expect(last.start + last.len - 1).toBe(399);
  });
});

describe("getSchemaForLine — type 2 (item) position corrections", () => {
  const line = "2" + " ".repeat(716);

  it("corrects quantidade len from 11 to 12 (spec §7 issue #1)", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "quantidade")!;
    expect(f.len).toBe(12);
  });

  it("quantidade still starts at pos 55 after correction", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "quantidade")!;
    expect(f.start).toBe(55);
  });

  it("fields with start < 55 are not shifted", () => {
    const schema = getSchemaForLine(line);
    const ncm = schema.find((x) => x.name === "ncm")!;
    const raw = ITEM_SCHEMA.find((x) => x.name === "ncm")!;
    expect(ncm.start).toBe(raw.start);
  });

  it("unidade shifts from 66 to 67 (right after 12-char quantidade)", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "unidade")!;
    expect(f.start).toBe(67);
  });

  it("valor_ipi shifts to pos 70 (spec: field 13, pos 70–84)", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "valor_ipi")!;
    expect(f.start).toBe(70);
  });

  it("valor_fob shifts to pos 262 (spec: field 18, pos 262–276)", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "valor_fob")!;
    expect(f.start).toBe(262);
  });

  it("codigo_li shifts to pos 698 (spec: field 58, pos 698–707)", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "codigo_li")!;
    expect(f.start).toBe(698);
    expect(f.start + f.len - 1).toBe(707);
  });

  it("codigo_li_substitutiva ends at pos 717 (spec: field 59, pos 708–717)", () => {
    const schema = getSchemaForLine(line);
    const f = schema.find((x) => x.name === "codigo_li_substitutiva")!;
    expect(f.start).toBe(708);
    expect(f.start + f.len - 1).toBe(717);
  });

  it("no item field has isDUIMPOnly — item layout is identical for DI and DUIMP", () => {
    const schema = getSchemaForLine(line);
    const duimpOnly = schema.filter((x) => x.isDUIMPOnly);
    expect(duimpOnly).toHaveLength(0);
  });
});

describe("getSchemaForLine — DUIMP-only header fields", () => {
  it("numero_duimp is marked isDUIMPOnly in HEADER_SCHEMA", () => {
    const f = HEADER_SCHEMA.find((x) => x.name === "numero_duimp")!;
    expect(f.isDUIMPOnly).toBe(true);
  });

  it("versao_registro is marked isDUIMPOnly in HEADER_SCHEMA", () => {
    const f = HEADER_SCHEMA.find((x) => x.name === "versao_registro")!;
    expect(f.isDUIMPOnly).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectLayoutVersion — CAPA length heuristic (spec §10)
// ---------------------------------------------------------------------------

describe("detectLayoutVersion", () => {
  it("returns v3_DUIMP for a 399-char header line", () => {
    expect(detectLayoutVersion(["1" + " ".repeat(398)])).toBe("v3_DUIMP");
  });

  it("returns v3_DI for a 380-char header line", () => {
    expect(detectLayoutVersion(["1" + " ".repeat(379)])).toBe("v3_DI");
  });

  it("defaults to v3_DUIMP when no type-1 line is present", () => {
    expect(detectLayoutVersion(["2" + " ".repeat(716)])).toBe("v3_DUIMP");
  });

  it("ignores item lines when detecting layout", () => {
    const lines = ["2" + " ".repeat(716), "1" + " ".repeat(379)];
    expect(detectLayoutVersion(lines)).toBe("v3_DI");
  });
});

// ---------------------------------------------------------------------------
// padLineToLayout — padding and truncation
// ---------------------------------------------------------------------------

describe("padLineToLayout", () => {
  it("pads short DI header to exactly 380 chars", () => {
    const short = "1" + "0".repeat(10);
    expect(padLineToLayout(short, "v3_DI").length).toBe(380);
  });

  it("pads short DI item to exactly 717 chars", () => {
    const short = "2" + "0".repeat(10);
    expect(padLineToLayout(short, "v3_DI").length).toBe(717);
  });

  it("pads short DUIMP header to exactly 399 chars", () => {
    const short = "1" + "0".repeat(10);
    expect(padLineToLayout(short, "v3_DUIMP").length).toBe(399);
  });

  it("pads short DUIMP item to exactly 717 chars", () => {
    const short = "2" + "0".repeat(10);
    expect(padLineToLayout(short, "v3_DUIMP").length).toBe(717);
  });

  it("truncates an overlong DI header to 380", () => {
    const long = "1" + " ".repeat(500);
    expect(padLineToLayout(long, "v3_DI").length).toBe(380);
  });

  it("truncates an overlong DI item to 717", () => {
    const long = "2" + " ".repeat(900);
    expect(padLineToLayout(long, "v3_DI").length).toBe(717);
  });

  it("preserves existing content in the padded line", () => {
    const line = "1" + "X".repeat(5) + " ".repeat(374);
    const result = padLineToLayout(line, "v3_DI");
    expect(result.slice(1, 6)).toBe("XXXXX");
  });
});

// ---------------------------------------------------------------------------
// convertLinesToLayout — CRLF output and multi-line correctness
// ---------------------------------------------------------------------------

describe("convertLinesToLayout", () => {
  const header = "1" + " ".repeat(379); // 380 chars
  const item = "2" + " ".repeat(716);   // 717 chars

  it("outputs CRLF line endings", () => {
    const result = convertLinesToLayout(header + "\n" + item, "v3_DI");
    expect(result).toMatch(/\r\n/);
  });

  it("ends with CRLF", () => {
    const result = convertLinesToLayout(header + "\n" + item, "v3_DI");
    expect(result.endsWith("\r\n")).toBe(true);
  });

  it("produces exactly 380-char header and 717-char item for DI layout", () => {
    const result = convertLinesToLayout(header + "\n" + item, "v3_DI");
    const lines = result.split("\r\n").filter((l) => l.length > 0);
    expect(lines[0].length).toBe(380);
    expect(lines[1].length).toBe(717);
  });

  it("produces exactly 399-char header and 717-char item for DUIMP layout", () => {
    const shortHeader = "1" + " ".repeat(10);
    const shortItem = "2" + " ".repeat(10);
    const result = convertLinesToLayout(shortHeader + "\n" + shortItem, "v3_DUIMP");
    const lines = result.split("\r\n").filter((l) => l.length > 0);
    expect(lines[0].length).toBe(399);
    expect(lines[1].length).toBe(717);
  });

  it("handles LF-only input gracefully", () => {
    const result = convertLinesToLayout(header + "\n" + item, "v3_DI");
    expect(result.split("\r\n").filter((l) => l.length > 0)).toHaveLength(2);
  });

  it("handles CRLF input without doubling separators", () => {
    const result = convertLinesToLayout(header + "\r\n" + item, "v3_DI");
    expect(result.split("\r\n").filter((l) => l.length > 0)).toHaveLength(2);
  });
});
