# Checklist — NF de Entrada (Retorno Despachante SIGAEIC)

> Use este checklist para validar cada arquivo TXT antes de enviá-lo ao sistema Easy/SIGAEIC.

---

## A. Requisitos Gerais do Arquivo

- [ ] Arquivo em formato ASCII (texto plano)
- [ ] Extensão `.TXT`
- [ ] Sem separador de campos — campos contíguos e posicionais
- [ ] Cada registro delimitado por `CHR(13)+CHR(10)` (CRLF / `\r\n`)
- [ ] Registro CAPA (tipo `"1"`) com **380 posições** para processos **DI** (campos 1–45)
- [ ] Registro CAPA (tipo `"1"`) com **399 posições** para processos **DUIMP** (campos 1–47)
- [ ] Registro ITENS (tipo `"2"`) com exatamente **717 posições** (idêntico para DI e DUIMP)
- [ ] Para cada CAPA existe pelo menos um registro ITENS correspondente
- [ ] O campo Número da Nota (pos. 6–14) é idêntico entre CAPA e todos os seus ITENS
- [ ] A Série (CAPA campo 25 = ITENS campo 33) é idêntica em todos os registros da mesma NF
- [ ] A Quantidade de Itens (CAPA campo 12) reflete o número real de registros ITENS

---

## B. Regras de Formato por Tipo de Campo

- [ ] Campos numéricos: zero-pad à esquerda para inteiros e à direita para decimais
- [ ] Campos numéricos decimais: ponto `"."` como separador obrigatório na posição correta
- [ ] Campos caractere: pad com espaços `CHR(32)` à direita
- [ ] Campos de data com 8 posições: formato `AAAAMMDD` com zeros à esquerda
- [ ] Campos de data com 6 posições: formato `DDMMAA` com zeros à esquerda
- [ ] Datas com valores inválidos não enviadas (causam rejeição do registro)

---

## C. Parâmetros de Sistema Verificados

- [ ] `MV_EIC0010` configurado — define se alíquota ICMS vem da CAPA (campo 06) ou dos ITENS (campo 55)
- [ ] `MV_EIC0076` verificado — quando `.T.` (padrão), campos PO/HAWB/Invoice limitados a 15 chars; Grupo 148 ajustado ≤ 15
- [ ] CBS e IBS não incluídos no TXT (calculados automaticamente pelo sistema)
- [ ] Classificação Tributária (`WN_CSTCCT`) não incluída no TXT

---

## D. Registro Tipo "1" — CAPA DA NOTA FISCAL

### D.1 Campos Fixos / Literais
- [ ] **Seq 01** — Tipo (pos. 1): valor fixo `1`
- [ ] **Seq 02** — Código da Empresa (pos. 2–3): valor fixo `01`
- [ ] **Seq 03** — Código da Filial (pos. 4–5): valor fixo `01`
- [ ] **Seq 19** — Entrada/Saída (pos. 113): valor fixo `E`
- [ ] **Seq 23** — Flag Entrada (pos. 119): valor fixo `I`

### D.2 Campos Obrigatórios (gravados pelo sistema)
- [ ] **Seq 04** — Número da Nota (pos. 6–14, N, 9): preenchido, zero-padded
- [ ] **Seq 11** — Número do processo (pos. 56–72, A, 17): preenchido; identifica o desembaraço
- [ ] **Seq 14** — Data de Emissão (pos. 81–88, N, 8): formato AAAAMMDD, data válida
- [ ] **Seq 20** — Espécie (pos. 114–116, A, 3): um de `NFC`, `NFE`, `NFM`, `NFF`, `NFU`, `NFT`
- [ ] **Seq 25** — Série (pos. 130–132, A, 3): igual à série dos registros ITENS desta NF
- [ ] **Seq 38** — Valor Total da Mercadoria (pos. 247–261, N, 15, dec 2): preenchido
- [ ] **Seq 39** — Valor Total da Nota (pos. 262–276, N, 15, dec 2): preenchido
- [ ] **Seq 07** — CFOP (pos. 28–33, N, 6): cadastrado no Easy

### D.3 Campos Obrigatórios no Layout (não gravados pelo sistema)
- [ ] **Seq 12** — Quantidade de Itens (pos. 73–74, N, 2): entre 01 e 99
- [ ] **Seq 15** — Data de Entrada (pos. 89–96, N, 8): formato AAAAMMDD válido
- [ ] **Seq 17** — Data de Registro (pos. 103–110, N, 8): formato AAAAMMDD válido (vale DI e DUIMP)

### D.4 Fillers (espaços em branco)
- [ ] **Seq 05** — Filler (pos. 15–20, A, 6): espaços
- [ ] **Seq 16** — Filler (pos. 97–102, A, 6): espaços
- [ ] **Seq 18** — Filler (pos. 111–112, A, 2): espaços
- [ ] **Seq 22** — Filler (pos. 118, A, 1): espaço
- [ ] **Seq 41** — Filler (pos. 292–293, A, 2): espaços

### D.5 Campos Condicionais
- [ ] **Seq 06** — Aliq. ICMS (pos. 21–27, N, 7, dec 2): preenchido conforme `MV_EIC0010`
- [ ] **Seq 24** — Número da DI (pos. 120–129, A, 10): se preenchido, gravado no desembaraço
- [ ] **Seq 45** — Perc. Redução Base ICMS (pos. 375–380, N, 6, dec 2): quando houver redução
- [ ] **Seq 46** — Número da DUIMP (pos. 381–395, A, 15): **exclusivo DUIMP** — omitir em registros DI
- [ ] **Seq 47** — Versão do Registro (pos. 396–399, A, 4): **exclusivo DUIMP** — omitir em registros DI

> **Derivação DI:** `380 = 399 − 15 (campo 46) − 4 (campo 47)`. Esses são os **únicos dois tamanhos válidos** para CAPA.

### D.6 Campos Não Utilizados (presentes no layout, ignorados pelo sistema)
- [ ] **Seq 08** — CFP (pos. 34–38): preenchido com espaços
- [ ] **Seq 09** — CGC Emitente (pos. 39–52): pode ser enviado ou zerado
- [ ] **Seq 10** — Código IPI (pos. 53–55): pode ser enviado ou espaços
- [ ] **Seq 13** — Data de Referência (pos. 75–80): enviar `000000` quando não houver valor; qualquer outro valor deve ser data **DDMMAA válida** no calendário gregoriano
- [ ] **Seq 21** — Flag Cancelada (pos. 117): pode ser espaço
- [ ] **Seq 26** — Cód. Sit. Tributária (pos. 133–134): pode ser espaços
- [ ] **Seq 27** — Sit. Tributária E (pos. 135–139): pode ser espaços
- [ ] **Seq 28** — Sit. Tributária F (pos. 140–144): pode ser espaços
- [ ] **Seq 29** — UF do Emitente (pos. 145–146): pode ser espaços
- [ ] **Seq 30** — Via de Transporte (pos. 147): pode ser espaço
- [ ] **Seq 31** — Valor do Frete (pos. 148–162): pode ser zeros
- [ ] **Seq 32** — Valor do ICMS (pos. 163–177): pode ser zeros
- [ ] **Seq 33** — Valor da Base do ICMS (pos. 178–192): pode ser zeros
- [ ] **Seq 34** — Código do Importador (pos. 193–196): pode ser espaços
- [ ] **Seq 35** — Código do Transportador (pos. 197–216): pode ser espaços
- [ ] **Seq 36** — Valor do Seguro (pos. 217–231): pode ser zeros
- [ ] **Seq 37** — Valor do IPI (pos. 232–246): pode ser zeros
- [ ] **Seq 40** — Valor Base do IPI (pos. 277–291): pode ser zeros
- [ ] **Seq 42** — Código do Exportador (pos. 294–297): pode ser espaços
- [ ] **Seq 43** — Nome do Exportador (pos. 298–357): pode ser espaços
- [ ] **Seq 44** — Numero do PO (pos. 358–374): pode ser espaços

---

## E. Registro Tipo "2" — ITENS DA NOTA FISCAL

### E.1 Campos Fixos / Literais
- [ ] **Seq 01** — Tipo (pos. 1): valor fixo `2`
- [ ] **Seq 02** — Código da Empresa (pos. 2–3): valor fixo `01`
- [ ] **Seq 03** — Código da Filial (pos. 4–5): valor fixo `01`
- [ ] **Seq 15** — Flag de Entrada (pos. 100): valor fixo `I`

### E.2 Campos Obrigatórios (gravados pelo sistema)
- [ ] **Seq 04** — Número da Nota (pos. 6–14, N, 9): idêntico ao campo 04 do CAPA correspondente
- [ ] **Seq 06** — Classificação Fiscal / NCM (pos. 21–30, N, 10): cadastrada no Easy; preencher com **zero-pad à esquerda** (ex.: `0085044090`); trailing spaces são inválidos
- [ ] **Seq 07** — Código do Produto (pos. 31–50, A, 20): deve existir no desembaraço no Easy
- [ ] **Seq 11** — Quantidade (pos. 55–66, N, 12, dec 4): obrigatório para NF tipo NFE ou NFU
- [ ] **Seq 14** — Valor Mercadoria (CIF+II) (pos. 85–99, N, 15, dec 2): obrigatório
- [ ] **Seq 18** — Valor FOB R$ (pos. 262–276, N, 15, dec 2): obrigatório
- [ ] **Seq 24** — Nro Processo no Easy (pos. 342–358, A, 17): obrigatório
- [ ] **Seq 28** — Peso Líquido do item (pos. 392–402, N, 11, dec 4): obrigatório
- [ ] **Seq 29** — Item do Pedido de Compra (pos. 403–406, C, 4): obrigatório
- [ ] **Seq 31** — Numero do pedido (pos. 412–428, C, 17): obrigatório
- [ ] **Seq 32** — Nro do Pedido de Licenciamento / PLI (pos. 429–438, C, 10): obrigatório
- [ ] **Seq 33** — Série da Nota Fiscal (pos. 439–441, C, 3): igual à Série da CAPA (campo 25)

### E.3 Campos com Valor Mandatório mesmo que zero
- [ ] **Seq 46** — Valor do desconto (pos. 568–582, N, 15, dec 2): enviar `0` se não houver
- [ ] **Seq 47** — Valor do IOF (pos. 583–597, N, 15, dec 2): enviar `0` se não houver

### E.4 Campos Condicionais
- [ ] **Seq 12** — Unidade (pos. 67–69): enviada mas ignorada; sistema usa unidade do Easy
- [ ] **Seq 37** — Valor por quantidade do PIS (pos. 478–486): somente se PIS calculado por quantidade
- [ ] **Seq 41** — Valor por quantidade do COFINS (pos. 523–531): somente se COFINS calculado por quantidade
- [ ] **Seq 49** — Alíquota específica do IPI (pos. 613–627, N, 15, dec 4): somente se IPI calculado por quantidade
- [ ] **Seq 50** — Qtde total – IPI (pos. 628–638, N, 11, dec 4): somente se IPI calculado por quantidade
- [ ] **Seq 51** — Qtde total – PIS (pos. 639–649, N, 11, dec 4): somente se PIS calculado por quantidade
- [ ] **Seq 52** — Qtde total – COFINS (pos. 650–660, N, 11, dec 4): somente se COFINS calculado por quantidade
- [ ] **Seq 53** — Lote (pos. 661–670, C, 10): quando item usa controle de lotes no SIGAEIC
- [ ] **Seq 54** — Validade (pos. 671–678, D, 8): AAAAMMDD; **obrigatório somente quando campo 53 (Lote) for preenchido**; quando Lote em branco, deixar Validade em espaços
- [ ] **Seq 55** — Alíquota de ICMS do Item (pos. 679–683, N, 5, dec 2): conforme `MV_EIC0010`

### E.5 Campos Não Gravados pelo Sistema (presentes, mas descartados)
- [ ] **Seq 05** — Número do Lançamento (pos. 15–20): pode ser zeros (`000000`) ou **todo espaços**
- [ ] **Seq 08** — Código Trib. ICMS (pos. 51): pode ser zero (`0`) ou **espaço**
- [ ] **Seq 09** — Código Trib. IPI (pos. 52): pode ser zero (`0`) ou **espaço**
- [ ] **Seq 10** — Número do Item (pos. 53–54): pode ser zeros (`00`) ou **espaços**
- [ ] **Seq 16** — Quantidade do Recebimento (pos. 101–111): pode ser zeros (`000000.0000`)

### E.6 Campos Informativos (enviados e gravados, não obrigatórios)
- [ ] **Seq 13** — Vlr. IPI (pos. 70–84, N, 15, dec 2): valor do IPI do item
- [ ] **Seq 17** — Descrição do Produto (pos. 112–261, A, 150): descrição na NF
- [ ] **Seq 19** — Valor Frete R$ (pos. 277–291, N, 15, dec 2)
- [ ] **Seq 20** — Valor do Seguro R$ (pos. 292–306, N, 15, dec 2)
- [ ] **Seq 21** — Valor II R$ (pos. 307–321, N, 15, dec 2)
- [ ] **Seq 22** — Alíquota IPI (pos. 322–326, N, 5, dec 2)
- [ ] **Seq 23** — Valor Despesas (pos. 327–341, N, 15, dec 2)
- [ ] **Seq 25** — Numero da EX da NCM (pos. 359–361, A, 3)
- [ ] **Seq 26** — Numero da Invoice (pos. 362–376, A, 15): tamanho sujeito a `MV_EIC0076`
- [ ] **Seq 27** — Valor do ICMS a recolher (pos. 377–391, N, 15, dec 2)
- [ ] **Seq 30** — Alíquota de II (pos. 407–411, N, 5, dec 2)
- [ ] **Seq 34** — Base de ICMS por item (pos. 442–456, N, 15, dec 2)
- [ ] **Seq 35** — Valor FOB na moeda de Origem (pos. 457–471, N, 15, dec 7)
- [ ] **Seq 36** — Alíquota do PIS (pos. 472–477, N, 6, dec 2)
- [ ] **Seq 38** — Base de calculo do PIS (pos. 487–501, N, 15, dec 2)
- [ ] **Seq 39** — Valor do PIS (pos. 502–516, N, 15, dec 2)
- [ ] **Seq 40** — Alíquota do COFINS (pos. 517–522, N, 6, dec 2)
- [ ] **Seq 42** — Base de calculo do COFINS (pos. 532–546, N, 15, dec 2)
- [ ] **Seq 43** — Valor do COFINS (pos. 547–561, N, 15, dec 2)
- [ ] **Seq 44** — Número da adição (pos. 562–564, C, 3)
- [ ] **Seq 45** — Sequencia do item da adição (pos. 565–567, C, 3): DI=seq adição; DUIMP=seq item na SWN
- [ ] **Seq 48** — Despesas Aduaneiras (pos. 598–612, N, 15, dec 2)
- [ ] **Seq 56** — Alíquota de Majoração de COFINS (pos. 684–689, N, 6, dec 2)
- [ ] **Seq 57** — Percentual Diferimento de ICMS (pos. 690–697, N, 8, dec 4)
- [ ] **Seq 58** — Código da LI (pos. 698–707, C, 10): número do registro de LI (Siscomex)
- [ ] **Seq 59** — Código da LI Substitutiva (pos. 708–717, C, 10)

---

## F. Validações de Consistência entre Registros

- [ ] Cada NF possui exatamente um registro CAPA (tipo `1`)
- [ ] O número de registros ITENS bate com CAPA campo 12 (Qtd Itens)
- [ ] Série da CAPA (campo 25) = Série de todos os ITENS (campo 33) da mesma NF
- [ ] Número da Nota idêntico entre CAPA (campo 04) e todos os ITENS (campo 04)
- [ ] Para processos DI: campos 46 e 47 da CAPA são **omitidos**; tamanho CAPA = **380** (399 − 19 chars DUIMP-only)
- [ ] Para processos DUIMP: campos 44/45 dos ITENS preenchidos com sequência correta da DUIMP

---

## G. Validações de Lote (quando aplicável)

- [ ] Modo A (lote no desembaraço): uma linha de item por produto no TXT; campos 53/54 em branco
- [ ] Modo B (lote no TXT): uma linha de item por lote; campos 53 e 54 preenchidos
- [ ] Campo 54 (Validade) em AAAAMMDD quando campo 53 (Lote) for preenchido
- [ ] Não misturar Modo A e Modo B para o mesmo item

---

## H. Pontos de Atenção Finais

- [ ] CBS e IBS **não** foram incluídos no TXT (calculados automaticamente)
- [ ] Classificação Tributária (`WN_CSTCCT`) **não** foi incluída no TXT
- [ ] Para DUIMP com `cClasstrib` multivalorado: apenas o 1º código é considerado — verificado com o despachante
- [ ] Parâmetro `MV_EIC0076` alinhado entre o gerador do TXT (despachante) e o Easy
- [ ] Parâmetro `MV_EIC0010` verificado para determinar origem da alíquota ICMS (CAPA ou ITENS)
- [ ] Tamanho de registro conferido: **CAPA DI = 380**, **CAPA DUIMP = 399**, ITENS = 717 (excluindo CHR(13))
- [ ] Nenhum outro tamanho de CAPA é válido
