export type FieldCategory =
  | "id"
  | "tax"
  | "value"
  | "quantity"
  | "date"
  | "meta"
  | "filler"
  | "text";

export type LayoutVersion = "v3_DI" | "v3_DUIMP";

export const LAYOUT_LENGTHS: Record<LayoutVersion, { header: number; item: number }> = {
  v3_DI: { header: 380, item: 717 },
  v3_DUIMP: { header: 399, item: 717 },
};

export interface FieldDef {
  name: string;
  start: number; // 1-based
  len: number;
  type?: "N" | "A" | "C" | "D";
  decimals?: number;
  category: FieldCategory;
  friendlyLabel: string;
  unit?: string;
  dateFormat?: "DDMMAAAA" | "MMAAAA" | "AAAAMMDD";
  readOnly?: boolean;
  desc?: string;
  isNewInV2?: boolean;
  isDUIMPOnly?: boolean;
}

export interface ExtractedField {
  def: FieldDef;
  rawValue: string;
  originalRawValue?: string;
  isModified: boolean;
}

export interface CategoryStyle {
  rowBg: string;
  rowHoverBg: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  label: string;
}

export const CATEGORY_STYLES: Record<FieldCategory, CategoryStyle> = {
  id: {
    rowBg: "bg-indigo-50/40",
    rowHoverBg: "hover:bg-indigo-100/60",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    border: "border-l-2 border-indigo-400",
    label: "Identificador",
  },
  tax: {
    rowBg: "bg-amber-50/40",
    rowHoverBg: "hover:bg-amber-100/60",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    border: "border-l-2 border-amber-400",
    label: "Tributário",
  },
  value: {
    rowBg: "bg-emerald-50/40",
    rowHoverBg: "hover:bg-emerald-100/60",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    border: "border-l-2 border-emerald-400",
    label: "Valor",
  },
  quantity: {
    rowBg: "bg-blue-50/40",
    rowHoverBg: "hover:bg-blue-100/60",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    border: "border-l-2 border-blue-400",
    label: "Quantidade",
  },
  date: {
    rowBg: "bg-purple-50/40",
    rowHoverBg: "hover:bg-purple-100/60",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    border: "border-l-2 border-purple-400",
    label: "Data",
  },
  meta: {
    rowBg: "bg-slate-50/30",
    rowHoverBg: "hover:bg-slate-100/50",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
    border: "border-l-2 border-slate-300",
    label: "Metadado",
  },
  filler: {
    rowBg: "",
    rowHoverBg: "",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-400",
    border: "",
    label: "Filler",
  },
  text: {
    rowBg: "bg-teal-50/40",
    rowHoverBg: "hover:bg-teal-100/60",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-700",
    border: "border-l-2 border-teal-400",
    label: "Texto",
  },
};

export const HEADER_SCHEMA: FieldDef[] = [
  { name: "tipo", start: 1, len: 1, category: "meta", friendlyLabel: "Tipo Registro", readOnly: true, desc: "Identificador Capa (Fixed 1)" },
  { name: "empresa", start: 2, len: 2, category: "meta", friendlyLabel: "Empresa", readOnly: true, desc: "Código Empresa" },
  { name: "filial", start: 4, len: 2, category: "meta", friendlyLabel: "Filial", readOnly: true, desc: "Código Filial" },
  { name: "numero_nota", start: 6, len: 9, type: "N", decimals: 0, category: "id", friendlyLabel: "Número da Nota", desc: "Número da NF (obrigatório)" },
  { name: "filler_1", start: 15, len: 6, category: "filler", friendlyLabel: "Filler", readOnly: true },
  { name: "aliq_icms", start: 21, len: 7, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. ICMS", unit: "%" },
  { name: "cfop", start: 28, len: 6, type: "N", decimals: 0, category: "id", friendlyLabel: "CFOP", desc: "Deve existir no Easy" },
  { name: "cfp", start: 34, len: 5, type: "A", category: "meta", friendlyLabel: "CFP" },
  { name: "cgc_emitente", start: 39, len: 14, type: "N", decimals: 0, category: "id", friendlyLabel: "CNPJ Emitente", desc: "CNPJ do emitente" },
  { name: "codigo_ipi", start: 53, len: 3, type: "A", category: "meta", friendlyLabel: "Cód. IPI" },
  { name: "numero_processo", start: 56, len: 17, type: "A", category: "id", friendlyLabel: "Num. Processo/Desemb.", desc: "Processo de desembaraço (obrigatório)" },
  { name: "qtd_itens", start: 73, len: 2, type: "N", decimals: 0, category: "quantity", friendlyLabel: "Qtd. Itens", desc: "Máx. 99 (obrigatório)" },
  { name: "data_referencia", start: 75, len: 6, type: "N", decimals: 0, category: "date", friendlyLabel: "Data Referência", dateFormat: "MMAAAA" },
  { name: "data_emissao", start: 81, len: 8, type: "N", decimals: 0, category: "date", friendlyLabel: "Data Emissão", dateFormat: "AAAAMMDD", desc: "AAAAMMDD (obrigatório)" },
  { name: "data_entrada", start: 89, len: 8, type: "N", decimals: 0, category: "date", friendlyLabel: "Data Entrada", dateFormat: "AAAAMMDD", desc: "AAAAMMDD (obrigatório)" },
  { name: "filler_2", start: 97, len: 6, category: "filler", friendlyLabel: "Filler", readOnly: true },
  { name: "data_di", start: 103, len: 8, type: "N", decimals: 0, category: "date", friendlyLabel: "Data DI", dateFormat: "AAAAMMDD", desc: "AAAAMMDD (obrigatório)" },
  { name: "filler_3", start: 111, len: 2, category: "filler", friendlyLabel: "Filler", readOnly: true },
  { name: "entrada_saida", start: 113, len: 1, type: "A", category: "meta", friendlyLabel: "Entrada/Saída", readOnly: true, desc: "Fixo 'E'" },
  { name: "especie", start: 114, len: 3, type: "A", category: "meta", friendlyLabel: "Espécie Nota", desc: "NFC, NFE, NFM, NFF, NFU ou NFT" },
  { name: "flag_cancelada", start: 117, len: 1, type: "A", category: "meta", friendlyLabel: "Flag Cancelada" },
  { name: "filler_4", start: 118, len: 1, category: "filler", friendlyLabel: "Filler", readOnly: true },
  { name: "flag_entrada", start: 119, len: 1, type: "A", category: "meta", friendlyLabel: "Flag Entrada", readOnly: true, desc: "Fixo 'I'" },
  { name: "numero_di", start: 120, len: 10, type: "A", category: "id", friendlyLabel: "Número DI", desc: "Número DI" },
  { name: "serie", start: 130, len: 3, type: "A", category: "meta", friendlyLabel: "Série" },
  { name: "cod_sit_tributaria", start: 133, len: 2, type: "A", category: "tax", friendlyLabel: "Cód. Sit. Tributária" },
  { name: "sit_tributaria_e", start: 135, len: 5, type: "A", category: "tax", friendlyLabel: "Sit. Tributária (E)" },
  { name: "sit_tributaria_f", start: 140, len: 5, type: "A", category: "tax", friendlyLabel: "Sit. Tributária (F)" },
  { name: "uf_emitente", start: 145, len: 2, type: "A", category: "meta", friendlyLabel: "UF Emitente" },
  { name: "via_transporte", start: 147, len: 1, type: "A", category: "meta", friendlyLabel: "Via Transporte" },
  { name: "valor_frete", start: 148, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Frete" },
  { name: "valor_icms", start: 163, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor ICMS" },
  { name: "valor_base_icms", start: 178, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base ICMS" },
  { name: "cod_importador", start: 193, len: 4, type: "A", category: "id", friendlyLabel: "Cód. Importador" },
  { name: "cod_transportador", start: 197, len: 20, type: "A", category: "meta", friendlyLabel: "Cód. Transportador" },
  { name: "valor_seguro", start: 217, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Seguro" },
  { name: "valor_ipi", start: 232, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor IPI" },
  { name: "valor_total_mercadoria", start: 247, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Total Mercadoria", desc: "Obrigatório" },
  { name: "valor_total_nota", start: 262, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Total Nota", desc: "Obrigatório" },
  { name: "valor_base_ipi", start: 277, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base IPI" },
  { name: "filler_5", start: 292, len: 2, category: "filler", friendlyLabel: "Filler", readOnly: true },
  { name: "cod_exportador", start: 294, len: 4, type: "A", category: "id", friendlyLabel: "Cód. Exportador" },
  { name: "nome_exportador", start: 298, len: 60, type: "A", category: "text", friendlyLabel: "Nome Exportador" },
  { name: "numero_po", start: 358, len: 17, type: "A", category: "id", friendlyLabel: "Número PO" },
  { name: "perc_reducao", start: 375, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Red. Base ICMS", unit: "%" },
  { name: "numero_duimp", start: 381, len: 15, type: "A", category: "id", friendlyLabel: "Número DUIMP", isDUIMPOnly: true },
  { name: "versao_registro", start: 396, len: 4, type: "A", category: "meta", friendlyLabel: "Versão Registro", isDUIMPOnly: true },
];

export const ITEM_SCHEMA: FieldDef[] = [
  { name: "tipo", start: 1, len: 1, category: "meta", friendlyLabel: "Tipo Registro", readOnly: true, desc: "Identificador Detalhe (Fixed 2)" },
  { name: "empresa", start: 2, len: 2, category: "meta", friendlyLabel: "Empresa", readOnly: true },
  { name: "filial", start: 4, len: 2, category: "meta", friendlyLabel: "Filial", readOnly: true },
  { name: "numero_nota", start: 6, len: 9, type: "N", decimals: 0, category: "id", friendlyLabel: "Número da Nota" },
  { name: "num_lancamento", start: 15, len: 6, type: "N", decimals: 0, category: "meta", friendlyLabel: "Num. Lançamento" },
  { name: "ncm", start: 21, len: 10, type: "N", decimals: 0, category: "id", friendlyLabel: "NCM", desc: "Classificação fiscal" },
  { name: "cod_produto", start: 31, len: 20, type: "A", category: "id", friendlyLabel: "Código Interno", desc: "Código do produto no Easy" },
  { name: "trib_icms", start: 51, len: 1, type: "N", decimals: 0, category: "tax", friendlyLabel: "Trib. ICMS" },
  { name: "trib_ipi", start: 52, len: 1, type: "N", decimals: 0, category: "tax", friendlyLabel: "Trib. IPI" },
  { name: "num_item", start: 53, len: 2, type: "N", decimals: 0, category: "meta", friendlyLabel: "Num. Item" },
  { name: "quantidade", start: 55, len: 12, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Quantidade", desc: "Obrigatório" },
  { name: "unidade", start: 67, len: 3, type: "A", category: "meta", friendlyLabel: "Unidade", desc: "Usa unidade do Easy" },
  { name: "valor_ipi", start: 70, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor IPI" },
  { name: "valor_mercadoria", start: 85, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Mercadoria", desc: "CIF + II" },
  { name: "flag_entrada", start: 100, len: 1, type: "A", category: "meta", friendlyLabel: "Flag Entrada", readOnly: true, desc: "Fixo 'I'" },
  { name: "qtd_recebimento", start: 101, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtd. Recebimento" },
  { name: "descricao", start: 112, len: 150, type: "A", category: "text", friendlyLabel: "Descrição" },
  { name: "valor_fob", start: 262, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor FOB (R$)", desc: "Obrigatório" },
  { name: "valor_frete", start: 277, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Frete" },
  { name: "valor_seguro", start: 292, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Seguro" },
  { name: "valor_ii", start: 307, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor II" },
  { name: "aliq_ipi", start: 322, len: 5, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. IPI", unit: "%" },
  { name: "valor_despesas", start: 327, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Despesas" },
  { name: "num_processo_easy", start: 342, len: 17, type: "A", category: "id", friendlyLabel: "Num. Processo Easy", desc: "Obrigatório" },
  { name: "ex_ncm", start: 359, len: 3, type: "A", category: "id", friendlyLabel: "EX NCM" },
  { name: "num_invoice", start: 362, len: 15, type: "A", category: "id", friendlyLabel: "Num. Invoice" },
  { name: "icms_recolher", start: 377, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "ICMS a Recolher" },
  { name: "peso_liquido", start: 392, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Peso Líquido", unit: "kg", desc: "Obrigatório" },
  { name: "item_pedido", start: 403, len: 4, type: "C", category: "id", friendlyLabel: "Item Pedido", desc: "Obrigatório no Easy" },
  { name: "aliq_ii", start: 407, len: 5, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. II", unit: "%" },
  { name: "num_pedido", start: 412, len: 17, type: "C", category: "id", friendlyLabel: "Num. Pedido", desc: "Obrigatório no Easy" },
  { name: "num_pli", start: 429, len: 10, type: "C", category: "id", friendlyLabel: "PLI / LI" },
  { name: "serie", start: 439, len: 3, type: "C", category: "meta", friendlyLabel: "Série", desc: "Deve coincidir com header" },
  { name: "base_icms", start: 442, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base ICMS" },
  { name: "valor_fob_origem", start: 457, len: 15, type: "N", decimals: 7, category: "value", friendlyLabel: "FOB Moeda Origem" },
  { name: "aliq_pis", start: 472, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. PIS", unit: "%" },
  { name: "vlr_qtde_pis", start: 478, len: 9, type: "N", decimals: 2, category: "tax", friendlyLabel: "Vlr. Qtde PIS" },
  { name: "base_pis", start: 487, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base PIS" },
  { name: "valor_pis", start: 502, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor PIS" },
  { name: "aliq_cofins", start: 517, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. COFINS", unit: "%" },
  { name: "vlr_qtde_cofins", start: 523, len: 9, type: "N", decimals: 2, category: "tax", friendlyLabel: "Vlr. Qtde COFINS" },
  { name: "base_cofins", start: 532, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base COFINS" },
  { name: "valor_cofins", start: 547, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor COFINS" },
  { name: "num_adicao", start: 562, len: 3, type: "C", category: "id", friendlyLabel: "Num. Adição" },
  { name: "seq_item", start: 565, len: 3, type: "C", category: "id", friendlyLabel: "Seq. Item" },
  { name: "valor_desconto", start: 568, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Desconto" },
  { name: "valor_iof", start: 583, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor IOF" },
  { name: "despesas_aduaneiras", start: 598, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Despesas Aduaneiras" },
  { name: "aliq_esp_ipi", start: 613, len: 15, type: "N", decimals: 4, category: "tax", friendlyLabel: "Alíq. Esp. IPI" },
  { name: "qtde_ipi", start: 628, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtde IPI" },
  { name: "qtde_pis", start: 639, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtde PIS" },
  { name: "qtde_cofins", start: 650, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtde COFINS" },
  { name: "lote", start: 661, len: 10, type: "C", category: "id", friendlyLabel: "Lote" },
  { name: "validade", start: 671, len: 8, type: "D", category: "date", friendlyLabel: "Validade", dateFormat: "AAAAMMDD" },
  { name: "aliq_icms", start: 679, len: 5, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. ICMS", unit: "%" },
  { name: "aliq_maj_cofins", start: 684, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. Maj. COFINS", unit: "%" },
  { name: "perc_dif_icms", start: 690, len: 8, type: "N", decimals: 4, category: "tax", friendlyLabel: "% Dif. ICMS", unit: "%", isNewInV2: true },
  { name: "codigo_li", start: 698, len: 10, type: "C", category: "id", friendlyLabel: "Código LI", isNewInV2: true },
  { name: "codigo_li_substitutiva", start: 708, len: 10, type: "C", category: "id", friendlyLabel: "LI Substitutiva", isNewInV2: true },
];

export function getSchemaForLine(line: string, layout?: LayoutVersion): FieldDef[] {
  const type = line.charAt(0);
  if (type === "1") {
    if (layout === "v3_DI") {
      return HEADER_SCHEMA.filter((f) => !f.isDUIMPOnly);
    }
    return HEADER_SCHEMA;
  }
  if (type === "2") return ITEM_SCHEMA;
  return [];
}

export function extractFields(
  line: string,
  schema: FieldDef[],
  originalLine?: string,
): ExtractedField[] {
  return schema.map((def) => {
    const startIdx = def.start - 1;
    const endIdx = startIdx + def.len;
    const rawValue = line.substring(startIdx, endIdx);
    const originalRawValue = originalLine
      ? originalLine.substring(startIdx, endIdx)
      : undefined;
    return {
      def,
      rawValue,
      originalRawValue,
      isModified: originalRawValue !== undefined && rawValue !== originalRawValue,
    };
  });
}

export function detectLayoutVersion(lines: string[]): LayoutVersion {
  const headerLine = lines.find((l) => l.charAt(0) === "1");
  if (!headerLine) return "v3_DUIMP";
  return headerLine.length >= LAYOUT_LENGTHS.v3_DUIMP.header ? "v3_DUIMP" : "v3_DI";
}

function getDefaultRawValue(def: FieldDef): string {
  if (def.type === "N" && def.decimals !== undefined && def.decimals > 0) {
    const intWidth = def.len - def.decimals - 1;
    return "0".repeat(intWidth) + "." + "0".repeat(def.decimals);
  }
  if (def.type === "N") {
    return "0".repeat(def.len);
  }
  return " ".repeat(def.len);
}

function normalizeRawValue(def: FieldDef, val: string): string {
  if (def.category === "filler") {
    return val.padEnd(def.len, " ").slice(0, def.len);
  }

  if (def.type === "N" && def.decimals !== undefined && def.decimals > 0) {
    const intWidth = def.len - def.decimals - 1;
    let intPart: string;
    let decPart: string;

    const cleaned = val.replace(/[^0-9.]/g, "");

    if (!cleaned && val.trim().length > 0) {
      return val.padEnd(def.len, " ").slice(0, def.len);
    }

    if (cleaned.includes(".")) {
      const dotIdx = cleaned.indexOf(".");
      intPart = cleaned.slice(0, dotIdx);
      decPart = cleaned.slice(dotIdx + 1, dotIdx + 1 + def.decimals);
    } else {
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

  if (def.type === "N") {
    const cleaned = val.replace(/[^0-9]/g, "");

    if (!cleaned && val.trim().length > 0) {
      return val.padEnd(def.len, " ").slice(0, def.len);
    }

    return cleaned.padStart(def.len, "0").slice(-def.len);
  }

  return val.padEnd(def.len, " ").slice(0, def.len);
}

export function padLineToLayout(line: string, target: LayoutVersion): string {
  const type = line.charAt(0);
  const schema = type === "1"
    ? HEADER_SCHEMA.filter((f) => target === "v3_DUIMP" || !f.isDUIMPOnly)
    : type === "2" ? ITEM_SCHEMA : null;
  if (!schema) return line;

  const targetLen = type === "1"
    ? LAYOUT_LENGTHS[target].header
    : LAYOUT_LENGTHS[target].item;

  let result = "";
  for (const def of schema) {
    const startIdx = def.start - 1;
    if (startIdx < line.length) {
      const rawValue = line.substring(startIdx, startIdx + def.len);
      result += normalizeRawValue(def, rawValue);
    } else {
      result += getDefaultRawValue(def);
    }
  }

  return result.slice(0, targetLen).padEnd(targetLen, " ");
}

export function convertLinesToLayout(content: string, target: LayoutVersion): string {
  return content
    .split(/\r\n|\n|\r/)
    .filter((l) => l.trim().length > 0)
    .map((l) => padLineToLayout(l, target))
    .join("\r\n") + "\r\n";
}
