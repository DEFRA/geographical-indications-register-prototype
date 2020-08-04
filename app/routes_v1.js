const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

var folder = "v1"

// Routes
router.get('/search', function(req, res) {
    res.render(folder + '/search')
})

router.get('/search-results', function(req, res) {
    console.log(req.query)
    res.render(folder + '/search-results', { results: filterRegister(req.query.name, req.query['product-type'], req.query.status, req.query.country, req.query.category) })
})

router.get('/details/:giName', function(req, res) {
    res.render(folder + '/product-details', findGi(req.params.giName))
})

// Functions
function findGi(giName) {
    return getRegisterData('register').find(element => element.EA_Name === giName)
}

function filterRegister(name, types, statuses, country, category) {
    let registerData = getRegisterData('register')
    if (name) {
        registerData = registerData.filter(element => element.EA_Name.includes(name))
    }


    if (types !== '_unchecked') {
        registerData = registerData.filter(element => types.includes(element.EA_ProductType))
    }

    if (statuses !== '_unchecked') {
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
