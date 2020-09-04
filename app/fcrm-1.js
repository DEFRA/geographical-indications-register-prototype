const express = require('express')
const { get } = require('browser-sync')
const router = express.Router()
const fs = require('fs')

var folder = "fcrm-1"
var versionServiceName = "Flood and coastal erosion risk management"
router.use(function (req, res, next) {
  // store in locals this can then be used in pages as {{folder}} etc
  res.locals.folder=folder
  res.locals.versionServiceName=versionServiceName
  next()
})

var searchColumn = 'title'


// Routes

// Search
// Variant Specialist publisher
router.get('/search-results_spec_pub-default', function(req, res) {
    res.render(folder + '/search-results_spec_pub-default', { results: filterReports(req.query.name, req.query.assets), url: req.url  })
})


// Others
router.get('/product-details-default/:reportNumber', function(req, res) {
    res.render(folder + '/product-details-default', findReport(req.params.reportNumber))
})


// Functions
function findReport(reportNumber) {
    return getReportData('reports').find(element => element.id === reportNumber)
}

function filterReports(searchText,assets) {
    searchText = searchText.toLowerCase()

    let reportData = getReportData('reports')

    if (searchText) {
        reportData = reportData.filter(element => element[searchColumn].includes(searchText,-1))
    }

    if (assets != '_unchecked') {
        reportData = reportData.filter(element => assets.includes(element.assets))
    }

    return reportData
}

function getReportData(reportData) {
    return require('./views/' + folder + '/data/reports/reports.json')
}

module.exports = router
