import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AdicaoData, ItemData } from "@/types";

interface StepItensProps {
  adicoes: AdicaoData[];
  onChange: (adicoes: AdicaoData[]) => void;
}

function emptyItem(sequence: string): ItemData {
  return {
    sequence,
    description: "",
    qty: 1,
    unit: "UN",
    unit_value: 0,
    internal_code: "",
    output_unit: "UN",
    cfop: "",
    invoice_number: "",
  };
}

function ItemRow({
  item,
  onUpdate,
  onRemove,
  canRemove,
}: {
  item: ItemData;
  onUpdate: (updated: ItemData) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const update = (patch: Partial<ItemData>) => onUpdate({ ...item, ...patch });

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Item #{item.sequence}</span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="Remover item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <Label>Descrição do Produto</Label>
          <Input
            value={item.description || ""}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Descrição conforme NF"
          />
        </div>
        <div className="space-y-1">
          <Label required>Cód. Interno (ERP)</Label>
          <Input
            value={item.internal_code || ""}
            onChange={(e) => update({ internal_code: e.target.value })}
            placeholder="Obrigatório"
            error={!item.internal_code}
          />
        </div>
        <div className="space-y-1">
          <Label>CFOP (item)</Label>
          <Input
            value={item.cfop || ""}
            onChange={(e) => update({ cfop: e.target.value })}
            placeholder="Usa CFOP da capa se vazio"
          />
        </div>
        <div className="space-y-1">
          <Label required>Quantidade</Label>
          <Input
            type="number"
            step="any"
            value={item.qty || ""}
            onChange={(e) => update({ qty: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <Label>Unidade</Label>
          <Input
            value={item.unit || ""}
            onChange={(e) => update({ unit: e.target.value, output_unit: e.target.value })}
            placeholder="UN"
            maxLength={3}
          />
        </div>
        <div className="space-y-1">
          <Label required>Valor Unitário (R$)</Label>
          <Input
            type="number"
            step="any"
            value={item.unit_value || ""}
            onChange={(e) => update({ unit_value: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <Label>Nº Invoice</Label>
          <Input
            value={item.invoice_number || ""}
            onChange={(e) => update({ invoice_number: e.target.value })}
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-1">
          <Label>Item do Pedido de Compra</Label>
          <Input
            value={item.item_pedido_compra || ""}
            onChange={(e) => update({ item_pedido_compra: e.target.value })}
            placeholder="Opcional (padrão: sequência)"
          />
        </div>
      </div>
    </div>
  );
}

function AdicaoItemsSection({
  adicao,
  onUpdate,
}: {
  adicao: AdicaoData;
  onUpdate: (updated: AdicaoData) => void;
}) {
  const addItem = () => {
    const seq = String(adicao.items.length + 1).padStart(3, "0");
    onUpdate({ ...adicao, items: [...adicao.items, emptyItem(seq)] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ ...adicao, items: adicao.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx: number, updated: ItemData) => {
    onUpdate({ ...adicao, items: adicao.items.map((it, i) => (i === idx ? updated : it)) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Adição #{adicao.number} — NCM {adicao.ncm || "—"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {adicao.items.length} item(s) • LI: {adicao.li_number || "N/A"}
          </p>
        </div>
        <Button variant="outline" onClick={addItem} className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Adicionar Item
        </Button>
      </div>

      {adicao.items.length === 0 && (
        <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          Nenhum item adicionado. Clique em "Adicionar Item" para começar.
        </div>
      )}

      {adicao.items.map((item, itemIdx) => (
        <ItemRow
          key={itemIdx}
          item={item}
          onUpdate={(u) => updateItem(itemIdx, u)}
          onRemove={() => removeItem(itemIdx)}
          canRemove={adicao.items.length > 1}
        />
      ))}
    </div>
  );
}

export function StepItens({ adicoes, onChange }: StepItensProps) {
  const updateAdicao = (idx: number, updated: AdicaoData) => {
    onChange(adicoes.map((a, i) => (i === idx ? updated : a)));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Adicione os itens (mercadorias) para cada adição. O código interno do produto é obrigatório.
      </p>

      {adicoes.map((adicao, idx) => (
        <div key={idx}>
          <AdicaoItemsSection
            adicao={adicao}
            onUpdate={(u) => updateAdicao(idx, u)}
          />
          {idx < adicoes.length - 1 && <Separator className="mt-6" />}
        </div>
      ))}
    </div>
  );
}
