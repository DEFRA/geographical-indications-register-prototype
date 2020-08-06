const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

var folder = "v1"
router.use(function (req, res, next) {
  // set a folder and store in locals this can then be used in pages as {{folder}}
  res.locals.folder=folder
  next()
});

var searchColumn = 'DEF_SearchTextAll'

// Routes
router.get('/search', function(req, res) {
    res.render(folder + '/search')
})

router.get('/search-results', function(req, res) {
    res.render(folder + '/search-results', { results: filterRegister(req.query.name, req.query.types, req.query.statuses, req.query.country, req.query.category) })
})

router.get('/details/:giNumber', function(req, res) {
    res.render(folder + '/product-details', findGi(req.params.giNumber))
})

router.get('/legal-registers', function(req, res) {
    res.render(folder + '/legal-registers')
})

router.get('/show-register/:registerName', function(req, res) {
    res.render(folder + '/show-register', { results: showRegister(req.params.registerName), registerName: req.params.registerName })
})


// Functions
function findGi(giNumber) {
    return getRegisterData('register').find(element => element.EA_FileNumber === giNumber)
}

function filterRegister(name, types, statuses, country, category) {
    name = name.toLowerCase()

    let registerData = getRegisterData('register')
    if (name) {
        registerData = registerData.filter(element => element[searchColumn].includes(name))
    }

    if (types != '_unchecked') {
        registerData = registerData.filter(element => types.includes(element.EA_ProductType))
    }

    if (statuses != '_unchecked') {
        registerData = registerData.filter(element => statuses.includes(element.EA_Status))
    }

    if (country) {
        registerData = registerData.filter(element => element.EA_Country === country)
    }

    if (category) {
        registerData = registerData.filter(element => element.EA_ProductCategory === category)
    }

    return registerData
}

function showRegister(registerName) {
    let registerData = getRegisterData('register')
    if (registerName) {
        registerData = registerData.filter(element => element.DEF_Register === registerName)
    }
    // Only show status = registered
    registerData = registerData.filter(element => element.EA_Status === "Registered")

    return registerData
}

function getRegisterData(registerName) {
    try {
        const jsonString = fs.readFileSync('app/views/v1/data/registers/register.json')
        return JSON.parse(jsonString)
    } catch(err) {
        console.log(err)
        return
    }
}

module.exports = router
