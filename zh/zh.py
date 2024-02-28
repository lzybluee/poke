def en_zh(out, en, zh):
    with open(out, 'w', encoding='utf8') as output:
        with open(en, 'r', encoding='utf8') as input_en:
            en_lines = input_en.readlines()
        with open(zh, 'r', encoding='utf8') as input_zh:
            zh_lines = input_zh.readlines()
        for i in range(len(en_lines)):
            if en_lines[i] != zh_lines[i] and not en_lines[i].startswith('?') and not en_lines[i].startswith('—'):
                output.write(en_lines[i].strip() + '\n')
                output.write(zh_lines[i].strip() + '\n')
                output.write('\n')


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
