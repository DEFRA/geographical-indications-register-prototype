// A utility for converting a CSV register file into JSON data
// Usage: node import-register.js <input.csv> <output.json>
const CSVToJSON = require('csvtojson');
const fs = require('fs')

let inputCsv = process.argv[2]
let outputJson = process.argv[3]

CSVToJSON().fromFile(inputCsv)
    .then(register => {
        let data = JSON.stringify(register);
        fs.writeFileSync(outputJson, data);
    }).catch(err => {
        console.log(err);
    });
