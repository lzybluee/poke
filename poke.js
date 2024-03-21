const fs = require('fs');
const util = require('util');

var ZH = false;
const ABILITIES = 0;
const ITEMS = 1;
const MOVES = 2;
const SPECIES = 3;
const TYPES = 4;
const NATURES = 5;

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
            case TYPES:
                trans = trans_types[name];
                break;
            case NATURES:
                trans = trans_natures[name];
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

    for (const arg of arguments) {
        if (Array.isArray(arg)) {
            for (const ele of arg)
                text += '"' + ele.replaceAll('"', '""') + '",';
        } else {
            if (typeof(arg) === 'number' || typeof(arg) === 'boolean')
                text += arg + ',';
            else
                text += '"' + arg.replaceAll('"', '""') + '",';
        }
    }

    return text + '\n';
}

function log_list(list_folder, detail_folder, file, obj) {
    let list = [];

    for (const ele of obj) {
        if (ele.isNonstandard === null)
            list.push(ele);
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    let text = '';
    let csv = '';
    for (const ele of list) {
        let name = get_name(ele.name, file == 'Abilities' ? ABILITIES : ITEMS);
        let desc = file == 'Items' ? ele.desc.replaceAll('’', "'").replaceAll('é', 'e') : ele.desc;

        text += name + '\n' + desc + '\n\n';

        csv += csv_text(name, desc);
    }

    fs.writeFileSync(list_folder + file + '.txt', text.substring(0, text.length - 1));
    fs.writeFileSync(list_folder + file + '.csv', csv);
}

function log_moves(list_folder, detail_folder, file, obj) {
    var move_names = [];
    let list = [];

    for (const ele of obj) {
        if (ele.isNonstandard === null && ele.desc)
            list.push(ele);
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    let text = '';
    let csv = '';
    for (const move of list) {
        let name = get_name(move.name, MOVES);
        move_names[move.id] = move.name;

        text += name + '\n' +
                move.type + '\n' +
                move.category + '\n' +
                'pow: ' + move.basePower +
                ', acc: ' + move.accuracy +
                ', pp: ' + move.pp +
                ', pri: ' + move.priority +
                ', target: ' + move.target + '\n' +
                move.desc + '\n\n';

        if (typeof(move.accuracy) === 'boolean')
            dmg = move.basePower;
        else
            dmg = move.basePower * move.accuracy / 100;

        csv += csv_text(name, move.type, move.category,
            move.basePower, move.accuracy, dmg, move.pp, move.priority,
            move.target, move.desc);
    }

    fs.writeFileSync(list_folder + file + '.txt', text.substring(0, text.length - 1));
    fs.writeFileSync(list_folder + file + '.csv', csv);

    return move_names;
}

function log_species(list_folder, detail_folder, file, obj) {
    var species_info = [];
    let list = [];
    let orders = [];

    for (const ele of obj) {
        if (ele.isNonstandard === null) {
            list.push(ele);
            if (ele.formeOrder)
                orders[ele.num] = ele.formeOrder;
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
    for (const species of list) {
        let species_name = get_name(species.name, SPECIES);
        species_info[species.id] = species;

        text += species.num + '\n' + species_name + '\n';

        text += species.types.join(', ') + '\n';

        let types = [];
        for (const type of species.types)
            types.push(type);
        while (types.length < 2)
            types.push('');

        let sum = 0;
        for (let i in species.baseStats) {
            text += i + ": " + species.baseStats[i] + ', ';
            sum += species.baseStats[i];
        }
        text += 'sum: ' + sum + '\n';

        let k = 0;
        for (let i in species.abilities) {
            text += i + ": " + get_name(species.abilities[i], ABILITIES);
            k++;
            if (k < Object.keys(species.abilities).length)
                text += ', ';
        }
        text += '\n\n';

        let abilities = [];
        abilities.push(species.abilities[0] ? get_name(species.abilities[0], ABILITIES) : '');
        abilities.push(species.abilities[1] ? get_name(species.abilities[1], ABILITIES) : '');
        abilities.push(species.abilities['H'] ? get_name(species.abilities['H'], ABILITIES) : '');
        abilities.push(species.abilities['S'] ? get_name(species.abilities['S'], ABILITIES) : '');

        csv += csv_text(species.num, species_name, types,
            species.baseStats['hp'], species.baseStats['atk'], species.baseStats['def'],
            species.baseStats['spa'], species.baseStats['spd'], species.baseStats['spe'],
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

            for (let j in learnsets) {
                if (move_names[j]) {
                    let methods = [];
                    for (const move of learnsets[j]) {
                        let result = move.match(/^\d+/);
                        if (result && result[0] == gen) {
                            let method = move.substring(result.index + 1);
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

    for (const evo_name of evos_list[name]) {
        if (evos_list[evo_name] && evos_list[evo_name].length > 0) {
            evolves = log_evolve(evo_name, evos_list, evos_processed);
            for (const evo of evolves)
                evolve_list.push(' -> ' + get_name(evo_name, SPECIES) + evo);
        } else {
            evos_processed.push(evo_name);
            no_further_evolve.push(get_name(evo_name, SPECIES));
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
    for (let i in species_info)
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
                for (const evolve of evolves)
                    text += get_name(species_name, SPECIES) + evolve + '\n';
            } else {
                text += get_name(species_name, SPECIES) + '\n';
            }

            text += '\n';
        }
    }

    fs.writeFileSync(file + '.txt', text.substring(0, text.length - 1));
}

function log_type_chart(file, chart) {
    let text = '';
    let available = [];
    let type_chart = [];
    let align = ZH ? 16 : 8;

    for (let i in chart) {
        if (!chart[i].isNonstandard) {
            type_name = i.charAt(0).toUpperCase() + i.slice(1);
            available.push(type_name);
            for (let j in chart[i].damageTaken) {
                type_chart[j] ??= [];
                type_chart[j][type_name] = chart[i].damageTaken[j];
            }
        }
    }

    available.sort();

    let get_type_name = (type) => {
        return get_name(type, TYPES).padEnd(align - (ZH ? trans_types[type].length : 0), ' ');
    }

    text = '|'.padEnd(align + 1, ' ');
    for (const type of available)
        text += '|' + get_type_name(type);
    text += '|\n';

    text += '|'.padEnd(align + 1, '-').repeat(available.length + 1) + '|\n';

    for (const atk_type of available) {
        text += '|' + get_type_name(atk_type);
        for (const def_type of available) {
            let damage = '1';
            switch (type_chart[atk_type][def_type]) {
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

function log_natures(file, natures) {
    let text = '';
    let align = 15;
    let stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    let stats_name = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];

    text += '|'.padEnd(align + 1, ' ');
    for (const i of stats_name)
        text += '|' + i.padEnd(align, ' ');
    text += '|\n';

    text += '|'.padEnd(align + 1, '-').repeat(7) + '|\n';

    let get_nature_name = (nature) => {
        return get_name(nature, NATURES).padEnd(align - (ZH ? trans_natures[nature].length : 0), ' ');
    }

    for (let i in natures) {
        text += '|' + get_nature_name(natures[i].name);
        for (const stat of stats) {
            if (natures[i].plus == stat)
                text += '|+'.padEnd(align + 1, ' ');
            else if (natures[i].minus == stat)
                text += '|-'.padEnd(align + 1, ' ');
            else
                text += '|'.padEnd(align + 1, ' ');
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

    log_type_chart(list_folder + 'TypeChart', dex.data.TypeChart);

    log_natures(list_folder + 'Natures', dex.data.Natures);

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
    trans_types = get_trans(trans_folder + 'other/*/text_Types_*.txt', 'Types');
    trans_natures = get_trans(trans_folder + 'other/*/text_Natures_*.txt', 'Natures');

    for (let i = 1; i <= 9; i++)
        log_gen(i);
}
