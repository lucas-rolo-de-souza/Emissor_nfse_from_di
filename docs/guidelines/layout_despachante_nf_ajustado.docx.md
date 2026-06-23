# [**Integração de dados da Nota Fiscal de Entrada**](https://tdn.totvs.com/pages/viewpage.action?pageId=394220238)

*   
*   
*   
* 

Tempo aproximado para leitura: **superior a 15 minutos**

**A integração no SIGAEIC deve estar no formato ASCII (texto). **

**I. Importação de Arquivos**

É efetuada através da rotina “**Integração**” na opção “**Miscelânea**” do menu principal, que permite a entrada de informações.

**II.1 Requisitos**

O arquivo deve ser obrigatoriamente no formato ASCII (texto), sem caracter separador de campo, e com cada registro delimitado pelo caracter correspondente à tecla **\<RETURN\>: CHR(13).**

**II.1.1 Arquivos de Entrada**

Sempre através de arquivos no formato ASCII (texto), com extensão “TXT”. As estruturas, com a descrição detalhada dos campos encontram-se no tópico II.2.

**II.1.2 Delimitação de Campos**

Os campos devem estar contíguos, ou seja, sem separador.

**II.1.3 Preenchimento dos campos**

Observar a Tabela de Legendas, constante do tópico II.2, e as regras de preenchimento descritas abaixo pois, o preenchimento incorreto dos campos provocará a rejeição do(s) registro(s).

**2\) Campos Numéricos**

Completá-los com zeros não significativos ou com espaços à esquerda para os inteiros e à direita para os decimais. É obrigatório informar o caracter “.” (ponto) como separador de casas decimais.  
Exemplos de entradas válidas para se gravar o campo Preço Unitário com 5.762,31 (9 inteiros e 5 decimais, com tamanho total de 15 posições). Observar que o “ponto” sempre ocupa a mesma posição dentro do campo.

|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  | 0 | 0 | 0 | 0 | 0 | 5 | 7 | 6 | 2 | . | 3 | 1 | 0 | 0 | 0 |
|  |  |  |  |  |  | 5 | 7 | 6 | 2 | . | 3 | 1 |  |  |  |
|  | 0 | 0 | 0 | 0 | 0 | 5 | 7 | 6 | 2 | . | 3 | 1 |  |  |  |
|  |  |  |  |  |  | 5 | 7 | 6 | 2 | . | 3 | 1 | 0 | 0 | 0 |

**3\) Campos de data**

\- completar com zeros significativos à esquerda (Ex.: 040396\)  
\- datas inválidas provocarão a rejeição do registro (Ex.: 311195\)

**4\) Campos no formato caracter**

. completar tamanho dos campos com espaços : chr(20) .

**Reforma Tributária \- Novos Tributos CBS e IBS**

O cálculo e gravação dos tributos CBS e IBS foram implementados no recebimento de importação, seguindo os critérios de geração dos tributos federais atuais. A solução contempla:

* Na geração do recebimento de importação para processos do tipo **DUIMP**, os valores de base de cálculo, alíquota e redução da alíquota são gravados nos campos da tabela Itens da NF de Importação (SWN), utilizando os dados da informados nos **Itens da DUIMP**.

* Para processos do tipo **DI**, os valores de base de cálculo, alíquota e redução da alíquota são gravados nos campos da tabela Itens da NF de Importação (SWN), utilizando os dados do **Cadastro da NCM **vinculados ao item do processo.

Para a composição da **base de cálculo do CBS e do IBS**, o sistema considera: Valor Aduaneiro (FOB \+ frete \+ seguro \+ acréscimos e despesas base de imposto \- deduções) \+ despesas base de ICMS (taxa SISCOMEX, AFRMM, antidumping e outros) \+ II \+ PIS \+ COFINS, excluindo IPI e ICMS.

# **IMPORTANTE \- Reforma Tributária**

Os novos campos dos tributos CBS e IBS e o campo da Classificação Tributária, não serão incluídos no Layout de integração do TXT. Para que o cálculo seja efetuado, devem ser seguidas as regras mencionadas acima.

**Preenchimento Automático do Campo Classificação Tributária (WN\_CSTCCT):**

**Processos do tipo DUIMP**: O campo Classificação Tributária é preenchido automaticamente com o valor do atributo gravado nos itens Duimp. Caso não exista, o campo permanece vazio. O atributo cClasstrib é um campo multivalorado para a DUIMP, porém para a Nota Fiscal é uma informação única por item. Avalie a necessidade de multiplas seleções pois apenas o primeiro código será considerado na geração do recebimento de importação.

**Processos do tipo DI**: O sistema verifica o vínculo do item no Purchase Order com o Regime de Tributação DUIMP (campo W3\_CODREG) e recupera o código cClasstrib do cadastro.

**Observação**

Foi criado o parâmetro **MV\_EIC0076**, onde poderá ser definido a quantidade de caracteres para Número P.O., HAWB e Invoice na integração com o despachante:

* Quando estiver ativado (.T. \- padrão) será enviado/recebido conforme o layout padrão.

Neste caso, será necessário verificar a configuração do Grupo de Campos '148', alterando o tamanho para menor ou igual a 15 caracteres ( tamanho padrão do leiaute da integração com despachante).

Ao informar os campos Número P.O., HAWB ou Invoice em seus processos, será apresentado uma mensagem informativa quando ultrapassar 15 caracteres, conforme:

* Quando estiver desativado (.F.) será enviado/recebido conforme grupo de campos (148 \- Imp.Purchase/Hawb/Invoice/Prof).

Neste caso, será necessário procurar seu despachante para que seja efetuado os ajustes necessários no sistema que receberá/enviará as informações do processo.

As informações após os campos Número P.O., HAWB ou Invoice, serão deslocados conforme o tamanho desses campos definido no dicionário de dados, por exemplo:

Configuração dos campos Número P.O., HAWB ou Invoice para 20 caracteres.

**“1” – CAPA DA NOTA FISCAL DE ENTRADA**

| Seq | Descrição do Campo | Tipo | Tam. | Dec | Posição \- Leiaute Padrão | Tam. | Dec | Posição \- Dicionário de dados |
| ----- | :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 01 | Tipo | A | 001 | \- | 001 \- 001 | 001 | \- | 001 \- 001 |
| 02 | Código da Empresa | N | 002 | \- | 002 \- 003 | 002 | \- | 002 \- 003 |
| 03 | Código da Filial | N | 002 | \- | 004 \- 005 | 002 | \- | 004 \- 005 |
| 04 | Número da Nota | N | 009 | \- | 006 – 014 | 009 | \- | 006 – 014 |
| 05 | Filler | A | 006 | \- | 015 – 020 | 006 | \- | 015 – 020 |
| 06 | Aliq. ICMS | N | 007 | 2 | 021 – 027 | 007 | 2 | 021 – 027 |
| 07 | CFOP | N | 006 | \- | 028 – 033 | 006 | \- | 028 – 033 |
| 08 | CFP | A | 005 | \- | 034 – 038 | 005 | \- | 034 – 038 |
| 09 | CGC \- Emitente | N | 014 | \- | 039 – 052 | 014 | \- | 039 – 052 |
| 10 | Código do IPI | A | 003 | \- | 053 – 055 | 003 | \- | 053 – 055 |
| 11 | Número do processo | A | 017 | \- | 056 – 072 | 020 | \- | 056 – 075 |
| 12 | Quantidade de Itens | N | 002 | \- | 073 – 074 | 002 | \- | 076 – 077 |
| 13 | Data de Referência | N | 006 | \- | 075 – 080 | 006 | \- | 078 – 083 |
| 14 | Data de Emissão | N | 008 | \- | 081 – 088 | 008 | \- | 084 – 091 |
| 15 | Data de Entrada | N | 008 | \- | 089 – 096 | 008 | \- | 091 – 099 |

**II.2. Nota Fiscal.**

**      2.1 Inclusão:**

          Para a integração de Notas Fiscais não é necessário ter dois arquivos (Capa \- Detalhe), basta ter um só arquivo TXT contendo os dois tipos com “identificadores” indicando se a informação é de capa ou de detalhe, na coluna “OBS”, é onde se encontra o “identificador”, usa-se “1”, quando a informação for de Capa e “2.”, quando a informação for de detalhe.  
Será incluso uma nova nota fiscal para o processo selecionado pelo usuário.

**II.3 Estruturas dos Arquivos da Integração**

| *LEGENDA* |  |
| ----- | :---- |
| **TAM** | Tamanho do campo. No caso de campos numéricos com decimais, indica a quantidade de inteiros, mais a de decimais e uma posição para o caracter ponto (“.”), que é o separador de decimais. Exemplo: se **TAM \= 15 e DEC \= 2 **então** N**º de inteiros \= 12\. |
| **\*** | Indica tamanho máximo |
| **DEC** | Número de decimais (já computadas no tamanho) |
| **TIPO** | Formato do campo |
| **C** | Caractere ou alfanumérico |
| **N** | Numérico                      |
| **D** | Data no formato AAAAMMDD |
| **M** | Memo (texto com até 64K) |
| **L ** | Lógico (T \- true, F \- false) |
| **REQ** | \= \# \-\> preenchimento requerido, ou seja, obrigatório \= X \-\> o campo deve ser informado apenas na inclusão ou caso deseje alterar \= $ \-\> preenchimento requerido, ou seja, obrigatório e não pode ser repetido |
| **CAD** | \=X \-\> deve estar previamente cadastrado no sistema |
| **POS** | Número da coluna, posição relativa do campo no registro |

**II.4 NOTA FISCAL DE ENTRADA (dados de retorno do despachante)**

**                  1) “1” – CAPA DA NOTA FISCAL DE ENTRADA**

| Seq | Descrição do Campo | Tipo | Tam. | Dec | Posição | Obs. |
| ----- | :---- | ----- | ----- | ----- | ----- | ----- |
| 01 | Tipo | A | 001 | \- | 001 \- 001 | "1" / Capa |
| 02 | Código da Empresa | N | 002 | \- | 002 \- 003 | Fixo "01" |
| 03 | Código da Filial | N | 002 | \- | 004 \- 005 | Fixo "01" |
| 04 | Número da Nota | N | 009 | \- | 006 – 014 |  |
| 05 | Filler | A | 006 | \- | 015 – 020 |  |
| 06 | Aliq. ICMS | N | 007 | 2 | 021 – 027 | Nota 7 |
| 07 | CFOP | N | 006 | \- | 028 – 033 | Nota 8 |
| 08 | CFP | A | 005 | \- | 034 – 038 | Nota 2 |
| 09 | CGC \- Emitente | N | 014 | \- | 039 – 052 |  |
| 10 | Código do IPI | A | 003 | \- | 053 – 055 | Nota 2 |
| 11 | Número do processo | A | 017 | \- | 056 – 072 |  |
| 12 | Quantidade de Itens | N | 002 | \- | 073 – 074 |  |
| 13 | Data de Referência | N | 006 | \- | 075 – 080 | Nota 3 |
| 14 | Data de Emissão | N | 008 | \- | 081 – 088 | Nota 5 |
| 15 | Data de Entrada | N | 008 | \- | 089 – 096 | Nota 5 |
| 16 | Filler | A | 006 | \- | 097 – 102 |  |
| 17 | Data de Registro | N | 008 | \- | 103 – 110 |  |
| 18 | Filler | A | 002 | \- | 111 – 112 |  |
| 19 | Entrada / Saída | A | 001 | \- | 113 – 113 | Fixo "E" |
| 20 | Espécie | A | 003 | \- | 114 – 116 |  |
| 21 | Flag Cancelada | A | 001 | \- | 117 – 117 | Nota 2 |
| 22 | Filler | A | 001 | \- | 118 – 118 |  |
| 23 | Flag Entrada | A | 001 | \- | 119 – 119 | Fixo "I" |
| 24 | Número da DI | A | 010 | \- | 120 – 129 |  |
| 25 | Série | A | 003 | \- | 130 – 132 |  |
| 26 | Código de Sit. Tributária | A | 002 | \- | 133 – 134 |  |
| 27 | Situação Tributária \- E | A | 005 | \- | 135 – 139 | Nota 2 |
| 28 | Situação Tributária \- F | A | 005 | \- | 140 – 144 | Nota 2 |
| 29 | UF do Emitente | A | 002 | \- | 145 – 146 |  |
| 30 | Via de Transporte | A | 001 | \- | 147 – 147 | Nota 4 |
| 31 | Valor do Frete | N | 015 | 02 | 148 – 162 | Nota 7 |
| 32 | Valor do ICMS | N | 015 | 02 | 163 – 177 | Nota 7 |
| 33 | Valor da Base do ICMS | N | 015 | 02 | 178 – 192 | Nota 7 |
| 34 | Código do Importador | A | 004 | \- | 193 – 196 |  |
| 35 | Código do Transportador | A | 020 | \- | 197 – 216 |  |
| 36 | Valor do Seguro | N | 015 | 02 | 217 – 231 | Nota 7 |
| 37 | Valor do IPI | N | 015 | 02 | 232 – 246 | Nota 7 |
| 38 | Valor Total da Mercadoria | N | 015 | 02 | 247 – 261 | Nota 7 |
| 39 | Valor Total da Nota | N | 015 | 02 | 262 – 276 | Nota 7 |
| 40 | Valor Base do IPI | N | 015 | 02 | 277 – 291 | Nota 7 |
| 41 | Filler | A | 002 | \- | 292 – 293 |  |
| 42 | Código do Exportador | A | 004 | \- | 294 – 297 |  |
| 43 | Nome do Exportador | A | 060 | \- | 298 – 357 |  |
| 44 | Numero do PO | A | 017 | \- | 358 – 374 |  |
| 45 | Perc. Redução de Base de ICMS | N | 006 | 02 | 375 – 380 | Nota 7 |
| 46 | Número da DUIMP | A | 015 | \- | 381 – 395 |  |
| 47 | Versão do Registro | A | 004 | \- | 396 – 399 |  |

**Comentários :**

** **

| 01 | Tipo | A | 001 | \- | 001 – 001 | "1" / Capa  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Fixo 1

| 02 | Código da Empresa | N | 002 | \- | 002 \- 003 | Fixo "01" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Fixo 01

| 03 | Código da Filial | N | 002 | \- | 004 \- 005 | Fixo "01" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Fixo 01

| 04 | Número da Nota | N | 009 | \- | 006 – 014 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número da nota fiscal – campo obrigatório

| 05 | Filler | A | 006 | \- | 015 – 020 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Espaço em branco

| 06 | Aliq. ICMS | N | 007 | 2 | 021 – 027 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Aliquota de ICMS \- Para que o sistema grave a alíquota enviada no arquivo TXT de integração com o despachante, configure o parâmetro **MV\_EIC0010**, determinando se a alíquota do ICMS será a informada na capa ou nos itens da nota fiscal.

| 07 | CFOP | N | 006 | \- | 028 – 033 | Nota 8 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Classificação fiscal de operação : código deve estar cadastrado no Easy

| 08 | CFP | A | 005 | \- | 034 – 038 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Classificação fiscal de operação : campo não utilizado

| 09 | CGC \- Emitente | N | 014 | \- | 039 – 052 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

CNPJ do emitente : campo não utilizado pelo sistema

| 10 | Código do IPI | A | 003 | \- | 053 – 055 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Campo não utilizado pelo sistema

| 11 | Numero do processo | A | 017 | \- | 056 – 072 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Numero do processo de embarque/desembaraço – Obrigatório.

| 12 | Quantidade de Itens | N | 002 | \- | 073 – 074 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Quantidade de itens na nota fiscal , até 99 itens . O sistema não grava esta informação mas é obrigatória

| 13 | Data de Referência | N | 006 | \- | 075 – 080 | Nota 3 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada pelo Easy

| 14 | Data de Emissão | N | 008 | \- | 081 – 088 | Nota 5 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Data de emissão da nota fiscal – obrigatória em AAAAMMDD

| 15 | Data de Entrada | N | 008 | \- | 089 – 096 | Nota 5 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Data de entrega da mercadoria – obrigatória em AAAAMMDD – não utilizada pelo sistema

| 16 | Filler | A | 006 | \- | 097 – 102 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Espaço em branco

| 17 | Data de Registro | N | 008 | \- | 103 – 110 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Data de registro  – obrigatória em AAAAMMDD – não utilizada pelo sistema.

Esta data atende tanto a data de registro da DI como da DUIMP.

| 18 | Filler | A | 002 | \- | 111 – 112 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Espaço em branco

| 19 | Entrada / Saída | A | 001 | \- | 113 – 113 | Fixo "E" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Nota de entrada ou saída – não utilizada pelo sistema

| 20 | Espécie | A | 003 | \- | 114 – 116 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Obrigatória : NFC,NFE, NFM, NFF, NFU ou NFT ( complementar, entrada/ primeira, mãe, filha, única e nota de transferência)

| 21 | Flag Cancelada | A | 001 | \- | 117 – 117 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Sinalizador de nota cancelada  : Não utilizado pelo sistema : não há tratamento de notas canceladas no Easy.

| 22 | Filler | A | 001 | \- | 118 – 118 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Espaço em branco

| 23 | Flag Entrada | A | 001 | \- | 119 – 119 | Fixo "I" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada.

| 24 | Número da DI | A | 010 | \- | 120 – 129 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Se não vier vazia no arquivo será gravada no  desembaraço

| 25 | Série | A | 003 | \- | 130 – 132 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Série da nota fiscal – deve ter o mesmo conteúdo da série descrita em itens da nota

| 26 | Código de Sit. Tributária | A | 002 | \- | 133 – 134 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 27 | Situação Tributária \- E | A | 005 | \- | 135 – 139 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 28 | Situação Tributária \- F | A | 005 | \- | 140 – 144 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 29 | UF do Emitente | A | 002 | \- | 145 – 146 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 30 | Via de Transporte | A | 001 | \- | 147 – 147 | Nota 4 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 31 | Valor do Frete | N | 015 | 02 | 148 – 162 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 32 | Valor do ICMS | N | 015 | 02 | 163 – 177 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total do ICMS : não gravado pelo sistema

| 33 | Valor da Base do ICMS | N | 015 | 02 | 178 – 192 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total  da base do  ICMS : não gravado pelo sistema

| 34 | Código do Importador | A | 004 | \- | 193 – 196 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 35 | Código do Transportador | A | 020 | \- | 197 – 216 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 36 | Valor do Seguro | N | 015 | 02 | 217 – 231 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 37 | Valor do IPI | N | 015 | 02 | 232 – 246 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total do IPI : não gravado pelo sistema

| 38 | Valor Total da Mercadoria | N | 015 | 02 | 247 – 261 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total da mercadoria – obrigatório

| 39 | Valor Total da Nota | N | 015 | 02 | 262 – 276 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total da nota  – obrigatório

| 40 | Valor Base do IPI | N | 015 | 02 | 277 – 291 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total  da base do  IPI : não gravado pelo sistema

| 41 | Filler | A | 002 | \- | 292 – 293 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Espaço em branco

| 42 | Código do Exportador | A | 004 | \- | 294 – 297 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 43 | Nome do Exportador | A | 060 | \- | 298 – 357 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não utilizada para o sistema

| 44 | Numero do PO | A | 017 | \- | 358 – 374 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

** **Informação não utilizada para o sistema

** **

| 45 | Perc. Redução de Base de ICMS | N | 006 | 02 | 375 – 380 | NOTA 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

** **Percentual de redução de base de ICMS quando houver

| 46 | Número da DUIMP | A | 015 | \- | 381 – 395 |  |
| :---: | :---- | :---: | :---: | :---: | :---- | :---- |

Campo referente ao número da DUIMP, não obrigatório. Se for informado, será utilizado como o número do registro do processo de importação (W6\_DI\_NUM).

| 47 | Versão do Registro | A | 004 | \- | 396 – 399 |  |
| :---: | :---- | :---: | :---: | :---: | :---- | :---- |

Campo referente a versão do registro da DUIMP, não obrigatório. Se for informado, será assumido na integração, caso contrário manterá o processamento atual da geração automática.

**2\) “2” – ITENS DA NOTA FISCAL DE ENTRADA**

| Seq | Descrição do Campo | Tipo | Tam. | Dec | Posição | Obs. |
| ----- | :---- | ----- | ----- | ----- | ----- | ----- |
| 01 | Tipo | A | 001 | \- | 001 – 001 | "2" / Itens |
| 02 | Código da Empresa | N | 002 | \- | 002 – 003 | Fixo "01" |
| 03 | Código da Filial | N | 002 | \- | 004 – 005 | Fixo "01" |
| 04 | Número da Nota | N | 009 | \- | 006 – 014 |  |
| 05 | Número do Lançamento | N | 006 | \- | 015 – 020 |  |
| 06 | Classificação Fiscal | N | 010 | \- | 021 – 030 |  |
| 07 | Código do Produto | A | 020 | \- | 031 – 050 |  |
| 08 | Código \- Trib. \- ICMS | N | 001 | \- | 051 – 051 | Nota 2 |
| 09 | Código \- Trib. \- IPI | N | 001 | \- | 052 – 052 | Nota 2 |
| 10 | Número do Item | N | 002 | \- | 053 – 054 |  |
| 11 | Quantidade | N | **012** | 04 | 055 – 066 | Nota 7 |
| 12 | Unidade | A | 003 | \- | 067 – 069 |  |
| 13 | Vlr. – IPI | N | 015 | 02 | 070 – 084 | Nota 7 |
| 14 | Valor Mercadoria (CIF+II) | N | 015 | 02 | 085 – 099 | Nota 7 |
| 15 | Flag de Entrada | A | 001 | \- | 100 – 100 | Fixo "I" |
| 16 | Quantidade do Recebimento | N | 011 | 04 | 101 – 111 | Nota 2 |
| 17 | Descrição do Produto | A | 150 | \- | 112 – 261 |  |
| 18 | Valor Fob R$ | N | 015 | 02 | 262 – 276 | Nota 7 |
| 19 | Valor Frete R$ | N | 015 | 02 | 277 – 291 | Nota 7 |
| 20 | Valor do Seguro R$ | N | 015 | 02 | 292 – 306 | Nota 7 |
| 21 | Valor II R$ | N | 015 | 02 | 307 – 321 | Nota 7 |
| 22 | Alíquota IPI | N | 005 | 02 | 322 – 326 | Nota 7 |
| 23 | Valor Despesas | N | 015 | 02 | 327 – 341 | Nota 7 |
| 24 | Nro Processo no Easy | A | 017 | \- | 342 – 358 |  |
| 25 | Numero da EX da NCM | A | 003 | \- | 359 – 361 |  |
| 26 | Numero da Invoice | A | 015 | \- | 362 – 376 |  |
| 27 | Valor do ICMS a recolher | N | 015 | 02 | 377 – 391 | Nota 7 |
| 28 | Peso Liquido do item | N | 011 | 04 | 392 – 402 | Nota 7 |
| 29 | Item do Pedido de Compra | C | 004 | \- | 403 – 406 | Nota 6 |
| 30 | Alíquota de II | N | 005 | 2 | 407 – 411 | Nota 7 |
| 31 | Numero do pedido | C | 017 | \- | 412 – 428 |  |
| 32 | Nro do Pedido de Licenciamento | C | 010 | \- | 429 – 438 |  |
| 33 | Série da Nota Fiscal | C | 003 | \- | 439 – 441 |  |
| 34 | Base de ICMS ( por item) | N | 015 | 02 | 442 – 456 | Nota  7 |
| 35 | Valor FOB na moeda de Origem | N | 015 | 07 | 457 – 471 | Nota 7 |
| 36 | Alíquota do PIS | N | 006 | 02 | 472 – 477 | Nota 7 |
| 37 | Valor por quantidade do PIS | N | 009 | 02 | 478 – 486 |  |
| 38 | Base de calculo do PIS | N | 015 | 02 | 487 – 501 | Nota 7 |
| 39 | Valor do PIS | N | 015 | 02 | 502 – 516 | Nota 7 |
| 40 | Alíquota do COFINS | N | 006 | 02 | 517 – 522 | Nota 7 |
| 41 | Valor por quantidade do COFINS | N | 009 | 02 | 523 – 531 | Nota 7 |
| 42 | Base de calculo do COFINS | N | 015 | 02 | 532 – 546 | Nota 7 |
| 43 | Valor do COFINS | N | 015 | 02 | 547 – 561 | Nota 7 |
| 44 | Número da adição | C | 003 | \- | 562 – 564 |  |
| 45 | Sequencia do item da adição | C | 003 | \- | 565 – 567 |  |
| 46 | Valor do desconto | N | 015 | 02 | 568 – 582 | Nota 7 |
| 47 | Valor do IOF | N | 015 | 02 | 583 – 597 | Nota 7 |
| 48 | Despesas Aduaneiras | N | 015 | 02 | 598 – 612 | Nota 7 |
| 49 | Alíquota específica do IPI | N | 015 | 04 | 613 – 627 | Nota 7 |
| 50 | Qtde total \- IPI | N | 011 | 04 | 628 – 638 | Nota 7 |
| 51 | Qtde total \- PIS | N | 011 | 04 | 639 – 649 | Nota 7 |
| 52 | Qtde total \- COFINS | N | 011 | 04 | 650 – 660 | Nota 7 |
| 53 | Lote | C | 010 | 00 | 661 – 670 |  |
| 54 | Validade | D | 008 | 00 | 671 \- 678 |  |
| 55 | Alíquota de ICMS do Item | N | 005 | 02 | 679 – 683 | Nota 7 |
| 56 | Alíquota de Majoração de COFINS | N | 006 | 02 | 684 – 689 |  |
| 57 | Percentual Diferimento de ICMS | N | 008 | 04 | 690 – 697 |  |
| 58 | Código da LI | C | 010 | \- | 698 – 707  |  |
| 59 | Código da LI Substitutiva | C | 010 | \- | 708 – 717 |  |

**Comentários:**

| 01 | Tipo | A | 001 | \- | 001 – 001 | "2" / Itens |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Fixo 2

| 02 | Código da Empresa | N | 002 | \- | 002 – 003 | Fixo "01" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Fixo 01

| 03 | Código da Filial | N | 002 | \- | 004 – 005 | Fixo "01" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Fixo 01

| 04 | Número da Nota | N | 006 | \- | 006 – 014 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número da nota fiscal – obrigatório

| 05 | Número do Lançamento | N | 006 | \- | 015 – 020 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 06 | Classificação Fiscal | N | 010 | \- | 021 – 030 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

NCM – deve estar cadastrada no Easy

| 07 | Código do Produto | A | 020 | \- | 031 – 050 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Código do produto – deve fazer parte do desembaraço no Easy

| 08 | Código \- Trib. \- ICMS | N | 001 | \- | 051 – 051 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 09 | Código \- Trib. \- IPI | N | 001 | \- | 052 – 052 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 10 | Número do Item | N | 002 | \- | 053 – 054 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 11 | Quantidade | N | 012 | 04 | 056 – 066 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Quantidade do item na nota , se primeira ou única deve ser obrigatório

| 12 | Unidade | A | 003 | \- | 067 – 069 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Unidade utilizada na nota será a cadastrada no Easy, a unidade enviada não é utilizada

| 13 | Vlr. \- IPI | N | 015 | 02 | 070 – 084 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do IPI

| 14 | Valor Mercadoria (CIF+II) | N | 015 | 02 | 085 – 099 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor total da mercadoria (CIF \+ II) – obrigatório

| 15 | Flag de Entrada | A | 001 | \- | 100 – 100 | Fixo "I" |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 16 | Quantidade do Recebimento | N | 011 | 04 | 101 – 111 | Nota 2 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Informação não gravada pelo sistema

| 17 | Descrição do Produto | A | 150 | \- | 112 – 261 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Descrição do produto na nota fiscal

| 18 | Valor Fob R$ | N | 015 | 02 | 262 – 276 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor fob da mercadoria – obrigatório

| 19 | Valor Frete R$ | N | 015 | 02 | 277 – 291 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do frete da mercadoria

| 20 | Valor do Seguro R$ | N | 015 | 02 | 292 – 306 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do seguro da mercadoria

| 21 | Valor II R$ | N | 015 | 02 | 307 – 321 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do imposto de importação

| 22 | Alíquota IPI | N | 005 | 02 | 322 – 326 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Alíquota de IPI

| 23 | Valor Despesas | N | 015 | 02 | 327 – 341 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor das outras despesas

| 24 | Nro Processo no Easy | A | 017 | \- | 342 – 358 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número do processo no Easy – obrigatório

| 25 | Numero da EX da NCM | A | 003 | \- | 359 – 361 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número da exceção de NCM

| 26 | Numero da Invoice | A | 015 | \- | 362 – 376 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número da invoice

| 27 | Valor do ICMS a recolher | N | 015 | 02 | 377 – 391 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do ICMS a recolher

| 28 | Peso Liquido do item | N | 011 | 04 | 392 – 402 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Peso líquido do item – obrigatório

| 29 | Item do Pedido de Compra | C | 004 | \- | 403 – 406 | Nota 6 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Item no pedido do Easy – obrigatório

| 30 | Alíquota de II | N | 005 | 2 | 407 – 411 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Alíquota de II

| 31 | Numero do pedido | C | 017 | \- | 412 – 428 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número do pedido do Easy – obrigatório

| 32 | Nro do Pedido de Licenciamento | C | 010 | \- | 429 – 438 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número da PLI do Easy – obrigatório

| 33 | Série da Nota Fiscal | C | 003 | \- | 439 – 441 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Série igual a da linha de capa da nota

| 34 | Base de ICMS ( por item) | N | 015 | 02 | 442 – 456 | Nota  7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Base  de icms por item

| 35 | Valor FOB na moeda de Origem | N | 015 | 07 | 457 – 471 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do Fob unitário na moeda de origem

| 36 | Alíquota do PIS | N | 006 | 02 | 472 – 477 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Alíquota do PIS

| 37 | Valor por quantidade do PIS | N | 009 | 02 | 478 – 486 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor por quantidade do PIS ( quando utilizado cálculo de PIS por quantidade)

| 38 | Base de calculo do PIS | N | 015 | 02 | 487 – 501 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Base de cálculo do PIS

| 39 | Valor do PIS | N | 015 | 02 | 502 – 516 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do PIS

| 40 | Alíquota do COFINS | N | 006 | 02 | 517 – 522 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Alíquota do COFINS 

| 41 | Valor por quantidade do COFINS | N | 009 | 02 | 523 – 531 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor por quantidade do COFINS (quando utilizado cálculo do COFINS por quantidade)

| 42 | Base de calculo do COFINS | N | 015 | 02 | 532 – 546 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Base de cálculo do COFINS

| 43 | Valor do COFINS | N | 015 | 02 | 547 – 561 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor do COFINS

   

| 44 | Número da adição | C | 003 | \- | 562 – 564 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Número da adição que o item pertence.

| 45 | Sequencia do item da adição | C | 003 | \- | 565 – 567 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Sequência do item dentro da adição.

Para processos do tipo DUIMP esta informação será a sequência do item para a DUIMP na nota fiscal (SWN) e para processos do tipo DI continua sendo a sequência da adição.

| 46 | Valor do desconto | N | 015 | 02 | 568 – 582 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Conforme lay-ou da NF-e disponibilizado pela receita, na Tag da Declaração de Importação, há um campo referente ao valor do desconto do item da DI – adição. Se tiver esta informação, enviar, senão, enviar zero.

| 47 | Valor do IOF | N | 015 | 02 | 583 – 597 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Conforme lay-ou da NF-e disponibilizado pela receita, na Tag de grupo do Imposto de Importação, há um campo referente ao valor do IOF. Se tiver esta informação, enviar, senão, enviar zero.

| 48 | Despesas Aduaneiras | N | 015 | 02 | 598 – 612 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Valor das despesas aduaneiras para o item.

| 49 | Alíquota específica do IPI | N | 015 | 04 | 613 – 627 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Alíquota específica do IPI – valor por unidade tributável – somente deve ser enviado se o IPI foi calculado por unidade.

| 50 | Qtde total \- IPI | N | 011 | 04 | 628 – 638 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Quantidade total na unidade padrão para tributação – IPI \- somente deve ser enviado se o IPI foi calculado por unidade.

| 51 | Qtde total \- PIS | N | 016 | 04 | 639 – 649 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Quantidade total na unidade padrão para tributação  – PIS \-  somente deve ser enviado se o PIS foi calculado por unidade.

| 52 | Qtde total \- COFINS | N | 016 | 04 | 650 – 660 | Nota 7 |
| :---: | :---- | :---: | :---: | :---: | :---: | :---: |

Quantidade total na unidade padrão para tributação \- COFINS –  somente deve ser enviado se o COFINS foi calculado por unidade.

| 53 | Lote | C | 010 | 00 | 661 – 670 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Lote do item \-  enviado quando item esta inserido em um lote no controle de lotes do SIGAEIC.

Quando existe mais de um lote para um único item o sistema pode trabalhar de duas maneiras diferentes:

   a) Informar o lote no desembaraço através do botão Outras ações e no arquivo de integração do despachante deve ser retornado uma única linha do item, assim como está o item no desembaraço. (neste caso não precisa informar o lote em si, pois o sistema irá quebrar os lotes no recebimento de nota automaticamente no momento da integração).

  b) Não informar o lote no desembaraço, então o lote deve ser informado no arquivo txt, onde haverá uma linha de registro para o item no desembaraço e uma linha do item para cada lote no arquivo txt, desta forma serão gerados os lotes no recebimento da nota mas não serão gerados os lotes no desembaraço.

| 54 | Validade | C | 008 | 00 | 671 – 678 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Validade do Lote \- obrigatória em AAAAMMDD \-  enviado quando item esta inserido em um lote no controle de lotes do SIGAEIC para informar a validade do lote. 

| 55 | Aliq ICMS \- ICMS | N | 005 | 02 | 679 – 683 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Alíquota de ICMS informada por item da Nota Fiscal \- Para que o sistema grave a alíquota enviada no arquivo TXT de integração com o despachante, configure o parâmetro **MV\_EIC0010**, determinando se a alíquota do ICMS será a informada na capa ou nos itens da nota fiscal.

| 56 | Alíquota de Majoração de COFINS | N | 006 | 02 | 684 – 689 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Alíquota de Majoração de COFINS por item da Nota Fiscal.

| 57 | Percentual Diferimento de ICMS | N | 008 | 04 | 690 – 697 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Percentual de Diferimento de ICMS por item da Nota Fiscal.

| 58 | Código da LI | N | 010 | \- | 698 – 707 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Número do registro da Licença de Importação, fornecido pelo Siscomex.

| 59 | Código da LI Substitutiva | C | 010 | \- | 708 – 717 |  |
| :---: | :---- | :---: | :---: | :---: | :---: | :---- |

Número do registro da LI Substitutiva.  

Para uma Declaração de Importação (DI), o despachante pode omitir os campos específicos da DUIMP, resultando no tamanho total do arquivo TXT DI alterado para "o tamanho alvo do TXT DUIMP subtraidos da soma dos campos específicos do modelo DUIMP".
