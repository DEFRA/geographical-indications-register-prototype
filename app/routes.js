const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

// Routes
router.get('/badly-designed-register/:register', function(req, res) {
    res.render('badly-designed-register', getRegister(req.params.register))
})

router.get('/badly-designed-register/:register/filter/:filterTerm', function(req, res) {
    res.render('badly-designed-register', filterRegister(getRegister(req.params.register)))
})

// Functions
function filterRegister(register, filterTerm) {
    // Only keep geographical indications where at least one of the columns contains the filter term
    register.data = register.data.reduce(function(geographicalIndication) {
        return geographicalIndication.some(function(dataItem) {
            return dataItem.includes(filterTerm)
        })
    })
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
        headers: Object.keys(data[0]),
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
