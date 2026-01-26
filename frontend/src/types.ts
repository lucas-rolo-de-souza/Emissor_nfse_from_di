// Types for Data Review UI

export interface DetailedTax {
  base_calc: number;
  rate: number;
  rate_reduced: number;
  value_due: number;
  value_collect: number;
  regime_code: string;
  regime_name: string;
}

export interface TaxBreakdown {
  ii: DetailedTax;
  ipi: DetailedTax;
  pis: DetailedTax;
  cofins: DetailedTax;
  icms: DetailedTax;
}

export interface SupplierData {
  name: string;
  address: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  country_name: string;
}

export interface IncotermData {
  term: string;
  local: string;
  method_val_code: string;
  method_val_name: string;
}

export interface LogisticsData {
  origin_country_code: string;
  origin_country_name: string;
  acquisition_country_code: string;
  acquisition_country_name: string;
}

export interface NVEData {
  attr: string;
  spec: string;
  level: string;
}

export interface ItemData {
  // From XML
  sequence: string;
  description: string;
  qty: number;
  unit: string;
  unit_value: number;
  // User-provided
  internal_code: string;
  output_unit: string;
  cfop?: string;
  invoice_number?: string;
}

export interface AdicaoData {
  number: string;
  ncm: string;
  li_number: string;
  net_weight: number;
  gross_weight: number;

  // Values
  fob_currency: number;
  fob_reais: number;
  freight_reais: number;
  insurance_reais: number;

  // Complex Nested Data
  supplier: SupplierData;
  incoterm: IncotermData;
  logistics: LogisticsData;
  taxes: TaxBreakdown;
  nves: NVEData[];

  items: ItemData[];
}

export interface HeaderData {
  // From XML
  di_number: string;
  duimp_number?: string;
  di_date: string;
  exporter_name: string;
  exporter_city: string;
  exporter_country: string;
  importer_code: string;
  importer_name: string;
  urf_entry: string;
  transport_via: string;
  provenance_country_code: string;
  valor_total_frete: number;
  valor_total_seguro: number;
  total_additions: number;
  // User-provided
  numero_nota: string;
  data_emissao: string;
  data_entrada: string;
  cfop: string;
  numero_po: string;
  perc_reducao: string;
  cod_importador: string;
  cod_transportador: string;
  cod_exportador: string;
  invoice_number: string;
}

export interface ExtractedData {
  header: HeaderData;
  adicoes: AdicaoData[];
}

// Field metadata for validation
export const REQUIRED_HEADER_FIELDS: (keyof HeaderData)[] = [
  "numero_nota",
  "data_emissao",
  "data_entrada",
  "cfop",
];

export const REQUIRED_ITEM_FIELDS: (keyof ItemData)[] = ["internal_code"];

// Helper to check if field is required
export const isRequiredHeaderField = (field: keyof HeaderData): boolean =>
  REQUIRED_HEADER_FIELDS.includes(field);

export const isRequiredItemField = (field: keyof ItemData): boolean =>
  REQUIRED_ITEM_FIELDS.includes(field);

// Labels for display
export const HEADER_LABELS: Partial<Record<keyof HeaderData, string>> = {
  di_number: "Número DI",
  di_date: "Data DI",
  exporter_name: "Exportador",
  numero_nota: "Número da Nota *",
  data_emissao: "Data Emissão *",
  data_entrada: "Data Entrada *",
  cfop: "CFOP *",
  numero_po: "Número PO",
  cod_importador: "Cód. Importador",
  cod_transportador: "Cód. Transportador",
  cod_exportador: "Cód. Exportador",
};

export const ITEM_LABELS: Partial<Record<keyof ItemData, string>> = {
  description: "Descrição",
  qty: "Qtd",
  unit_value: "Valor Unit.",
  internal_code: "Cód. Interno *",
};
