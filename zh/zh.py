def en_zh(out, en, zh):
    with open(out, 'w', encoding='utf8') as output:
        en_list = []
        with open(en, 'r', encoding='utf8') as input_en:
            en_lines = input_en.readlines()
        with open(zh, 'r', encoding='utf8') as input_zh:
            zh_lines = input_zh.readlines()
        for i in range(len(en_lines)):
            en_line = en_lines[i].strip()
            zh_line = zh_lines[i].strip()
            if en_line != zh_line and en_line not in en_list and not en_line.startswith('?') and not en_line.startswith('—'):
                output.write(en_line + '\n')
                output.write(zh_line + '\n')
                output.write('\n')
                en_list.append(en_line)


en_zh('Items_zh.txt',
      '../../PKHeX/PKHeX.Core/Resources/text/items/text_Items_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/items/text_Items_zh.txt')
en_zh('Abilities_zh.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/en/text_Abilities_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/zh/text_Abilities_zh.txt')
en_zh('Species_zh.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/en/text_Species_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/zh/text_Species_zh.txt')
en_zh('Moves_zh.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/en/text_Moves_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/zh/text_Moves_zh.txt')
