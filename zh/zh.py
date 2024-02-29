import os

def en_zh(out, en, zh):
    translate = {}
    with open(out, 'w', encoding='utf8') as output:
        with open(en, 'r', encoding='utf8') as input_en:
            en_lines = input_en.readlines()
        with open(zh, 'r', encoding='utf8') as input_zh:
            zh_lines = input_zh.readlines()
        for i in range(len(en_lines)):
            en_line = en_lines[i].strip()
            zh_line = zh_lines[i].strip()
            if en_line != zh_line and en_line not in translate and not en_line.startswith('?') and not en_line.startswith('—'):
                output.write(en_line + '\n')
                output.write(zh_line + '\n')
                output.write('\n')
                translate[en_line] = zh_line
    return translate


trans_items = en_zh('Items_zh.txt',
      '../../PKHeX/PKHeX.Core/Resources/text/items/text_Items_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/items/text_Items_zh.txt')
trans_abilities = en_zh('Abilities_zh.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/en/text_Abilities_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/zh/text_Abilities_zh.txt')
trans_species = en_zh('Species_zh.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/en/text_Species_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/zh/text_Species_zh.txt')
trans_moves = en_zh('Moves_zh.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/en/text_Moves_en.txt',
      r'../../PKHeX/PKHeX.Core/Resources/text/other/zh/text_Moves_zh.txt')


def translate(source, dest, translate, skip=0):
    with open(source, 'r', encoding='utf8') as file:
        with open(dest, 'w', encoding='utf8') as output:
            is_name = (skip == 0)
            count = 0
            for line in file.readlines():
                line = line.strip()
                if is_name:
                    is_name = False
                    if line in translate:
                        output.write('{} ({})'.format(line, translate[line]) + '\n')
                    else:
                        output.write(line + '\n')
                elif line:
                    output.write(line + '\n')
                    count += 1
                    if skip > 0 and count == skip:
                        is_name = True
                else:
                    output.write('\n')
                    count = 0
                    if skip == 0:
                        is_name = True

def translate_gen(gen):
    gen_folder = 'gen' + str(gen)
    if not os.path.exists(gen_folder):
        os.mkdir(gen_folder)

    translate('../list/gen' + str(gen) + '/Abilities.txt', gen_folder + '/Abilities.txt', trans_abilities)
    translate('../list/gen' + str(gen) + '/Items.txt', gen_folder + '/Items.txt', trans_items)
    translate('../list/gen' + str(gen) + '/Moves.txt', gen_folder + '/Moves.txt', trans_moves)
    translate('../list/gen' + str(gen) + '/Species.txt', gen_folder + '/Species.txt', trans_species, 1)


for i in range(1, 10):
    translate_gen(i)
