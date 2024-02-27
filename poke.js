const fs = require('fs');
const util = require('util');

function log_detail(file, obj) {
    var text = '';
    for (let i in obj) {
        text += util.inspect(obj[i], {depth: null, maxArrayLength: null});
        if (i < obj.length - 1)
            text += ',\n';
    }
    fs.writeFileSync(file + '.txt', text);
}

function csv_text() {
    var text = '';
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
    var list = [];

    for (let i in obj) {
        if (obj[i].isNonstandard === null)
            list.push(obj[i]);
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    var text = '';
    var csv = '';
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
    var list = [];
    var move_names = [];

    for (let i in obj) {
        if (obj[i].isNonstandard === null)
            list.push(obj[i]);
    }

    log_detail(detail_folder + file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    var text = '';
    var csv = '';
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
    var list = [];
    var orders = [];
    var species_names = [];

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

    var text = '';
    var csv = '';
    for (let i in list) {
        species_names[list[i].id] = list[i].name;

        text += list[i].num + '\n' + list[i].name + '\n';

        var k = 0;
        for (let j in list[i].types) {
            text += list[i].types[j];
            k++;
            if (k < list[i].types.length)
                text += ', ';
        }
        text += '\n';

        var types = [];
        for (let j in list[i].types)
            types.push(list[i].types[j]);
        while (types.length < 2)
            types.push('');

        var sum = 0;
        k = 0;
        for (let j in list[i].baseStats) {
            text += j + ": " + list[i].baseStats[j];
            sum += list[i].baseStats[j];
            k++;
            if (k < 6)
                text += ', ';
        }
        text += ', sum: ' + sum + '\n';

        k = 0;
        for (let j in list[i].abilities) {
            text += j + ": " + list[i].abilities[j];
            k++;
            if (k < Object.keys(list[i].abilities).length)
                text += ', ';
        }
        text += '\n';

        var abilities = [];
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

    return species_names;
}

function log_learnsets(file, dex, species_names, move_names) {
    var text = '';
    var count = 0;

    for (let i in species_names) {
        text += species_names[i] + '\n';
        learnsets = dex.species.getLearnsetData(i).learnset;
        for(let j in learnsets) {
            if (move_names[j]) {
                text += '    ' + move_names[j] + ' : ';
                for (let k in learnsets[j]) {
                    text += learnsets[j][k];
                    if (k < learnsets[j].length - 1)
                        text += ', ';
                }
                text += '\n';
            }
        }

        count++;
        if (count < Object.keys(species_names).length)
            text += '\n';
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
    var dex = Dex.mod(gen);
    var list_folder = 'list/' + gen + '/';
    var data_folder = 'data/' + gen + '/';
    var json_folder = 'json/' + gen + '/';
    var detail_folder = 'detail/' + gen + '/';

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
    var species_names = log_species(list_folder, detail_folder, 'Species', species);
    log_json(json_folder + 'List_Species', species);

    log_learnsets(list_folder + 'Learnsets', dex, species_names, move_names);

    for (let i in dex.data) {
        if (i != 'PokemonGoData') {
            log_data(data_folder + i, dex.data[i]);
            log_json(json_folder + 'Data_' + i, dex.data[i]);
        }
    }
}

log_gen('gen1');
log_gen('gen2');
log_gen('gen3');
log_gen('gen4');
log_gen('gen5');
log_gen('gen6');
log_gen('gen7');
log_gen('gen8');
log_gen('gen9');
