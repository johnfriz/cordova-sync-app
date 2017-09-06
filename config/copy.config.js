var fs = require('fs-extra')

var dependencies = [
    ['node_modules/@akeating-redhat/fh-sync-js/libs/generated/lawnchair.js','www/build/lawnchair.js'],
    ['node_modules/@akeating-redhat/fh-sync-js/libs/generated/crypto.js', 'www/build/crypto.js']
];

dependencies.forEach(function(value) {
    fs.copy(value[0],value[1]);
});
