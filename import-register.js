// A utility for converting a CSV register file into JSON data
// If no arguments are provided then it will convert all the standard registers. Otherwise it will convert from the file specified in the first arguemnt to the file specified in the second argument
// Usage: node import-register.js <input.csv> <output.json>
const CSVToJSON = require('csvtojson');
const fs = require('fs')

let convertFile = function (sourceFile, destinationFile) {
    CSVToJSON().fromFile(sourceFile)
        .then(register => {
            let data = JSON.stringify(register);
            fs.writeFileSync(destinationFile, data);
        }).catch(err => {
            console.log(err);
        });
}

if (process.argv.length === 2) {
    convertFile('app/data/registers/aromatised-wines.csv', 'app/data/registers/aromatised-wines.json')
    convertFile('app/data/registers/food-and-agri-pdo-pgi.csv', 'app/data/registers/food-and-agri-pdo-pgi.json')
    convertFile('app/data/registers/food-and-agri-tsg.csv', 'app/data/registers/food-and-agri-tsg.json')
    convertFile('app/data/registers/spirits.csv', 'app/data/registers/spirits.json')
    convertFile('app/data/registers/traditional-terms.csv', 'app/data/registers/traditional-terms.json')
    convertFile('app/data/registers/wines.csv', 'app/data/registers/wines.json')
} else {
    convertFile(process.argv[2], process.argv[3])
}
