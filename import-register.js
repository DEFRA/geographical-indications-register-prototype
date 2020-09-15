// A dummy import script for geograhpical indication data
// Will import data provided in a CSV into a rough format expected by specialist publisher. It will then output a single csv containing the data that would be imported into specialist publisher
// Usage: node import-register.js <input.csv> <output.csv>
const CSVToJSON = require('csvtojson');
const { parseAsync } = require('json2csv')
const fs = require('fs')
    
// Main import function
async function importData() {

    
        
    let importedEBacchusData = await CSVToJSON().fromFile(process.argv[3])
        .then(eBacchusData => {
            return eBacchusData.map(entry => importEBacchusEntry(entry))
        })

    return importedEAmbrosiaData.concat(importedEBacchusData)
    
}

// Converstion functions for eAmbrosia and E-Bacchus entries
function importEAmbrosiaEntry(entry) {
    let importedEntry = {}
    importedEntry.title = entry["Registered product name"]
    importedEntry.register = getRegister(entry)
    importedEntry.status = getStatus(entry)
    importedEntry.class_category = getClassOrCategory(entry)
    importedEntry.protection_type = getProtectionType(entry)
    importedEntry.country = entry["Country of origin"].replace("Italia", "Italy").replace("Viet nam", "Vietnam").replace("El Savador", "El Salvador").replace("Equador", "Ecuador").replace("Russian Federation", "Russia").replace(/ /g, "-").toLowerCase().split(",-")
    importedEntry.traditional_term_grapevine_product_category = (entry["Traditional term grapevine product category"] || "").replace(/ /g, "-").toLowerCase().split(",-")
    importedEntry.traditional_term_type = (entry["Traditional term type"] || "").replace(/\//g, "-").replace(/ /g, "-").toLowerCase()
    importedEntry.traditional_term_language = (entry["Traditional term language"] || "").toLowerCase()
    importedEntry.date_application = entry["Date of application"]
    importedEntry.date_registration = entry["Date of UK registration"]
    importedEntry.date_registration_eu = entry["Date of original registration with the EU"]
    importedEntry.body = generateBody(entry)
    importedEntry.summary = getSummary(entry)

    return importedEntry
}

// Helper functions
function getRegister(entry) {
    switch(entry["Product type"]) {
        case "Aromatised wine": return "aromatised-wines"
        case "Spirit drink": return "spirit-drinks"
        case "Wine": return "wines"
        case "Traditional term": return "traditional-terms-for-wine"
        case "Food": return entry["Protection type"] === "Traditional Specialities Guaranteed (TSG)" ? "foods-traditional-speciality" : "foods-designated-origin-and-geographic-origin"
        default: throw "Unknown product type " + entry["Product type"]
    }
}

function getStatus(entry) {
    switch(entry["Status"]) {
        case "Registered": return "registered"
        case "Applied": return "applied-for"
        case "Published": return "in-consultation"
        case "Rejected": return "rejected"
        default: throw "Unknown status type " + entry["Status"]
    }
}

function getClassOrCategory(entry) {
    if(entry["Class or category of product"] === "15. Vodka, 31. Flavoured vodka") {
        return ["15-vodka", "31-flavoured-vodka"]
    } else {
        return [entry["Class or category of product"].replace("Class ", "").replace(/\,/g, "").replace(/\./g, "-").replace(/\(/g, "").replace(/\)/g, "").replace(/ /g, "-").replace(/--/g, "-").toLowerCase()]
    }
}

function getProtectionType(entry) {
    switch(entry["Protection type"]) {
        case "Geographical indication (GI)": return "geographical-indication-gi"
        case "Protected Geographical Indication (PGI)": return "protected-geographical-indication-pgi"
        case "Protected Designation of Origin (PDO)": return "protected-designation-of-origin-pdo"
        case "Traditional Specialities Guaranteed (TSG)": return "traditional-speciality-guaranteed-tsg"
        case "Traditional Term": return "traditional-term"
        default: throw "Unknown protection type " + entry["Protection type"]
    }
}

function getSummary(entry) {
    switch(entry["Protection type"]) {
        case "Geographical indication (GI)": return entry["Product type"] === "Spirit drink" ? "Protected spirit drink name" : "Protected aromatised wine name"
        case "Protected Geographical Indication (PGI)": return entry["Product type"] === "Food" ? "Protected food name with Protected Geographical Indication (PGI)" : "Protected wine name with Protected Geographical Indication (PGI)"
        case "Protected Designation of Origin (PDO)": return entry["Product type"] === "Food" ? "Protected food name with Protected Designation of Origin (PDO)" : "Protected wine name with Protected Designation of Origin (PDO)"
        case "Traditional Specialities Guaranteed (TSG)": return "Protected food name with Traditional Speciality Guaranteed (TSG)"
        case "Traditional Term": return "Traditional term for wine"
        default: throw "Unknown protection type " + entry["Protection type"]
    }
}

function generateBody(entry) {
    let result = ''
    
    // Product specification
    if (entry["Product type"] !== "Traditional term") {
        result +=      
`## Product specification

The product specification is not available on this site. Find out how to [get a product specification for a protected food name](https://www.gov.uk/link-to-follow) on GOV.UK.
`
    }
    
    // Decision notice and protection instrument title
    if (entry["Decision notice"] && entry["Protection instrument"]) { 
        result +=      
`
## Decision notice and protection instrument
`
    } else if (entry["Decision notice"]) {
        result +=      
`
## Decision notice
`
    } else if (entry["Protection instrument"]) {
        result +=      
`
## Protection instrument
`      
    }

    // Decision notice
    if (entry["Decision notice"]) {
        result += 
`
${entry["Decision notice"]}
`
    }

    // Protection instrument
    if (entry["Protection instrument"]) {
        result += 
`
[Protection instrument for ${entry["Registered product name"]}](${entry["Protection instrument"]})`

        if (entry["Date of publication of the instrument"]) {
            result += 
`. Date of publication of the instrument: ${entry["Date of publication of the instrument"]}.
`
        } else {
            result +=
`
`
        }
    }

    // Legislation
    if (entry["Legislation"]) {
        result += 
`
## Legislation

${entry["Legislation"]}
`
    }

    // Summary
    if (entry["Summary"]) {
        result += 
`
## Summary

${entry["Summary"]}
`
    }

    return result
}

CSVToJSON().fromFile(process.argv[2])
        .then(eAmbrosiaData => {
            return parseAsync(eAmbrosiaData.map(entry => importEAmbrosiaEntry(entry)))
        })
        .then(csv => fs.writeFile(process.argv[3], csv, 'utf8', function() {}))
