const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

// Routes
router.get('search', function(req, res) {
    // Display the page where you enter your search details
})

router.get('search-results', function(req, res) {
    // Display search results
})

router.get('/details/:giName', function(req, res) {
    // Display the details of a specific GI
    res.render('details', { gi: findGi(req.params.giName) })
})

// Functions
function findGi(giName) {
    const registers = ['aromatised-wines', 'food-and-agri-pdo-pgi', 'food-and-agri-tsg', 'spirits', 'traditional-terms', 'wines']

    for (const registerName of registers) {
        let register = findGiInRegister(giName, registerName)
        if (register) {
            return register
        }
    }

    return {}
}

function findGiInRegister(giName, registerName) {
    let nameField = 'Registered Product Name'
    if(registerName === 'traditional-terms') {
        nameField = 'Traditional Term Name'
    }

    return getRegisterData(registerName).find(element => element[nameField] === giName)
}

function getRegisterData(registerName) {
    try {
        const jsonString = fs.readFileSync(`app/data/registers/${registerName}.json`)
        return JSON.parse(jsonString)
    } catch(err) {
        console.log(err)
        return
    }
}

// This function is not currently used but some version of it will be for the legal registers so leaving in
function getRegister(registerName) {
    let title = ''
    switch(registerName) {
        case 'aromatised-wines':
            title = 'Aromatised wines'
            break
        case 'food-and-agri-pdo-pgi':
            title = "Food and Agri PDO PGI"
            break
        case 'food-and-agri-tsg':
            title = "Food and Agri TSG"
            break
        case 'spirits':
            title = "Spirits"
            break
        case 'traditional-terms':
            title = "Traditional terms"
            break
        case 'wines':
            title = "Wines"
            break
        default:
            title = 'Error'
    }

    let data = getRegisterData(registerName)

    return {
        title: title,
        registerName: registerName,
        headers: data.length > 0 ? Object.keys(data[0]) : [],
        data: data.map(function(dataItem) {
            return Object.values(dataItem)
        })
    }
}

module.exports = router
