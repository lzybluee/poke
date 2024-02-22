const fs = require('fs');
const util = require('util');

function log_detail(file, obj) {
    var text = '';
    for (let i in obj) {
        text += util.inspect(obj[i], {depth: null, maxArrayLength: null});
        if (i < obj.length - 1)
            text += ',\n';
    }
    fs.writeFileSync(file + '_detail.txt', text);
}

function log_list(file, obj) {
    var list = [];

    for (let i in obj) {
        if (obj[i].isNonstandard == null)
            list.push(obj[i]);
    }

    log_detail(file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    var text = '';
    for (let i in list) {
        text += list[i].name + '\n' + list[i].desc + '\n';
        if (i < list.length - 1)
            text += '\n';
    }
    fs.writeFileSync(file + '.txt', text);
}

function log_moves(file, obj) {
    var list = [];

    for (let i in obj) {
        if (obj[i].isNonstandard == null)
            list.push(obj[i]);
    }

    log_detail(file, list);

    list.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    var text = '';
    for (let i in list) {
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
    }
    fs.writeFileSync(file + '.txt', text);
}

function log_species(file, obj) {
    var list = [];
    var orders = [];

    for (let i in obj) {
        if (obj[i].isNonstandard == null) {
            list.push(obj[i]);
            if (obj[i].formeOrder)
                orders[obj[i].num] = obj[i].formeOrder;
        }
    }

    log_detail(file, list);

    list.sort(function (a, b) {
        if (a.num != b.num) {
            return a.num - b.num;
        } else {
            return orders[a.num].indexOf(a.name) - orders[a.num].indexOf(b.name);
        }
    });

    var text = '';
    for (let i in list) {
        text += list[i].num + '\n' + list[i].name + '\n';

        var k = 0;
        for (let j in list[i].types) {
            text += list[i].types[j];
            k++;
            if (k < list[i].types.length)
                text += ', ';
        }
        text += '\n';

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

        var n = 0;
        k = 0;
        for (let j in list[i].abilities) {
            n++;
        }
        for (let j in list[i].abilities) {
            text += j + ": " + list[i].abilities[j];
            k++;
            if (k < n)
                text += ', ';
        }
        text += '\n';

        if (i < list.length - 1)
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

const formats = Dex.formats.all();
log_data('Formats', formats);
log_json('Formats', formats);

function log_gen(gen) {
    var dex = Dex.mod(gen);
    var prefix = gen + '/';

    if (!fs.existsSync(gen))
        fs.mkdirSync(gen);

    const abilities = dex.abilities.all();
    log_list(prefix + 'List_Abilities', abilities);
    log_json(prefix + 'List_Abilities', abilities);

    const items = dex.items.all();
    log_list(prefix + 'List_Items', items);
    log_json(prefix + 'List_Items', items);

    const moves = dex.moves.all();
    log_moves(prefix + 'List_Moves', moves);
    log_json(prefix + 'List_Moves', moves);

    const species = dex.species.all();
    log_species(prefix + 'List_Species', species);
    log_json(prefix + 'List_Species', species);

    for (let i in dex.data) {
        if (i != 'PokemonGoData') {
            log_data(prefix + 'Data_' + i, dex.data[i]);
            log_json(prefix + 'Data_' + i, dex.data[i]);
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
