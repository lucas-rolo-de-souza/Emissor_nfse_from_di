# Layout NF de Entrada — Integração Despachante (SIGAEIC / TOTVS Easy)

> **Fonte:** `layout_despachante_nf_ajustado.docx`
> **Sistema alvo:** TOTVS SIGAEIC / Easy Import
> **Referência TDN:** https://tdn.totvs.com/pages/viewpage.action?pageId=394220238

---

## 1. Visão Geral do Arquivo

| Atributo | Valor |
|---|---|
| Formato | ASCII texto plano |
| Extensão | `.TXT` |
| Separador de campos | **Nenhum** — campos contíguos, posicionais |
| Delimitador de registro | `CHR(13)+CHR(10)` — CRLF (`\r\n`) |
| Codificação | ASCII |
| Tipos de registro | `"1"` = Capa da NF · `"2"` = Itens da NF |
| Tamanho do registro CAPA (DI) | **380 caracteres** + CRLF |
| Tamanho do registro CAPA (DUIMP) | **399 caracteres** + CRLF |
| Tamanho do registro ITENS | **717 caracteres** + CRLF (idêntico para DI e DUIMP) |

> **Tamanhos CAPA:** O layout DUIMP possui 399 posições (campos 1–47). Para processos **DI**, os campos exclusivos DUIMP (campo 46 = 15 chars + campo 47 = 4 chars = **19 chars**) são omitidos, resultando em **380 posições** (399 − 19). Esses são os **únicos dois tamanhos válidos** para o registro CAPA.

Um único arquivo pode conter registros de capa e de itens intercalados. O campo na posição 1 (`Tipo`) identifica o tipo de cada linha.

---

## 2. Regras de Preenchimento

### 2.1 Campos Numéricos (Tipo `N`)

- Preenchidos com **zeros à esquerda** para a parte inteira.
- Preenchidos com **zeros à direita** para a parte decimal.
- O caractere **`.` (ponto)** é **obrigatório** como separador decimal e sempre ocupa a mesma posição dentro do campo.
- **TAM** = total de posições incluindo inteiros + ponto + decimais.
  - Exemplo: TAM=15, DEC=2 → 12 inteiros + `.` + 2 decimais.
- Exemplos para valor 5762,31 em campo N(15,2):

```
000005762.310000   ← zeros à esquerda e à direita
     5762.31        ← espaços à esquerda (válido)
000005762.31        ← zeros à esquerda sem trailing (válido)
     5762.31000     ← espaços à esquerda, zeros à direita (válido)
```

> **Campos N/G (não gravados):** Campos numéricos marcados como N/G que o sistema descarta podem ser enviados como **todo espaços** quando não houver valor a informar. O validador aceita esse preenchimento em branco para esses campos específicos. Campos N/G com decimais devem usar zeros (`000000000000.00`) quando não houver valor.

### 2.2 Campos de Data (Tipo `N` com DEC=`-`)

- Formato: **AAAAMMDD** (8 dígitos) para campos de 8 posições.
- Formato: **DDMMAA** (6 dígitos) para campos de 6 posições (Data de Referência).
- Completar com **zeros significativos à esquerda** (ex.: `04` para dia 4).
- Datas inválidas causam **rejeição do registro**.
- **Data de Referência (6 posições, N/U):** aceita `000000` como valor vazio ("zerado"). Qualquer outro valor de 6 dígitos deve ser uma data DDMMAA válida no calendário gregoriano.

### 2.3 Campos Caractere (Tipo `A` / `C`)

- Completar com **espaços** `CHR(32)` **à direita** até preencher o tamanho total.

### 2.4 Campos Lógicos (Tipo `L`)

- `T` = verdadeiro, `F` = falso.

### 2.5 Campos Fixos

Campos com valor fixo não devem variar. Qualquer desvio pode causar rejeição ou mau funcionamento.

---

## 3. Legenda de Símbolos

| Símbolo | Significado |
|---|---|
| `A` | Alfanumérico / Caractere |
| `N` | Numérico |
| `C` | Caractere |
| `D` | Data no formato AAAAMMDD |
| `M` | Memo (texto até 64 KB) |
| `L` | Lógico (T/F) |
| `TAM` | Tamanho total do campo (incluindo decimais e ponto) |
| `DEC` | Número de casas decimais (já computadas no TAM) |
| `-` | Sem decimais |
| `*` | Indica tamanho máximo |
| `REQ=#` | Obrigatório |
| `REQ=X` | Informar apenas na inclusão ou se quiser alterar |
| `REQ=$` | Obrigatório e não pode ser repetido |
| `CAD=X` | Deve estar previamente cadastrado no sistema |
| `Fixo` | Valor literal que não muda |
| `N/U` | Não utilizado pelo sistema (mas deve ser enviado no layout) |
| `N/G` | Não gravado pelo sistema (lido mas descartado) |

---

## 4. Parâmetros de Sistema Relevantes

| Parâmetro | Efeito |
|---|---|
| `MV_EIC0010` | Define se a alíquota de ICMS é lida da **CAPA** (campo 06) ou dos **ITENS** (campo 55) da nota fiscal. |
| `MV_EIC0076` | Quando `.T.` (padrão): campos Número P.O., HAWB e Invoice seguem tamanho do **layout padrão** (máx. 15 caracteres). Quando `.F.`: tamanho segue o Grupo de Campos **148** do dicionário de dados — requer alinhamento com o despachante. |

> **Atenção MV_EIC0076:** Ao usar o layout padrão (`.T.`), o Grupo de Campos 148 deve ter tamanho ≤ 15 caracteres. Se ultrapassar 15 caracteres, o sistema emite aviso informativo.

---

## 5. Tributos CBS e IBS (Reforma Tributária)

- Os campos CBS e IBS **NÃO estão no layout TXT**.
- O cálculo é feito **automaticamente** pelo sistema na geração do recebimento de importação.
- Para processos **DUIMP**: base de cálculo, alíquota e redução vêm dos **Itens da DUIMP**.
- Para processos **DI**: dados vêm do **Cadastro da NCM** vinculado ao item do processo.
- Base CBS/IBS = Valor Aduaneiro (FOB + frete + seguro + acréscimos − deduções) + despesas base ICMS + II + PIS + COFINS (excluídos IPI e ICMS).
- **Classificação Tributária (`WN_CSTCCT`)** também é preenchida automaticamente — não entra no TXT.

---

## 6. Registro Tipo "1" — CAPA DA NOTA FISCAL DE ENTRADA

**Tamanho total: 380 posições (DI) · 399 posições (DUIMP)**

Para processos **DI**, os campos 46 e 47 (exclusivos DUIMP) são omitidos. O tamanho DI é calculado como: 399 − 15 (campo 46) − 4 (campo 47) = **380**. Para processos **DUIMP**, todos os 47 campos estão presentes e o tamanho é **399**.

| Seq | Campo | Tipo | TAM | DEC | Início | Fim | Obrig. | Fixo | Uso Sistema | Observações |
|-----|-------|------|-----|-----|--------|-----|--------|------|-------------|-------------|
| 01 | Tipo | A | 1 | - | 1 | 1 | Sim | `"1"` | Identifica CAPA | Literal `1` sempre |
| 02 | Código da Empresa | N | 2 | - | 2 | 3 | Sim | `"01"` | N/U | Fixo `01` |
| 03 | Código da Filial | N | 2 | - | 4 | 5 | Sim | `"01"` | N/U | Fixo `01` |
| 04 | Número da Nota | N | 9 | - | 6 | 14 | **Sim** | — | Sim | Número da NF; obrigatório |
| 05 | Filler | A | 6 | - | 15 | 20 | — | espaços | N/U | Preencher com espaços |
| 06 | Aliq. ICMS | N | 7 | 2 | 21 | 27 | — | — | Condicional | Depende de `MV_EIC0010`; inteiros=4, ponto, decimais=2 |
| 07 | CFOP | N | 6 | - | 28 | 33 | — | — | Sim | Código deve estar cadastrado no Easy |
| 08 | CFP | A | 5 | - | 34 | 38 | — | — | **N/U** | Campo não utilizado |
| 09 | CGC – Emitente | N | 14 | - | 39 | 52 | — | — | **N/U** | CNPJ do emitente; não utilizado |
| 10 | Código do IPI | A | 3 | - | 53 | 55 | — | — | **N/U** | Campo não utilizado |
| 11 | Número do processo | A | 17 | - | 56 | 72 | **Sim** | — | Sim | Número do processo de embarque/desembaraço |
| 12 | Quantidade de Itens | N | 2 | - | 73 | 74 | **Sim** | — | N/G | Qtd de itens (máx 99); obrigatório mas não gravado |
| 13 | Data de Referência | N | 6 | - | 75 | 80 | — | — | **N/U** | Formato DDMMAA; não utilizado. Enviar `000000` quando não houver data. Outros valores devem ser DDMMAA válido |
| 14 | Data de Emissão | N | 8 | - | 81 | 88 | **Sim** | — | Sim | Formato AAAAMMDD; obrigatório |
| 15 | Data de Entrada | N | 8 | - | 89 | 96 | **Sim** | — | N/G | Formato AAAAMMDD; obrigatório mas não gravado |
| 16 | Filler | A | 6 | - | 97 | 102 | — | espaços | N/U | Preencher com espaços |
| 17 | Data de Registro | N | 8 | - | 103 | 110 | **Sim** | — | N/G | Formato AAAAMMDD; obrigatório mas não gravado. Vale para DI e DUIMP |
| 18 | Filler | A | 2 | - | 111 | 112 | — | espaços | N/U | Preencher com espaços |
| 19 | Entrada / Saída | A | 1 | - | 113 | 113 | Sim | `"E"` | **N/U** | Fixo `E`; não utilizado |
| 20 | Espécie | A | 3 | - | 114 | 116 | **Sim** | — | Sim | Valores válidos: `NFC`, `NFE`, `NFM`, `NFF`, `NFU`, `NFT` |
| 21 | Flag Cancelada | A | 1 | - | 117 | 117 | — | — | **N/U** | Não há tratamento de notas canceladas no Easy |
| 22 | Filler | A | 1 | - | 118 | 118 | — | espaços | N/U | Preencher com espaço |
| 23 | Flag Entrada | A | 1 | - | 119 | 119 | Sim | `"I"` | **N/U** | Fixo `I`; não utilizado |
| 24 | Número da DI | A | 10 | - | 120 | 129 | — | — | Condicional | Se preenchido, gravado no desembaraço |
| 25 | Série | A | 3 | - | 130 | 132 | **Sim** | — | Sim | Deve ser igual à série dos registros ITENS |
| 26 | Código de Sit. Tributária | A | 2 | - | 133 | 134 | — | — | N/G | Não gravado |
| 27 | Situação Tributária – E | A | 5 | - | 135 | 139 | — | — | N/G | Não gravado |
| 28 | Situação Tributária – F | A | 5 | - | 140 | 144 | — | — | N/G | Não gravado |
| 29 | UF do Emitente | A | 2 | - | 145 | 146 | — | — | N/G | Não gravado |
| 30 | Via de Transporte | A | 1 | - | 147 | 147 | — | — | **N/U** | Não utilizado |
| 31 | Valor do Frete | N | 15 | 2 | 148 | 162 | — | — | **N/U** | Inteiros=12, ponto, decimais=2; não utilizado |
| 32 | Valor do ICMS | N | 15 | 2 | 163 | 177 | — | — | N/G | Não gravado |
| 33 | Valor da Base do ICMS | N | 15 | 2 | 178 | 192 | — | — | N/G | Não gravado |
| 34 | Código do Importador | A | 4 | - | 193 | 196 | — | — | **N/U** | Não utilizado |
| 35 | Código do Transportador | A | 20 | - | 197 | 216 | — | — | **N/U** | Não utilizado |
| 36 | Valor do Seguro | N | 15 | 2 | 217 | 231 | — | — | **N/U** | Não utilizado |
| 37 | Valor do IPI | N | 15 | 2 | 232 | 246 | — | — | N/G | Não gravado |
| 38 | Valor Total da Mercadoria | N | 15 | 2 | 247 | 261 | **Sim** | — | Sim | Obrigatório |
| 39 | Valor Total da Nota | N | 15 | 2 | 262 | 276 | **Sim** | — | Sim | Obrigatório |
| 40 | Valor Base do IPI | N | 15 | 2 | 277 | 291 | — | — | N/G | Não gravado |
| 41 | Filler | A | 2 | - | 292 | 293 | — | espaços | N/U | Preencher com espaços |
| 42 | Código do Exportador | A | 4 | - | 294 | 297 | — | — | **N/U** | Não utilizado |
| 43 | Nome do Exportador | A | 60 | - | 298 | 357 | — | — | **N/U** | Não utilizado |
| 44 | Numero do PO | A | 17 | - | 358 | 374 | — | — | **N/U** | Tamanho afetado por `MV_EIC0076`; padrão=17 |
| 45 | Perc. Redução de Base de ICMS | N | 6 | 2 | 375 | 380 | — | — | Condicional | Inteiros=3, ponto, decimais=2; quando houver redução. **Último campo de registros DI (pos. final = 380).** |
| 46 | Número da DUIMP | A | 15 | - | 381 | 395 | — | — | **DUIMP only** | Omitido em registros DI. Se preenchido, usado como `W6_DI_NUM`. |
| 47 | Versão do Registro | A | 4 | - | 396 | 399 | — | — | **DUIMP only** | Omitido em registros DI. Se preenchido, assume na integração DUIMP. |

### 6.1 Validações Críticas — CAPA

- Campo 01 deve ser literal `1`.
- Campos 02 e 03 devem ser literais `01`.
- Campo 04 (Número da Nota): obrigatório, 9 dígitos, zero-padded à esquerda.
- Campo 07 (CFOP): deve estar cadastrado no Easy.
- Campo 11 (Número do processo): obrigatório; identifica o desembaraço.
- Campo 12 (Qtd Itens): obrigatório, valor entre 01 e 99.
- Campo 14 (Data Emissão): obrigatório, AAAAMMDD válido.
- Campo 15 (Data Entrada): obrigatório no layout; não gravado.
- Campo 17 (Data Registro): obrigatório no layout; não gravado.
- Campo 19: fixo `E`.
- Campo 20 (Espécie): obrigatório; apenas `NFC`, `NFE`, `NFM`, `NFF`, `NFU` ou `NFT`.
- Campo 23: fixo `I`.
- Campo 25 (Série): deve coincidir com a série em todos os registros ITENS desta NF.
- Campos 38 e 39 (Totais): obrigatórios.
- **Total de posições: exatamente 380 para DI · exatamente 399 para DUIMP.** Nenhum outro tamanho é válido.
  - DI termina no campo 45 (pos. 380); campos 46 e 47 são omitidos.
  - DUIMP inclui campos 46 (15 chars) e 47 (4 chars), encerrando em pos. 399.

---

## 7. Registro Tipo "2" — ITENS DA NOTA FISCAL DE ENTRADA

**Tamanho total: 717 posições**

| Seq | Campo | Tipo | TAM | DEC | Início | Fim | Obrig. | Fixo | Uso Sistema | Observações |
|-----|-------|------|-----|-----|--------|-----|--------|------|-------------|-------------|
| 01 | Tipo | A | 1 | - | 1 | 1 | Sim | `"2"` | Identifica ITEM | Literal `2` sempre |
| 02 | Código da Empresa | N | 2 | - | 2 | 3 | Sim | `"01"` | N/U | Fixo `01` |
| 03 | Código da Filial | N | 2 | - | 4 | 5 | Sim | `"01"` | N/U | Fixo `01` |
| 04 | Número da Nota | N | 9 | - | 6 | 14 | **Sim** | — | Sim | Deve coincidir com o campo 04 do registro CAPA |
| 05 | Número do Lançamento | N | 6 | - | 15 | 20 | — | — | N/G | Não gravado. Aceita zeros ou **todo espaços** |
| 06 | Classificação Fiscal | N | 10 | - | 21 | 30 | **Sim** | — | Sim | NCM — deve estar cadastrada no Easy. Preencher com zero-pad à esquerda (`0085044090`) |
| 07 | Código do Produto | A | 20 | - | 31 | 50 | **Sim** | — | Sim | Deve fazer parte do desembaraço no Easy |
| 08 | Código – Trib. – ICMS | N | 1 | - | 51 | 51 | — | — | N/G | Não gravado. Aceita zero ou **espaço** |
| 09 | Código – Trib. – IPI | N | 1 | - | 52 | 52 | — | — | N/G | Não gravado. Aceita zero ou **espaço** |
| 10 | Número do Item | N | 2 | - | 53 | 54 | — | — | N/G | Não gravado. Aceita zeros ou **espaços** |
| 11 | Quantidade | N | 12 | 4 | 55 | 66 | **Sim** | — | Sim | Inteiros=7, ponto, decimais=4; obrigatório para NF primeira/única |
| 12 | Unidade | A | 3 | - | 67 | 69 | — | — | N/U | Unidade enviada é ignorada; o sistema usa a cadastrada no Easy |
| 13 | Vlr. – IPI | N | 15 | 2 | 70 | 84 | — | — | Sim | Valor do IPI do item |
| 14 | Valor Mercadoria (CIF+II) | N | 15 | 2 | 85 | 99 | **Sim** | — | Sim | Valor total da mercadoria (CIF + II); obrigatório |
| 15 | Flag de Entrada | A | 1 | - | 100 | 100 | Sim | `"I"` | N/G | Fixo `I`; não gravado |
| 16 | Quantidade do Recebimento | N | 11 | 4 | 101 | 111 | — | — | N/G | Não gravado |
| 17 | Descrição do Produto | A | 150 | - | 112 | 261 | — | — | Sim | Descrição do produto na nota fiscal |
| 18 | Valor Fob R$ | N | 15 | 2 | 262 | 276 | **Sim** | — | Sim | Valor FOB da mercadoria em R$; obrigatório |
| 19 | Valor Frete R$ | N | 15 | 2 | 277 | 291 | — | — | Sim | Valor do frete em R$ |
| 20 | Valor do Seguro R$ | N | 15 | 2 | 292 | 306 | — | — | Sim | Valor do seguro em R$ |
| 21 | Valor II R$ | N | 15 | 2 | 307 | 321 | — | — | Sim | Valor do Imposto de Importação em R$ |
| 22 | Alíquota IPI | N | 5 | 2 | 322 | 326 | — | — | Sim | Inteiros=2, ponto, decimais=2; alíquota de IPI |
| 23 | Valor Despesas | N | 15 | 2 | 327 | 341 | — | — | Sim | Outras despesas do item |
| 24 | Nro Processo no Easy | A | 17 | - | 342 | 358 | **Sim** | — | Sim | Número do processo no Easy; obrigatório |
| 25 | Numero da EX da NCM | A | 3 | - | 359 | 361 | — | — | Sim | Número da exceção de NCM |
| 26 | Numero da Invoice | A | 15 | - | 362 | 376 | — | — | Sim | Número da invoice; tamanho afetado por `MV_EIC0076` |
| 27 | Valor do ICMS a recolher | N | 15 | 2 | 377 | 391 | — | — | Sim | Valor do ICMS a recolher por item |
| 28 | Peso Liquido do item | N | 11 | 4 | 392 | 402 | **Sim** | — | Sim | Inteiros=6, ponto, decimais=4; obrigatório |
| 29 | Item do Pedido de Compra | C | 4 | - | 403 | 406 | **Sim** | — | Sim | Item no pedido do Easy; obrigatório |
| 30 | Alíquota de II | N | 5 | 2 | 407 | 411 | — | — | Sim | Inteiros=2, ponto, decimais=2; alíquota do II |
| 31 | Numero do pedido | C | 17 | - | 412 | 428 | **Sim** | — | Sim | Número do pedido no Easy; obrigatório |
| 32 | Nro do Pedido de Licenciamento | C | 10 | - | 429 | 438 | **Sim** | — | Sim | Número da PLI no Easy; obrigatório |
| 33 | Série da Nota Fiscal | C | 3 | - | 439 | 441 | **Sim** | — | Sim | Deve coincidir com campo 25 da CAPA |
| 34 | Base de ICMS (por item) | N | 15 | 2 | 442 | 456 | — | — | Sim | Base de cálculo do ICMS por item |
| 35 | Valor FOB na moeda de Origem | N | 15 | 7 | 457 | 471 | — | — | Sim | Inteiros=7, ponto, decimais=7; FOB unitário na moeda de origem |
| 36 | Alíquota do PIS | N | 6 | 2 | 472 | 477 | — | — | Sim | Inteiros=3, ponto, decimais=2 |
| 37 | Valor por quantidade do PIS | N | 9 | 2 | 478 | 486 | — | — | Condicional | Preencher somente se PIS calculado por quantidade |
| 38 | Base de calculo do PIS | N | 15 | 2 | 487 | 501 | — | — | Sim | Base de cálculo do PIS |
| 39 | Valor do PIS | N | 15 | 2 | 502 | 516 | — | — | Sim | Valor do PIS |
| 40 | Alíquota do COFINS | N | 6 | 2 | 517 | 522 | — | — | Sim | Inteiros=3, ponto, decimais=2 |
| 41 | Valor por quantidade do COFINS | N | 9 | 2 | 523 | 531 | — | — | Condicional | Preencher somente se COFINS calculado por quantidade |
| 42 | Base de calculo do COFINS | N | 15 | 2 | 532 | 546 | — | — | Sim | Base de cálculo do COFINS |
| 43 | Valor do COFINS | N | 15 | 2 | 547 | 561 | — | — | Sim | Valor do COFINS |
| 44 | Número da adição | C | 3 | - | 562 | 564 | — | — | Sim | Número da adição à qual o item pertence |
| 45 | Sequencia do item da adição | C | 3 | - | 565 | 567 | — | — | Sim | DI: sequência da adição. DUIMP: sequência do item na NF (SWN) |
| 46 | Valor do desconto | N | 15 | 2 | 568 | 582 | — | — | Sim | Conforme layout NF-e (Tag DI/adição); enviar `0` se não houver |
| 47 | Valor do IOF | N | 15 | 2 | 583 | 597 | — | — | Sim | Conforme layout NF-e (Tag grupo II); enviar `0` se não houver |
| 48 | Despesas Aduaneiras | N | 15 | 2 | 598 | 612 | — | — | Sim | Valor das despesas aduaneiras por item |
| 49 | Alíquota específica do IPI | N | 15 | 4 | 613 | 627 | — | — | Condicional | Valor por unidade tributável; somente se IPI calculado por quantidade |
| 50 | Qtde total – IPI | N | 11 | 4 | 628 | 638 | — | — | Condicional | Qtd na unidade padrão de tributação IPI; somente se IPI calculado por quantidade |
| 51 | Qtde total – PIS | N | 11 | 4 | 639 | 649 | — | — | Condicional | Qtd na unidade padrão de tributação PIS; somente se PIS calculado por quantidade |
| 52 | Qtde total – COFINS | N | 11 | 4 | 650 | 660 | — | — | Condicional | Qtd na unidade padrão de tributação COFINS; somente se COFINS calculado por quantidade |
| 53 | Lote | C | 10 | 0 | 661 | 670 | — | — | Condicional | Número do lote; preencher quando item usa controle de lotes no SIGAEIC. Deixar em branco (espaços) no Modo A |
| 54 | Validade | D | 8 | 0 | 671 | 678 | — | — | Condicional | AAAAMMDD; validade do lote; **obrigatório e validado somente quando campo 53 (Lote) for preenchido**. Quando Lote em branco, deixar em espaços |
| 55 | Alíquota de ICMS do Item | N | 5 | 2 | 679 | 683 | — | — | Condicional | Inteiros=2, ponto, decimais=2; depende de `MV_EIC0010` |
| 56 | Alíquota de Majoração de COFINS | N | 6 | 2 | 684 | 689 | — | — | Sim | Inteiros=3, ponto, decimais=2; majoração de COFINS por item |
| 57 | Percentual Diferimento de ICMS | N | 8 | 4 | 690 | 697 | — | — | Sim | Inteiros=3, ponto, decimais=4; diferimento de ICMS por item |
| 58 | Código da LI | C | 10 | - | 698 | 707 | — | — | Sim | Número do registro da Licença de Importação (Siscomex) |
| 59 | Código da LI Substitutiva | C | 10 | - | 708 | 717 | — | — | Sim | Número da LI Substitutiva |

### 7.1 Validações Críticas — ITENS

- Campo 01 deve ser literal `2`.
- Campos 02 e 03 devem ser literais `01`.
- Campo 04 (Número da Nota): deve ser idêntico ao campo 04 do registro CAPA correspondente.
- Campo 06 (NCM): obrigatório; deve estar cadastrada no Easy. Preencher com **zero-pad à esquerda** (ex.: `0085044090`).
- Campo 07 (Código do Produto): obrigatório; deve existir no desembaraço referenciado.
- Campo 11 (Quantidade): obrigatório para NF primeira ou única.
- Campo 14 (Valor Mercadoria CIF+II): obrigatório.
- Campo 15: fixo `I`.
- Campo 18 (Valor FOB R$): obrigatório.
- Campo 24 (Nro Processo Easy): obrigatório.
- Campo 28 (Peso Líquido): obrigatório.
- Campo 29 (Item Pedido Compra): obrigatório.
- Campo 31 (Número do Pedido): obrigatório.
- Campo 32 (Nro PLI): obrigatório.
- Campo 33 (Série): deve coincidir com campo 25 da CAPA.
- Campos 46 e 47: enviar `0` quando não houver valor, não deixar em branco.
- Campo 53 (Lote): deixar em branco (espaços) quando não usar controle de lotes (Modo A).
- Campo 54 (Validade): obrigatório e validado **apenas quando campo 53 (Lote) for preenchido**; formato AAAAMMDD. Quando Lote em branco, deixar Validade em espaços.
- Campos N/G (05, 08, 09, 10): aceitos em branco (todo espaços) ou zeros quando não houver valor a informar.
- Total de posições deve ser exatamente **717**.

---

## 8. Regras de Relacionamento Entre Registros

- Um arquivo pode conter múltiplos pares de CAPA + ITENS.
- Para cada registro CAPA (tipo `1`), devem existir um ou mais registros ITENS (tipo `2`).
- O campo **Número da Nota** (pos. 6–14) é a chave de relacionamento CAPA ↔ ITENS.
- A **Série** (CAPA campo 25 = ITENS campo 33) deve ser idêntica em todos os registros da mesma NF.
- A **Quantidade de Itens** (CAPA campo 12) deve refletir o total de registros ITENS para aquela NF.

---

## 9. Tratamento de Lotes

Dois modos suportados:

**Modo A — Lote informado no desembaraço:**
- Informar o lote no desembaraço via "Outras ações".
- No TXT, enviar uma única linha de item (sem campo 53/54).
- O sistema quebra os lotes automaticamente no recebimento.

**Modo B — Lote informado no TXT:**
- Não informar lote no desembaraço.
- Enviar uma linha de item por lote no TXT.
- Os lotes são gerados no recebimento da NF, mas não no desembaraço.

---

## 10. Diferenças DI vs DUIMP

| Atributo | DI | DUIMP |
|---|---|---|
| **Tamanho CAPA** | **380 chars** (campos 1–45) | **399 chars** (campos 1–47) |
| **Tamanho ITENS** | **717 chars** (idêntico) | **717 chars** (idêntico) |
| Campo 45 ITENS (Seq. item adição) | Sequência da adição | Sequência do item na DUIMP para a NF (SWN) |
| Campo 46 CAPA (Número DUIMP) | **Omitido** (−15 chars) | Presente; usado como `W6_DI_NUM` |
| Campo 47 CAPA (Versão Registro) | **Omitido** (−4 chars) | Presente; assume na integração |
| CBS/IBS | Calculado via NCM cadastro | Calculado via atributos dos itens DUIMP |
| Classificação Tributária | Via Regime Tributação (`W3_CODREG`) | Via atributo `cClasstrib` dos itens DUIMP (1º código) |

> **Regra de tamanho CAPA:** O tamanho DI é derivado do DUIMP subtraindo os campos exclusivos DUIMP:
> `380 = 399 − 15 (campo 46) − 4 (campo 47)`
> Esses são os **únicos dois tamanhos permitidos** para o registro CAPA. Qualquer outro tamanho indica erro de geração.

---

## 11. Inconsistências e Alertas do Documento Original

| # | Local | Descrição |
|---|---|---|
| 1 | ITENS seq 11 | Tabela principal: posição 055–066 (12 chars). Seção de Comentários: posição 056–066 (11 chars). **Usar 055–066** (tabela principal é autoritativa). |
| 2 | ITENS seq 51/52 | Tabela principal: TAM=011. Seção de Comentários: TAM=016. Posições (639–649 e 650–660) confirmam 11 caracteres. **Usar TAM=011**. |
| 3 | CAPA seq 15 | Primeira tabela comparativa (Layout Padrão vs Dicionário) mostra Data de Entrada em 089–096 (layout) e 091–099 (dicionário). **Usar 089–096** (layout padrão). |
| 4 | Delimitador de registro | Documento original diz `CHR(13)` (CR apenas). **O validador exige CRLF (`\r\n`)**, que é o padrão Windows e é o que os despachantes devem gerar. |
| 5 | ITENS seq 06 (NCM) | Despachantes enviam NCM left-aligned com trailing spaces (ex.: `85044090  `). O spec exige **zero-pad à esquerda** (ex.: `0085044090`). Trailing spaces são inválidos. |
| 6 | ITENS seq 05, 08, 09, 10 (N/G) | Despachantes frequentemente enviam esses campos como **todo espaços** (em vez de zeros). O validador aceita essa prática para campos N/G inteiros. Campos N/G decimais devem ser zero-preenchidos. |
| 7 | CAPA seq 13 (Data de Referência) | Alguns despachantes enviam `MMYYYY` (ex.: `062025`). O formato correto é **DDMMAA**. Valor aceito: `000000` (vazio) ou data DDMMAA válida no calendário gregoriano. |

---

## 12. Resumo de Campos Obrigatórios

### CAPA (Tipo 1)
`Tipo(01)` · `Empresa(02)` · `Filial(03)` · `Nro Nota(04)` · `Nro Processo(11)` · `Qtd Itens(12)` · `Data Emissão(14)` · `Data Entrada(15)` · `Data Registro(17)` · `Espécie(20)` · `Série(25)` · `Vlr Total Mercadoria(38)` · `Vlr Total Nota(39)`

### ITENS (Tipo 2)
`Tipo(01)` · `Empresa(02)` · `Filial(03)` · `Nro Nota(04)` · `NCM(06)` · `Cód Produto(07)` · `Quantidade(11)*` · `Vlr Mercadoria CIF+II(14)` · `Vlr FOB R$(18)` · `Nro Processo Easy(24)` · `Peso Líquido(28)` · `Item Pedido Compra(29)` · `Nro Pedido(31)` · `Nro PLI(32)` · `Série(33)`

_(*) Obrigatório para NF tipo primeira (NFE) ou única (NFU)._
