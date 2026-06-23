 1      File Comparison Report
    2
    3     This report highlights the differences between the two compared files:

    4     1. File 1 (Original):  ARQUIVO_LMAO_OK4_CRLF.txt
    5     2. File 2 (Audited):  AUDITADO_V1_ARQUIVO_LMAO_OK4_CRLF.txt
          ──────
    9     ## 📊 Summary of Differences
   10
   11      Metric                │ File 1 ( ARQUIVO_LMA… │ File 2 ( AUDITADO… │ Difference
          ───────────────────────┼───────────────────────┼────────────────────┼─────────────────────────────────────
   13      File Size             │ 15,059 bytes          │ 14,849 bytes       │ File 1 is 210 bytes larger
   14      Line Terminator       │ CRLF ( \r\n )         │ CR ( \r )          │ File 1 uses CRLF; File 2 uses CR
                                 │                       │                    │ only
   15      Total Lines / Records │ 22                    │ 22                 │ Equal record count
   16      Line 1 (Header)       │ 380 chars             │ 380 chars          │ Identical
   17      Lines 2-22 (Details)  │ 697 chars each        │ 688 chars each     │ File 1 has 9 extra chars (
                                 │                       │                    │ 0000.0000 ) at the end of each
                                 │                       │                    │ detail line
          ──────
   21     ## 🔍 Detailed Record Analysis
   22
   23     ### 1. Line Endings (Newlines)

   24     • File 1 contains 21 CRLF ( \r\n ) sequences.
   25     • File 2 contains 21 CR ( \r ) characters only (no  \n ).
   26
   27     ### 2. Header Record (Line 1)

   28     • Starts with:  10101000009999
   29     • Length:  380  characters.
   30     • Content is 100% identical between both files.
   31
   32     ### 3. Detail Records (Lines 2 to 22)

   33     • Start with:  20101000009999
   34     • The first  688  characters of each detail record match exactly in both files.
   35     • File 1 has 9 additional characters ( 0000.0000 ) appended at the end of each line before the line
          terminator.
   36     • File 2 terminates the line immediately after the 688th character.
   37
   38     #### 💡 Difference Visualizer (Lines 2 - 22)
   39
   41       # File 2 (Audited version):
   42       ... 00.00000.0\r
   43
   44       # File 1 (Original version):
   45       + ... 00.00000.00000.0000\r\n
   47
   48     • Tail of Record (File 2):  ... 00.00000.0
>  49     • Tail of Record (File 1):  ... 00.00000.00000.0000  (extra  0000.0000  added)