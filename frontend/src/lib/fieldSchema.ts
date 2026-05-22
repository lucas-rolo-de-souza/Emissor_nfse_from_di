export type FieldCategory =
  | "id"
  | "tax"
  | "value"
  | "quantity"
  | "date"
  | "meta"
  | "filler"
  | "text";

export type LayoutVersion = "v1" | "v2";

export const LAYOUT_LENGTHS: Record<LayoutVersion, { header: number; item: number }> = {
  v1: { header: 380, item: 688 },
  v2: { header: 399, item: 716 },
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
  { name: "data_emissao", start: 81, len: 8, type: "N", decimals: 0, category: "date", friendlyLabel: "Data Emissão", dateFormat: "DDMMAAAA", desc: "DDMMAAAA (obrigatório)" },
  { name: "data_entrada", start: 89, len: 8, type: "N", decimals: 0, category: "date", friendlyLabel: "Data Entrada", dateFormat: "DDMMAAAA", desc: "DDMMAAAA (obrigatório)" },
  { name: "filler_2", start: 97, len: 6, category: "filler", friendlyLabel: "Filler", readOnly: true },
  { name: "data_di", start: 103, len: 8, type: "N", decimals: 0, category: "date", friendlyLabel: "Data DI", dateFormat: "DDMMAAAA" },
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
  { name: "numero_duimp", start: 381, len: 15, type: "A", category: "id", friendlyLabel: "Número DUIMP", isNewInV2: true },
  { name: "versao_registro", start: 396, len: 4, type: "A", category: "meta", friendlyLabel: "Versão Registro", isNewInV2: true },
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
  { name: "quantidade", start: 55, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Quantidade", desc: "Obrigatório" },
  { name: "unidade", start: 66, len: 3, type: "A", category: "meta", friendlyLabel: "Unidade", desc: "Usa unidade do Easy" },
  { name: "valor_ipi", start: 69, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor IPI" },
  { name: "valor_mercadoria", start: 84, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Mercadoria", desc: "CIF + II" },
  { name: "flag_entrada", start: 99, len: 1, type: "A", category: "meta", friendlyLabel: "Flag Entrada", readOnly: true, desc: "Fixo 'I'" },
  { name: "qtd_recebimento", start: 100, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtd. Recebimento" },
  { name: "descricao", start: 111, len: 150, type: "A", category: "text", friendlyLabel: "Descrição" },
  { name: "valor_fob", start: 261, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor FOB (R$)", desc: "Obrigatório" },
  { name: "valor_frete", start: 276, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Frete" },
  { name: "valor_seguro", start: 291, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Seguro" },
  { name: "valor_ii", start: 306, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor II" },
  { name: "aliq_ipi", start: 321, len: 5, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. IPI", unit: "%" },
  { name: "valor_despesas", start: 326, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Despesas" },
  { name: "num_processo_easy", start: 341, len: 17, type: "A", category: "id", friendlyLabel: "Num. Processo Easy", desc: "Obrigatório" },
  { name: "ex_ncm", start: 358, len: 3, type: "A", category: "id", friendlyLabel: "EX NCM" },
  { name: "num_invoice", start: 361, len: 15, type: "A", category: "id", friendlyLabel: "Num. Invoice" },
  { name: "icms_recolher", start: 376, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "ICMS a Recolher" },
  { name: "peso_liquido", start: 391, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Peso Líquido", unit: "kg", desc: "Obrigatório" },
  { name: "item_pedido", start: 402, len: 4, type: "C", category: "id", friendlyLabel: "Item Pedido", desc: "Obrigatório no Easy" },
  { name: "aliq_ii", start: 406, len: 5, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. II", unit: "%" },
  { name: "num_pedido", start: 411, len: 17, type: "C", category: "id", friendlyLabel: "Num. Pedido", desc: "Obrigatório no Easy" },
  { name: "num_pli", start: 428, len: 10, type: "C", category: "id", friendlyLabel: "PLI / LI" },
  { name: "serie", start: 438, len: 3, type: "C", category: "meta", friendlyLabel: "Série", desc: "Deve coincidir com header" },
  { name: "base_icms", start: 441, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base ICMS" },
  { name: "valor_fob_origem", start: 456, len: 15, type: "N", decimals: 7, category: "value", friendlyLabel: "FOB Moeda Origem" },
  { name: "aliq_pis", start: 471, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. PIS", unit: "%" },
  { name: "vlr_qtde_pis", start: 477, len: 9, type: "N", decimals: 2, category: "tax", friendlyLabel: "Vlr. Qtde PIS" },
  { name: "base_pis", start: 486, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base PIS" },
  { name: "valor_pis", start: 501, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor PIS" },
  { name: "aliq_cofins", start: 516, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. COFINS", unit: "%" },
  { name: "vlr_qtde_cofins", start: 522, len: 9, type: "N", decimals: 2, category: "tax", friendlyLabel: "Vlr. Qtde COFINS" },
  { name: "base_cofins", start: 531, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Base COFINS" },
  { name: "valor_cofins", start: 546, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor COFINS" },
  { name: "num_adicao", start: 561, len: 3, type: "C", category: "id", friendlyLabel: "Num. Adição" },
  { name: "seq_item", start: 564, len: 3, type: "C", category: "id", friendlyLabel: "Seq. Item" },
  { name: "valor_desconto", start: 567, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Valor Desconto" },
  { name: "valor_iof", start: 582, len: 15, type: "N", decimals: 2, category: "tax", friendlyLabel: "Valor IOF" },
  { name: "despesas_aduaneiras", start: 597, len: 15, type: "N", decimals: 2, category: "value", friendlyLabel: "Despesas Aduaneiras" },
  { name: "aliq_esp_ipi", start: 612, len: 15, type: "N", decimals: 4, category: "tax", friendlyLabel: "Alíq. Esp. IPI" },
  { name: "qtde_ipi", start: 627, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtde IPI" },
  { name: "qtde_pis", start: 638, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtde PIS" },
  { name: "qtde_cofins", start: 649, len: 11, type: "N", decimals: 4, category: "quantity", friendlyLabel: "Qtde COFINS" },
  { name: "lote", start: 660, len: 10, type: "C", category: "id", friendlyLabel: "Lote" },
  { name: "validade", start: 670, len: 8, type: "D", category: "date", friendlyLabel: "Validade", dateFormat: "AAAAMMDD" },
  { name: "aliq_icms", start: 678, len: 5, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. ICMS", unit: "%" },
  { name: "aliq_maj_cofins", start: 683, len: 6, type: "N", decimals: 2, category: "tax", friendlyLabel: "Alíq. Maj. COFINS", unit: "%" },
  { name: "perc_dif_icms", start: 689, len: 8, type: "N", decimals: 4, category: "tax", friendlyLabel: "% Dif. ICMS", unit: "%", isNewInV2: true },
  { name: "codigo_li", start: 697, len: 10, type: "C", category: "id", friendlyLabel: "Código LI", isNewInV2: true },
  { name: "codigo_li_substitutiva", start: 707, len: 10, type: "C", category: "id", friendlyLabel: "LI Substitutiva", isNewInV2: true },
];

export function getSchemaForLine(line: string): FieldDef[] {
  const type = line.charAt(0);
  if (type === "1") return HEADER_SCHEMA;
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
  if (!headerLine) return "v2";
  return headerLine.length >= LAYOUT_LENGTHS.v2.header ? "v2" : "v1";
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

export function padLineToLayout(line: string, target: LayoutVersion): string {
  const type = line.charAt(0);
  const schema = type === "1" ? HEADER_SCHEMA : type === "2" ? ITEM_SCHEMA : null;
  if (!schema) return line;

  const targetLen = type === "1"
    ? LAYOUT_LENGTHS[target].header
    : LAYOUT_LENGTHS[target].item;

  if (line.length >= targetLen) return line.slice(0, targetLen);

  let result = line;
  for (const def of schema) {
    const startIdx = def.start - 1;
    if (startIdx >= result.length && startIdx < targetLen) {
      result = result.padEnd(startIdx, " ") + getDefaultRawValue(def);
    }
  }
  return result.slice(0, targetLen).padEnd(targetLen, " ");
}

export function convertLinesToLayout(content: string, target: LayoutVersion): string {
  return content
    .split(/\r\n|\n|\r/)
    .filter((l) => l.trim().length > 0)
    .map((l) => padLineToLayout(l, target))
    .join("\r");
}
