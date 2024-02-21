const fs = require('fs');
const util = require('util');

function log(file, obj) {
    fs.writeFileSync(file + '.txt', util.inspect(obj, {depth: null, maxArrayLength: null}), function() {});
    fs.writeFileSync(file + '.json', JSON.stringify(obj), function() {});
}

const {Dex} = require('../pokemon-showdown');

const formats = Dex.formats.all();
log('Formats', formats);

function log_gen(gen) {

    dex = Dex.mod(gen);
    prefix = gen + '/';

    if (!fs.existsSync(gen))
        fs.mkdirSync(gen);

    const abilities = dex.abilities.all();
    log(prefix + 'List_Abilities', abilities);

    const items = dex.items.all();
    log(prefix + 'List_Items', items);

    const moves = dex.moves.all();
    log(prefix + 'List_Moves', moves);

    const species = dex.species.all();
    log(prefix + 'List_Species', species);

    for (let i in dex.data) {
        if (i != 'PokemonGoData')
            log(prefix + 'Data_' + i, dex.data[i]);
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
