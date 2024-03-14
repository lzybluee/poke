const fs = require('fs');
const util = require('util');

var ZH = false;
const ABILITIES = 0;
const ITEMS = 1;
const MOVES = 2;
const SPECIES = 3;

function get_name(name, type) {
    name = name.replaceAll('’', "'").replaceAll('é', 'e');
    if (ZH) {
        trans = null;
        switch(type) {
            case ABILITIES:
                trans = trans_abilities[name.replace(/ \(.*\)/, '')];
                break;
            case ITEMS:
                trans = trans_items[name];
                break;
            case MOVES:
                trans = trans_moves[name];
                break;
            case SPECIES:
                trans = trans_species[name];
                break;
        }

        if(trans)
            return name + ' (' + trans + ')';
    }
    return name;
}

function log_detail(file, obj) {
    let text = '';

    for (let i in obj) {
        text += util.inspect(obj[i], {depth: null, maxArrayLength: null});
        if (i < obj.length - 1)
            text += ',\n';
    }

    fs.writeFileSync(file + '.txt', text);
}

function csv_text() {
    let text = '';

    for (let i in arguments) {
        if (Array.isArray(arguments[i])) {
            for (let j in arguments[i])
                text += '"' + arguments[i][j].replaceAll('"', '""') + '",';
        } else {
            if (typeof(arguments[i]) === 'number' || typeof(arguments[i]) === 'boolean')
                text += arguments[i] + ',';
            else
                text += '"' + arguments[i].replaceAll('"', '""') + '",';
        }
    }

    return text + '\n';
}

function log_list(list_folder, detail_folder, file, obj) {
    let list = [];

    for (let i in obj) {
        if (obj[i].isNonstandard === null)
            list.push(obj[i]);
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    let text = '';
    let csv = '';
    for (let i in list) {
        let name = get_name(list[i].name, file == 'Abilities' ? ABILITIES : ITEMS);
        let desc = file == 'Items' ? list[i].desc.replaceAll('’', "'").replaceAll('é', 'e') : list[i].desc;

        text += name + '\n' + desc + '\n\n';

        csv += csv_text(name, desc);
    }

    fs.writeFileSync(list_folder + file + '.txt', text.substring(0, text.length - 1));
    fs.writeFileSync(list_folder + file + '.csv', csv);
}

function log_moves(list_folder, detail_folder, file, obj) {
    var move_names = [];
    let list = [];

    for (let i in obj) {
        if (obj[i].isNonstandard === null && obj[i].desc)
            list.push(obj[i]);
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    let text = '';
    let csv = '';
    for (let i in list) {
        let name = get_name(list[i].name, MOVES);
        move_names[list[i].id] = list[i].name;

        text += name + '\n' +
                list[i].type + '\n' +
                list[i].category + '\n' +
                'pow: ' + list[i].basePower +
                ', acc: ' + list[i].accuracy +
                ', pp: ' + list[i].pp +
                ', pri: ' + list[i].priority +
                ', target: ' + list[i].target + '\n' +
                list[i].desc + '\n\n';

        if (typeof(list[i].accuracy) === 'boolean')
            dmg = list[i].basePower;
        else
            dmg = list[i].basePower * list[i].accuracy / 100;

        csv += csv_text(name, list[i].type, list[i].category,
            list[i].basePower, list[i].accuracy, dmg, list[i].pp, list[i].priority,
            list[i].target, list[i].desc);
    }

    fs.writeFileSync(list_folder + file + '.txt', text.substring(0, text.length - 1));
    fs.writeFileSync(list_folder + file + '.csv', csv);

    return move_names;
}

function log_species(list_folder, detail_folder, file, obj) {
    var species_info = [];
    let list = [];
    let orders = [];

    for (let i in obj) {
        if (obj[i].isNonstandard === null) {
            list.push(obj[i]);
            if (obj[i].formeOrder)
                orders[obj[i].num] = obj[i].formeOrder;
        }
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        if (a.num != b.num)
            return a.num - b.num;
        else
            return orders[a.num].indexOf(a.name) - orders[a.num].indexOf(b.name);
    });

    let text = '';
    let csv = '';
    for (let i in list) {
        let species_name = get_name(list[i].name, SPECIES);
        species_info[list[i].id] = list[i];

        text += list[i].num + '\n' + species_name + '\n';

        text += list[i].types.join(', ') + '\n';

        let types = [];
        for (let j in list[i].types)
            types.push(list[i].types[j]);
        while (types.length < 2)
            types.push('');

        let sum = 0;
        for (let j in list[i].baseStats) {
            text += j + ": " + list[i].baseStats[j] + ', ';
            sum += list[i].baseStats[j];
        }
        text += 'sum: ' + sum + '\n';

        let k = 0;
        for (let j in list[i].abilities) {
            text += j + ": " + get_name(list[i].abilities[j], ABILITIES);
            k++;
            if (k < Object.keys(list[i].abilities).length)
                text += ', ';
        }
        text += '\n\n';

        let abilities = [];
        abilities.push(list[i].abilities[0] ? get_name(list[i].abilities[0], ABILITIES) : '');
        abilities.push(list[i].abilities[1] ? get_name(list[i].abilities[1], ABILITIES) : '');
        abilities.push(list[i].abilities['H'] ? get_name(list[i].abilities['H'], ABILITIES) : '');
        abilities.push(list[i].abilities['S'] ? get_name(list[i].abilities['S'], ABILITIES) : '');

        csv += csv_text(list[i].num, species_name, types,
            list[i].baseStats['hp'], list[i].baseStats['atk'], list[i].baseStats['def'],
            list[i].baseStats['spa'], list[i].baseStats['spd'], list[i].baseStats['spe'],
            sum, abilities);
    }

    fs.writeFileSync(list_folder + file + '.txt', text.substring(0, text.length - 1));
    fs.writeFileSync(list_folder + file + '.csv', csv);

    return species_info;
}

function log_learnsets(file, dex, gen, species_info, move_names) {
    let text = '';

    for (let i in species_info) {
        learnsets = dex.species.getLearnsetData(i).learnset;
        if (learnsets) {
            text += get_name(species_info[i].name, SPECIES) + '\n';

            for(let j in learnsets) {
                if (move_names[j]) {
                    let methods = [];
                    for (let k in learnsets[j]) {
                        let result = learnsets[j][k].match(/^\d+/);
                        if (result && result[0] == gen) {
                            let method = learnsets[j][k].substring(result.index + 1);
                            switch(method[0]) {
                                case 'L':
                                    methods.push(method.replace('L', 'Level '));
                                    break;
                                case 'M':
                                    methods.push('TM');
                                    break;
                                case 'E':
                                    methods.push('Egg');
                                    break;
                                case 'T':
                                    methods.push('Tutor');
                                    break;
                                case 'D':
                                    methods.push('DreamWorld');
                                    break;
                                case 'R':
                                    methods.push('Special');
                                    break;
                                case 'S':
                                case 'V':
                                    break;
                            }
                        }
                    }
                    if (methods.length > 0)
                        text += '    ' + get_name(move_names[j], MOVES) + ' : ' + methods.join(', ') + '\n';
                }
            }

            text += '\n';
        }
    }

    fs.writeFileSync(file + '.txt', text.substring(0, text.length - 1));
}

function log_evolve(name, evos_list, evos_processed) {
    let evolve_list = [];
    let no_further_evolve = [];

    evos_processed.push(name);

    for (let i in evos_list[name]) {
        let evolve_name = evos_list[name][i];
        if (evos_list[evolve_name] && evos_list[evolve_name].length > 0) {
            evolves = log_evolve(evolve_name, evos_list, evos_processed);
            for (let j in evolves)
                evolve_list.push(' -> ' + get_name(evolve_name, SPECIES) + evolves[j]);
        } else {
            evos_processed.push(evolve_name);
            no_further_evolve.push(get_name(evos_list[name][i], SPECIES));
        }
    }

    if (no_further_evolve.length > 0)
        evolve_list.push(' -> ' + no_further_evolve.join(', '));

    return evolve_list;
}

function log_evolves(file, species_info) {
    let text = '';
    let evos_list = {};
    let evos_processed = [];

    let species_names = [];
    for(let i in species_info)
        species_names.push(species_info[i].name);

    for (let i in species_info) {
        let evos = species_info[i].evos.filter(
            function(item) {
                return species_names.includes(item);
            });
        if (evos.length > 0 || species_info[i].forme == '')
            evos_list[species_info[i].name] = evos;
    }

    let pre_evos = [];
    for (let i in evos_list) {
        for (let j in evos_list[i]) {
            pre_evos[evos_list[i][j]] = i;
        }
    }

    for (let i in evos_list) {
        if (!evos_processed.includes(i)) {
            let species_name = i;

            while (pre_evos[species_name])
                species_name = pre_evos[species_name];

            evolves = log_evolve(species_name, evos_list, evos_processed);

            if(evolves.length > 0) {
                for (let j in evolves)
                    text += get_name(species_name, SPECIES) + evolves[j] + '\n';
            } else {
                text += get_name(species_name, SPECIES) + '\n';
            }

            text += '\n';
        }
    }

    fs.writeFileSync(file + '.txt', text.substring(0, text.length - 1));
}

function log_chart(file, chart) {
    let text = '';
    let available = [];
    let type_chart = [];
    let align = 0;

    for (let i in chart) {
        if (!chart[i].isNonstandard) {
            type_name = i.charAt(0).toUpperCase() + i.slice(1);
            if (type_name.length > align)
                align = type_name.length;
            available.push(type_name);
            for (let j in chart[i].damageTaken) {
                type_chart[j] ??= [];
                type_chart[j][type_name] = chart[i].damageTaken[j];
            }
        }
    }

    available.sort();

    text = '|'.padEnd(align + 1, ' ');
    for (let i in available)
        text += '|' + available[i].padEnd(align, ' ');
    text += '|\n';

    text += '|'.padEnd(align + 1, '-').repeat(available.length + 1) + '|\n';

    for (let i in available) {
        text += '|' + available[i].padEnd(align, ' ');
        for (let j in available) {
            let damage = '1';
            switch (type_chart[available[i]][available[j]]) {
                case 1:
                    damage = '2';
                    break;
                case 2:
                    damage = '½';
                    break;
                case 3:
                    damage = '0';
                    break;
            }
            text += '|' + damage.padEnd(align, ' ');
        }
        text += '|\n';
    }

    fs.writeFileSync(file + '.md', text);
}

function log_data(file, obj) {
    if (!ZH)
        fs.writeFileSync(file + '.txt', util.inspect(obj, {depth: null, maxArrayLength: null}));
}

function log_json(file, obj) {
    if (!ZH)
        fs.writeFileSync(file + '.json', JSON.stringify(obj));
}

function log_gen(gen) {
    let dex = Dex.mod('gen' + gen);
    let list_folder = (ZH ? 'zh_list' : 'list') + '/gen' + gen + '/';
    let data_folder = 'data/gen' + gen + '/';
    let json_folder = 'json/gen' + gen + '/';
    let detail_folder = 'detail/gen' + gen + '/';

    if (!fs.existsSync(list_folder))
        fs.mkdirSync(list_folder, { recursive: true });

    if (!fs.existsSync(data_folder))
        fs.mkdirSync(data_folder, { recursive: true });

    if (!fs.existsSync(json_folder))
        fs.mkdirSync(json_folder, { recursive: true });

    if (!fs.existsSync(detail_folder))
        fs.mkdirSync(detail_folder, { recursive: true });

    const abilities = dex.abilities.all();
    log_list(list_folder, detail_folder, 'Abilities', abilities);
    log_json(json_folder + 'List_Abilities', abilities);

    const items = dex.items.all();
    log_list(list_folder, detail_folder, 'Items', items);
    log_json(json_folder + 'List_Items', items);

    const moves = dex.moves.all();
    var move_names = log_moves(list_folder, detail_folder, 'Moves', moves);
    log_json(json_folder + 'List_Moves', moves);

    const species = dex.species.all();
    var species_info = log_species(list_folder, detail_folder, 'Species', species);
    log_json(json_folder + 'List_Species', species);

    log_learnsets(list_folder + 'Learnsets', dex, gen, species_info, move_names);

    log_evolves(list_folder + 'Evolves', species_info);

    log_chart(list_folder + 'TypeChart', dex.data.TypeChart);

    for (let i in dex.data) {
        if (i != 'PokemonGoData') {
            log_data(data_folder + i, dex.data[i]);
            log_json(json_folder + 'Data_' + i, dex.data[i]);
        }
    }
}

function get_trans(file, output) {
    var trans = [];
    let text = '';

    let en_list = fs.readFileSync(file.replaceAll('*', 'en')).toString().split('\r\n');
    let zh_list = fs.readFileSync(file.replaceAll('*', 'zh')).toString().split('\r\n');

    for (let i = 0; i < en_list.length; i++) {
        if (en_list[i] != zh_list[i] && !trans[en_list[i]] && !en_list[i].startsWith('?')) {
            let en = en_list[i].replaceAll('’', "'").replaceAll('é', 'e').replaceAll('♀', '-F').replaceAll('♂', '-M');
            en = en.replace('Upgrade', 'Up-Grade');
            let zh = zh_list[i].replace('・', '·');
            trans[en] = zh;
            text += en + '\r\n' + zh + '\r\n\r\n';
        }
    }

    fs.writeFileSync('zh_list/Trans_' + output + '.txt', text);

    return trans;
}

const {Dex} = require('../pokemon-showdown');

if (process.argv.length <= 2) {
    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    if (!fs.existsSync('json'))
        fs.mkdirSync('json');

    const formats = Dex.formats.all();
    log_data('data/Formats', formats);
    log_json('json/Formats', formats);

    for (let i = 1; i <= 9; i++)
        log_gen(i);
} else {
    ZH = true;

    if (!fs.existsSync('zh_list'))
        fs.mkdirSync('zh_list');

    const trans_folder = '../PKHeX/PKHeX.Core/Resources/text/';
    trans_items = get_trans(trans_folder + 'items/text_Items_*.txt', 'Items');
    trans_abilities = get_trans(trans_folder + 'other/*/text_Abilities_*.txt', 'Abilities');
    trans_species = get_trans(trans_folder + 'other/*/text_Species_*.txt', 'Species');
    trans_moves = get_trans(trans_folder + 'other/*/text_Moves_*.txt', 'Moves');

    for (let i = 1; i <= 9; i++)
        log_gen(i);
}
