const fs = require('fs');

const {mnemonic,infuraKey} = JSON.parse(fs.readFileSync('secrets.json').toString())
console.log(mnemonic)