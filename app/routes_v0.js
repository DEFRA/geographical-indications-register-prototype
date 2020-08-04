const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

var folder = "v0"

// Routes
router.get('/badly-designed-register/:register', function(req, res) {
    var register = getRegister(req.params.register)
    if (req.query.filter) {
        register = filterRegister(register, req.query.filter)
    }

    if (req.query.sortColumn) {
        register = sortRegister(register, req.query.sortColumn, req.query.sortDescending)
    }

    register.filter = req.query.filter
    register.sortColumn = req.query.sortColumn
    register.sortDescending = req.query.sortDescending || 'false'

    res.render( folder + '/badly-designed-register', register)
})

// Functions
function filterRegister(register, filterTerm) {
    // Only keep geographical indications where at least one of the columns contains the filter term
    register.data = register.data.filter(function(geographicalIndication) {
        return geographicalIndication.some(function(dataItem) {
            return dataItem.toLowerCase().includes(filterTerm.toLowerCase())
        })
    })
    return register
}

function sortRegister(register, sortColumn, sortDescending) {
    sortDescending = sortDescending === 'true'
    register.data = register.data.sort(function(a, b) {
        var result = a[sortColumn] > b[sortColumn]
        result = sortDescending ? !result : result
        return result ? 1 : -1
    })
    return register
}

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

function getRegisterData(registerName) {
    try {
        const jsonString = fs.readFileSync(`app/data/registers/${registerName}.json`)
        return JSON.parse(jsonString)
    } catch(err) {
        console.log(err)
        return
    }
}

module.exports = router
