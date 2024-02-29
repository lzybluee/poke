const fs = require('fs');
const util = require('util');

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
        text += list[i].name + '\n' + list[i].desc + '\n';
        if (i < list.length - 1)
            text += '\n';

        csv += csv_text(list[i].name, list[i].desc);
    }
    fs.writeFileSync(list_folder + file + '.txt', text);
    fs.writeFileSync(list_folder + file + '.csv', csv);
}

function log_moves(list_folder, detail_folder, file, obj) {
    var move_names = [];
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
        move_names[list[i].id] = list[i].name;

        text += list[i].name + '\n' +
                list[i].type + '\n' +
                list[i].category + '\n' +
                'pow: ' + list[i].basePower +
                ', acc: ' + list[i].accuracy +
                ', pp: ' + list[i].pp +
                ', pri: ' + list[i].priority +
                ', target: ' + list[i].target + '\n' +
                list[i].desc + '\n';

        if (i < list.length - 1)
            text += '\n';

        if (typeof(list[i].accuracy) === 'boolean')
            dmg = list[i].basePower;
        else
            dmg = list[i].basePower * list[i].accuracy / 100;

        csv += csv_text(list[i].name, list[i].type, list[i].category,
            list[i].basePower, list[i].accuracy, dmg, list[i].pp, list[i].priority,
            list[i].target, list[i].desc);
    }

    fs.writeFileSync(list_folder + file + '.txt', text);
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
        species_info[list[i].id] = { name: list[i].name, evos: list[i].evos };

        text += list[i].num + '\n' + list[i].name + '\n';

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
            text += j + ": " + list[i].abilities[j];
            k++;
            if (k < Object.keys(list[i].abilities).length)
                text += ', ';
        }
        text += '\n';

        let abilities = [];
        abilities.push(list[i].abilities[0] ?? '');
        abilities.push(list[i].abilities[1] ?? '');
        abilities.push(list[i].abilities['H'] ?? '');
        abilities.push(list[i].abilities['S'] ?? '');

        if (i < list.length - 1)
            text += '\n';

        csv += csv_text(list[i].num, list[i].name, types,
            list[i].baseStats['hp'], list[i].baseStats['atk'], list[i].baseStats['def'],
            list[i].baseStats['spa'], list[i].baseStats['spd'], list[i].baseStats['spe'],
            sum, abilities);
    }

    fs.writeFileSync(list_folder + file + '.txt', text);
    fs.writeFileSync(list_folder + file + '.csv', csv);

    return species_info;
}

function log_learnsets(file, dex, gen, species_info, move_names) {
    let text = '';
    let count = 0;

    for (let i in species_info) {
        text += species_info[i].name + '\n';
        learnsets = dex.species.getLearnsetData(i).learnset;
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
                    text += '    ' + move_names[j] + ' : ' + methods.join(', ') + '\n';
            }
        }

        count++;
        if (count < Object.keys(species_info).length)
            text += '\n';
    }

    fs.writeFileSync(file + '.txt', text);
}

function log_evolve(name, evos_list, evos_processed) {
    let evolve_list = [];
    let no_further_evolve = [];

    evos_processed.push(name);

    for (let i in evos_list[name]) {
        let evolve_name = evos_list[name][i];
        if (evos_list[evolve_name]) {
            evolves = log_evolve(evolve_name, evos_list, evos_processed);
            for (let j in evolves)
                evolve_list.push(' -> ' + evolve_name + evolves[j]);
        } else {
            no_further_evolve.push(evos_list[name][i]);
        }
    }

    if (no_further_evolve.length > 0)
        evolve_list.push(' -> ' + no_further_evolve.join(', '));

    return evolve_list;
}

function log_evolves(file, species_info) {
    let text = '';
    let evos_list = new Array();
    let evos_processed = [];

    let species_names = [];
    for(let i in species_info)
        species_names.push(species_info[i].name)

    for (let i in species_info) {
        if (species_info[i].evos.length > 0) {
            let evos = species_info[i].evos.filter(
                function(item) {
                    return species_names.includes(item);
                });
            if (evos.length > 0)
                evos_list[species_info[i].name] = evos;
        }
    }

    let pre_evos = [];
    for (let i in evos_list) {
        for (let j in evos_list[i]) {
            pre_evos[evos_list[i][j]] = i;
        }
    }

    for (let i in evos_list) {
        if (!evos_processed.includes(i)) {
            species_name = i;
            while (pre_evos[species_name])
                species_name = pre_evos[species_name];
            evolves = log_evolve(species_name, evos_list, evos_processed);
            for (let j in evolves) {
                text += species_name + evolves[j] + '\n';
            }
            text += '\n';
        }
    }

    fs.writeFileSync(file + '.txt', text);
}

function log_data(file, obj) {
    fs.writeFileSync(file + '.txt', util.inspect(obj, {depth: null, maxArrayLength: null}));
}

function log_json(file, obj) {
    fs.writeFileSync(file + '.json', JSON.stringify(obj));
}

const {Dex} = require('../pokemon-showdown');

if (!fs.existsSync('data'))
    fs.mkdirSync('data');

if (!fs.existsSync('json'))
    fs.mkdirSync('json');

const formats = Dex.formats.all();
log_data('data/Formats', formats);
log_json('json/Formats', formats);

function log_gen(gen) {
    let dex = Dex.mod('gen' + gen);
    let list_folder = 'list/gen' + gen + '/';
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

    for (let i in dex.data) {
        if (i != 'PokemonGoData') {
            log_data(data_folder + i, dex.data[i]);
            log_json(json_folder + 'Data_' + i, dex.data[i]);
        }
    }
}

log_gen(1);
log_gen(2);
log_gen(3);
log_gen(4);
log_gen(5);
log_gen(6);
log_gen(7);
log_gen(8);
log_gen(9);
