// A utility for converting a CSV register file into JSON data
// Will import data provided in a CSV into a rough format expected by specialist publisher. It will then output a single csv containing the data that would be imported into specialist publisher
// Usage: node import-register.js <input.csv>
const CSVToJSON = require('csvtojson');
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
    importedEntry.title = entry.EA_Name
    importedEntry.register = getRegister(entry)
    importedEntry.status = getStatus(entry)
    importedEntry.class_category = null //TODO: Fix this!!!
    importedEntry.protection_type = getProtectionType(entry)
    importedEntry.country = entry["Country of origin"].split(", ") // Correct country names
    importedEntry.traditional_term_grapevine_product_category = (entry["Traditional term grapevine product category"] ?? "").replace(" ", "-").toLower() // TODO: Check I've got this right
    importedEntry.traditional_term_type = (entry["Traditional term type"] ?? "").replace("/", "-").replace(" ", "-").toLower()
    importedEntry.traditional_term_language = (entry["Traditional term type"] ?? "").toLower()
    importedEntry.date_application = entry["Date of application"] // TODO: Do we need to do anything to make dates work correctly?
    importedEntry.date_registration = entry["Date of UK registration"]
    importedEntry.date_registration_eu = entry["Date of original registration with the EU"]
    importedEntry.body = `
    ## Product specification

    The product specification is not available on this site. Find out how to [get a product specification for a protected food name](https://www.gov.uk/link-to-follow) on GOV.UK.

    ## Decision notice and protection instrument

    {PROTECTION_NOTICE_TEXT}

    [Decision notice for Scotch Whisky](LINK_TO_DECISION_NOTICE). Date of publication of the instrument: {DATE_NOTICE_PUBLISHED}.

    ## Notes

    {NOTES}

    ## Legislation

    {TRADITIONAL_TERMS_LEGISLATION}

    ## Summary

    {TRADITIONAL_TERMS_SUMMARY_CONDITIONS}

    $CTA
    The date of original registration with the EU was taken from the EU eAmbrosia Register. It is given for information and is not part of the official UK register.
    $CTA` // TODO: Fill this in with traditional terms details and missing variables
    importedEntry.summary = "" // TODO: Fill this in correctly

    return importedEntry
}

// Helper functions
function getRegister(entry) {
    switch(entry["Product type"]) {
        case "Aromatised Wine": return "aromatised-wines";
        case "Spirit Drink": return "spirit-drinks";
        case "Wine": return "wines";
        case "Traditional terms": return "traditional-terms-for-wine";
        case "Food": return entry.EA_Type === "Traditional Specialities Guaranteed (TSG)" ? "foods-traditional-speciality" : "foods-designated-origin-and-geographic-origin"
        default: throw "Unknown product type " + entry.EA_ProductType
    }
}

function getStatus(entry) {
    switch(entry["Status"]) {
        case "Registered": return "registered";
        case "Applied": return "applied-for";
        case "Published": return "in-consultation";
        case "Rejected": return "rejected";
        default: throw "Unknown status type " + entry.EA_Status
    }
}

function getProtectionType(entry) {
    switch(entry["Protection type"]) {
        case "Geographical Indication (GI)": return "geographical-indication-gi";
        case "Protected Geographical Indication (PGI)": return "protected-geographical-indication-pgi";
        case "Protected Designation of Origin (PDO)": return "protected-designation-of-origin-pdo";
        case "Traditional Speciality Guaranteed (TSG)": return "traditional-speciality-guaranteed-tsg";
        case "Traditional Term": return "traditional-term";
        default: throw "Unknown protection type " + entry.EA_Type
    }
}

let importedEAmbrosiaData = await CSVToJSON().fromFile(process.argv[2])
        .then(eAmbrosiaData => {
            console.log(eAmbrosiaData.map(entry => importEAmbrosiaEntry(entry)))
        })
