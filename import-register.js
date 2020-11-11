// A dummy import script for geographical indication data
// Will import data provided in a CSV into a rough format expected by specialist publisher. It will then output a single csv containing the data that would be imported into specialist publisher
// Usage: node import-register.js <input.csv> <output.csv>
const CSVToJSON = require('csvtojson');
const { parseAsync } = require('json2csv')
const fs = require('fs');
const { Console } = require('console');

let errors = []

// Converstion functions for eAmbrosia and E-Bacchus entries
function importEAmbrosiaEntry(entry) {
    let importedEntry = {}
    importedEntry.title = getTitle(entry)
    importedEntry.register = getRegister(entry)
    importedEntry.status = getStatus(entry)
    importedEntry.class_category = getClassOrCategory(entry)
    importedEntry.protection_type = getProtectionType(entry)
    importedEntry.reason_for_protection = getReasonForProtection(entry)
    importedEntry.country = getCountry(entry)
    importedEntry.traditional_term_grapevine_product_category = getGrapevinePrductCategory(entry)
    importedEntry.traditional_term_type = getTermType(entry)
    importedEntry.traditional_term_language = getLanguage(entry)
    importedEntry.date_application = entry["Date of application"]
    importedEntry.date_registration = entry["Date of UK registration"]
    importedEntry.date_registration_eu = entry["Date of original registration with the EU"]
    importedEntry.body = generateBody(entry)
    importedEntry.summary = getSummary(entry)
    importedEntry.internal_notes = entry["Internal notes"]

    return importedEntry
}

// Helper functions
function getTitle(entry) {
    if(!entry["Registered product name"]) {
        errors.push("Geographical indication found without product name")
    }

    return entry["Registered product name"]
}

function getRegister(entry) {
    if(entry["Protection type"] === "Name protected by international treaty") {
        return "names-protected-by-international-treaty"
    }

    switch(entry["Product type"]) {
        case "Aromatised wine": return "aromatised-wines"
        case "Spirit drink": return "spirit-drinks"
        case "Wine": return "wines"
        case "Traditional term": return "traditional-terms-for-wine"
        case "Food": return entry["Protection type"] === "Traditional Specialities Guaranteed (TSG)" ? "foods-traditional-speciality" : "foods-designated-origin-and-geographic-origin"
        default: {
            errors.push(productNameForError(entry) + " has unknown product type " + (entry["Product type"] || "<blank>"))
            return ""
        }
    }
}

function getStatus(entry) {
    if(!statusMap[entry["Status"]]) {
        errors.push(productNameForError(entry) + " has unknown status " + (entry["Status"] || "<blank>"))
    }
    return statusMap[entry["Status"]]
}

function getClassOrCategory(entry) {
    if(entry["Class or category of product"] === "15. Vodka, 31. Flavoured vodka") {
        return ["15-vodka", "31-flavoured-vodka"]
    } else {
        if (!classCategoryMap[entry["Class or category of product"]]) {
            errors.push(productNameForError(entry) + " has unknown class " + (entry["Class or category of product"] || "<blank>"))
        }
        return [classCategoryMap[entry["Class or category of product"]]]
    }
}

function getProtectionType(entry) {
    if(!protectionTypeMap[entry["Protection type"]]) {
        errors.push(productNameForError(entry) + " has unknown protection type " + (entry["Protection type"] || "<blank>"))
    }
    return protectionTypeMap[entry["Protection type"]]
}

function getReasonForProtection(entry) {
    if(!reasonForProtectionMap[entry["Reason for protection"]]) {
        errors.push(productNameForError(entry) + " has unknown reason for protection type " + (entry["Reason for protection"] || "<blank>"))
    }
    return reasonForProtectionMap[entry["Reason for protection"]]
}

function getCountry(entry) {
    entry["Country of origin"].split(", ").map(country => {
        if (!countryMap[country]) {
            errors.push(productNameForError(entry) + " has unknown country " + (country || "<blank>"))
        }
        return countryMap[country]
    })
}

function getGrapevinePrductCategory(entry) {
    if (entry["Traditional term grapevine product category"]) {
        return entry["Traditional term grapevine product category"].split(", ").map(category => {
            if (!grapevineCategoryMap[category]) {
                errors.push(productNameForError(entry) + " has unknown grapevine product category " + (category || "<blank>"))
            }
            return grapevineCategoryMap[category]
        })
    } else {
        return []
    }
}

function getTermType(entry) {
    if (entry["Traditional term type"]) {
        if(!termTypeMap[entry["Traditional term type"]]) {
            errors.push(productNameForError(entry) + " has unknown traditional term type " + (entry["Traditional term type"] || "<blank>"))
        }
        return termTypeMap[entry["Traditional term type"]]
    } else {
        return ""
    }
}

function getLanguage(entry) {
    if (entry["Traditional term language"]) {
        if(!languageMap[entry["Traditional term language"]]) {
            errors.push(productNameForError(entry) + " has unknown language " + (entry["Traditional term language"] || "<blank>"))
        }
        return languageMap[entry["Traditional term language"]]
    } else {
        return ""
    }
}

function getSummary(entry) {
    switch(entry["Protection type"]) {
        case "Geographical indication (GI)": {
            if (entry["Product type"] === "Spirit drink") {
                return "Protected spirit drink name"
            } else if (entry["Product type"] === "Aromatised wine") {
                return "Protected aromatised wine name"
            } else {
                errors.push(productNameForError(entry) + " has protection type GI but has product type " + (entry["Protection type"] || "<blank>"))
                return ""
            }
        }
        case "Protected Geographical Indication (PGI)": {
            if (entry["Product type"] === "Food") {
                return "Protected food name with Protected Geographical Indication (PGI)"
            } else if (entry["Product type"] === "Wine") {
                return "Protected wine name with Protected Geographical Indication (PGI)"
            } else {
                errors.push(productNameForError(entry) + " has protection type PGI but has product type " + (entry["Protection type"] || "<blank>"))
                return ""
            }
        }
        case "Protected Designation of Origin (PDO)": {
            if (entry["Product type"] === "Food") {
                return "Protected food name with Protected Designation of Origin (PDO)"
            } else if (entry["Product type"] === "Wine") {
                return "Protected wine name with Protected Designation of Origin (PDO)"
            } else {
                errors.push(productNameForError(entry) + " has protection type PDO but has product type " + (entry["Protection type"] || "<blank>"))
                return ""
            }
        }
        case "Traditional Specialities Guaranteed (TSG)": return "Protected food name with Traditional Speciality Guaranteed (TSG)"
        case "Traditional Term": return "Traditional term for wine"
        case "Name protected by international treaty": return "Name protected by international treaty"
        default: return ""
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

    // Summary
    if (entry["Summary"]) {
        result += 
`
## Summary

${entry["Summary"]}
`
    }

    // Legislation
    if (entry["Legislation"]) {
        result += 
`
## Legislation

${entry["Legislation"]}
`
    }

    // Notes
    if (entry["Notes"]) {
        result += 
`
## Notes

${entry["Notes"]}
`
    }

    return result
}

function productNameForError(entry) {
    return entry["Registered product name"] || "Product"
}

CSVToJSON().fromFile(process.argv[2])
        .then(eAmbrosiaData => {
            return eAmbrosiaData
                .filter(entry => entry["Status"] === "Registered") // We will want to exclude this line from the final import routine. This was just useful while doing development
                .map(entry => importEAmbrosiaEntry(entry))
        })
        .then(importedData => {
            return parseAsync(importedData)
        })
        .then(csv => fs.writeFile(process.argv[3], csv, 'utf8', function() {}))
        .then(() => errors.forEach(error => console.log(error)))

let statusMap = {
    "Registered": "registered",
    "Applied": "applied-for",
    "Published": "in-consultation",
    "Rejected": "rejected",
}

let classCategoryMap = {
    "Class 1.1. Fresh meat (and offal)": "1-1-fresh-meat-and-offal",
    "Class 1.2. Meat products (cooked, salted, smoked, etc.)": "1-2-meat-products-cooked-salted-smoked-etc",
    "Class 1.3. Cheeses": "1-3-cheeses",
    "Class 1.4. Other products of animal origin (eggs, honey, various dairy products except butter, etc.)": "1-4-other-products-of-animal-origin-eggs-honey-various-dairy-products-except-butter-etc",
    "Class 1.5. Oils and fats (butter, margarine, oil, etc.)": "1-5-oils-and-fats-butter-margarine-oil-etc",
    "Class 1.6. Fruit, vegetables and cereals fresh or processed": "1-6-fruit-vegetables-and-cereals-fresh-or-processed",
    "Class 1.7. Fresh fish, molluscs, and crustaceans and products derived therefrom": "1-7-fresh-fish-molluscs-and-crustaceans-and-products-derived-therefrom",
    "Class 1.8. Other products of Annex I of the Treaty (spices etc.)": "1-8-other-products-of-annex-i-of-the-treaty-spices-etc",
    "Class 2.1. Beers": "2-1-beers",
    "Class 2.2. Chocolate and derived products": "2-2-chocolate-and-derived-products",
    "Class 2.3. Bread, pastry, cakes, confectionery, biscuits and other baker's wares": "2-3-bread-pastry-cakes-confectionery-biscuits-and-other-bakers-wares",
    "Class 2.4. Beverages made from plant extracts": "2-4-beverages-made-from-plant-extracts",
    "Class 2.5. Pasta": "2-5-pasta",
    "Class 2.6. Salt": "2-6-salt",
    "Class 2.7. Natural gums and resins": "2-7-natural-gums-and-resins",
    "Class 2.8. Mustard paste": "2-8-mustard-paste",
    "Class 2.9. Hay": "2-9-hay",
    "Class 2.10. Essential oils": "2-10-essential-oils",
    "Class 2.11. Cork": "2-11-cork",
    "Class 2.12. Cochineal (raw product of animal origin)": "2-12-cochineal-raw-product-of-animal-origin",
    "Class 2.13. Flowers and ornamental plants": "2-13-flowers-and-ornamental-plants",
    "Class 2.14. Cotton": "2-14-cotton",
    "Class 2.15. Wool": "2-15-wool",
    "Class 2.16. Wicker": "2-16-wicker",
    "Class 2.17. Scutched flax": "2-17-scutched-flax",
    "Class 2.18. Leather": "2-18-leather",
    "Class 2.19. Fur": "2-19-fur",
    "Class 2.20. Feather": "2-20-feather",
    "Class 2.21. Prepared meals": "2-21-prepared-meals",
    "Class 2.22. Beers": "2-22-beers",
    "Class 2.23. Chocolate and derived products": "2-23-chocolate-and-derived-products",
    "Class 2.24. Bread, pastry, cakes, confectionery, biscuits and other baker's wares": "2-24-bread-pastry-cakes-confectionery-biscuits-and-other-baker's-wares",
    "Class 2.25. Beverages made from plant extracts": "2-25-beverages-made-from-plant-extracts",
    "Class 2.26. Pasta": "2-26-pasta",
    "Class 2.27. Salt": "2-27-salt",
    "Wine": "wine",
    "1. Rum": "1-rum",
    "2. Whisky or Whiskey": "2-whisky-or-whiskey",
    "3. Grain spirit": "3-grain-spirit",
    "4. Wine spirit": "4-wine-spirit",
    "5. Brandy or Weinbrand": "5-brandy-or-weinbrand",
    "6. Grape marc spirit or grape marc": "6-grape-marc-spirit-or-grape-marc",
    "7. Fruit marc spirit": "7-fruit-marc-spirit",
    "8. Raisin spirit or raisin brandy": "8-raisin-spirit-or-raisin-brandy",
    "9. Fruit spirit": "9-fruit-spirit",
    "10. Cider spirit and perry spirit": "10-cider-spirit-and-perry-spirit",
    "11. Honey spirit": "11-honey-spirit",
    "12. Hefebrand or lees spirit": "12-hefebrand-or-lees-spirit",
    "13. Bierbrand or eau de vie de bière": "13-bierbrand-or-eau-de-vie-de-biere",
    "14. Topinambur or Jerusalem artichoke spirit": "14-topinambur-or-jerusalem-artichoke-spirit",
    "15. Vodka": "15-vodka",
    "16. Spirit (preceded by the name of the fruit) obtained by maceration and distillation": "16-spirit-preceded-by-the-name-of-the-fruit-obtained-by-maceration-and-distillation",
    "17. Geist (with the name of the fruit or the raw material used)": "17-geist-with-the-name-of-the-fruit-or-the-raw-material-used",
    "18. Gentian": "18-gentian",
    "19. Juniper-flavoured spirit drinks": "19-juniper-flavoured-spirit-drinks",
    "20. Gin": "20-gin",
    "21. Distilled gin": "21-distilled-gin",
    "22. London gin": "22-london-gin",
    "23. Caraway-flavoured spirit drinks": "23-caraway-flavoured-spirit-drinks",
    "24. Akvavit or aquavit": "24-akvavit-or-aquavit",
    "25. Aniseed-flavoured spirit drinks": "25-aniseed-flavoured-spirit-drinks",
    "26. Pastis": "26-pastis",
    "27. Pastis de Marseille": "27-pastis-de-marseille",
    "28. Anis": "28-anis",
    "29. Distilled anis": "29-distilled-anis",
    "30. Bitter-tasting spirit drinks or bitter": "30-bitter-tasting-spirit-drinks-or-bitter",
    "31. Flavoured vodka": "31-flavoured-vodka",
    "32. Liqueur": "32-liqueur",
    "33. Crème de (followed by the name of a fruit or the raw material used)": "33-creme-de-followed-by-the-name-of-a-fruit-or-the-raw-material-used",
    "34. Crème de cassis": "34-creme-de-cassis",
    "35. Guignolet": "35-guignolet",
    "36. Punch au rhum": "36-punch-au-rhum",
    "37. Sloe gin": "37-sloe-gin",
    "37a. Sloe-aromatised spirit drink or Pacharán": "37a-sloe-aromatised-spirit-drink-or-pacharan",
    "38. Sambuca": "38-sambuca",
    "39. Maraschino, Marrasquino or Maraskino": "39-maraschino-marrasquino-or-maraskino",
    "40. Nocino": "40-nocino",
    "41. Egg liqueur or advocaat or avocat or advokat": "41-egg-liqueur-or-advocaat-or-avocat-or-advokat",
    "42. Liqueur with egg": "42-liqueur-with-egg",
    "43. Mistrà": "43-mistra",
    "44. Väkevä glögi or spritglögg": "44-vakeva-glogi-or-spritglogg",
    "45. Berenburg or Beerenburg": "45-berenburg-or-beerenburg",
    "46. Honey or mead nectar": "46-honey-or-mead-nectar",
    "47. Other spirit drinks": "47-other-spirit-drinks",
    "99. Other spirit drink": "99-other-spirit-drink",
    "1. Aromatised wine": "1-aromatised-wine",
    "2. Aromatised wine-based drink": "2-aromatised-wine-based-drink",
    "Traditional term":	"traditional-term"
}

let protectionTypeMap = {
    "Protected Geographical Indication (PGI)": "protected-geographical-indication-pgi",
    "Protected Designation of Origin (PDO)": "protected-designation-of-origin-pdo",
    "Traditional Specialities Guaranteed (TSG)": "traditional-speciality-guaranteed-tsg",
    "Traditional Term": "traditional-term",
    "Geographical indication (GI)": "geographical-indication-gi",
    "Name protected by international treaty": "name-protected-by-international-treaty"
}

let countryMap = {
    "United Kingdom": "united-kingdom",
    "Andorra": "andorra",
    "Armenia": "armenia",
    "Australia": "australia",
    "Austria": "austria",
    "Belgium": "belgium",
    "Brazil": "brazil",
    "Bulgaria": "bulgaria",
    "Cambodia": "cambodia",
    "Chile": "chile",
    "China": "china",
    "Colombia": "colombia",
    "Costa Rica": "costa-rica",
    "Croatia": "croatia",
    "Cyprus": "cyprus",
    "Czechia": "czechia",
    "Denmark": "denmark",
    "Dominican Republic": "dominican-republic",
    "El Salvador": "el-salvador",
    "Ecuador": "ecuador",
    "Estonia": "estonia",
    "Finland": "finland",
    "France": "france",
    "Germany": "germany",
    "Greece": "greece",
    "Guatemala": "guatemala",
    "Guatemala": "guatemala",
    "Guinea": "guinea",
    "Guyana": "guyana",
    "Hungary": "hungary",
    "India": "india",
    "Indonesia": "indonesia",
    "Ireland": "ireland",
    "Italy": "italy",
    "Japan": "japan",
    "Latvia": "latvia",
    "Liechtenstein": "liechtenstein",
    "Lithuania": "lithuania",
    "Luxembourg": "luxembourg",
    "Malta": "malta",
    "Mexico": "mexico",
    "Mongolia": "mongolia",
    "Morocco": "morocco",
    "Netherlands": "netherlands",
    "Norway": "norway",
    "Panama": "panama",
    "Peru": "peru",
    "Poland": "poland",
    "Portugal": "portugal",
    "Romania": "romania",
    "Russia": "russia",
    "Serbia": "serbia",
    "Slovakia": "slovakia",
    "Slovenia": "slovenia",
    "South Africa": "south-africa",
    "South Korea": "south-korea",
    "Spain": "spain",
    "Sri Lanka": "sri-lanka",
    "Sweden": "sweden",
    "Switzerland": "switzerland",
    "Thailand": "thailand",
    "Trinidad and Tobago": "trinidad-and-tobago",
    "Turkey": "turkey",
    "United States": "united-states",
    "Vietnam": "vietnam"
}

let grapevineCategoryMap = {
    "Wine": "wine",
    "New wine still in fermentation": "new-wine-still-in-fermentation",
    "Liqueur wine": "liqueur-wine",
    "Sparkling wine": "sparkling-wine",
    "Quality sparkling wine": "quality-sparkling-wine",
    "Quality aromatic sparkling wine": "quality-aromatic-sparkling-wine",
    "Aerated sparkling wine": "aerated-sparkling-wine",
    "Semi-sparkling wine": "semi-sparkling-wine",
    "Aerated semi-sparkling wine": "aerated-semi-sparkling-wine",
    "Grape must": "grape-must",
    "Partially fermented grape must": "partially-fermented-grape-must",
    "Partially fermented grape must extracted from raisined grapes": "partially-fermented-grape-must-extracted-from-raisined-grapes",
    "Concentrated grape must": "concentrated-grape-must",
    "Rectified concentrated grape must": "rectified-concentrated-grape-must",
    "Wine from raisined grapes": "wine-from-raisined-grapes",
    "Wine of overripe grapes": "wine-of-overripe-grapes",
    "Wine vinegar": "wine-vinegar"
}

let termTypeMap = {
    "Description of product characteristic": "description-of-product-characteristic",
    "In place of PDO/PGI": "in-place-of-pdo-pgi"
}

let languageMap = {
    "Bulgarian": "bulgarian",
    "Croatian": "croatian",
    "Czech": "czech",
    "Danish": "danish",
    "Dutch": "dutch",
    "English": "english",
    "Estonian": "estonian",
    "Finnish": "finnish",
    "French": "french",
    "German": "german",
    "Greek": "greek",
    "Hungarian": "hungarian",
    "Irish": "irish",
    "Italian": "italian",
    "Latin": "latin",
    "Latvian": "latvian",
    "Lithuanian": "lithuanian",
    "Maltese": "maltese",
    "Polish": "polish",
    "Portuguese": "portuguese",
    "Romanian": "romanian",
    "Slovak": "slovak",
    "Slovenian": "slovenian",
    "Spanish": "spanish",
    "Swedish": "swedish"
}

let reasonForProtectionMap = {
    "UK geographical indication from before 2021": "uk-gi-before-2021",
    "EU agreement": "eu-agreement",
    "UK trade agreement": "uk-trade-agreement",
    "Application to UK scheme from 2021": "uk-gi-after-2021"
}
