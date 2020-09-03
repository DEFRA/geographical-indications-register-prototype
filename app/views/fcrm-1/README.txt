
# FCRM prototype
==============================

## Where things are stored
------------------------------

Page parts (eg filters) are kept in /fcrm-1/includes/.

Filter lists are in /fcrm-1/data/lists.
The code for this is constructed from the FCRM spreadsheet on Google docs:
https://docs.google.com/spreadsheets/d/1k_LeEV8n2Lz2-hhT7Y7yV9Q3vsSzLW0kDPE6EBnYyJY/edit#gid=0

IMPORTANT: If you re-make the filters, remove the comma after the last item in each filter list

The page contents are stored in the spreadsheet CONTENT-DATA tab:
https://docs.google.com/spreadsheets/d/1k_LeEV8n2Lz2-hhT7Y7yV9Q3vsSzLW0kDPE6EBnYyJY/edit#gid=1250238902
This is converted to JSON using:
https://www.convertcsv.com/csv-to-json.htm
and stored in /fcrm-1/data/reports/reports.json

Landing page is mainly HTML and is in /fcrm-1/landing-page-guide.html

The search and search results are in /fcrm-1/search-results_spec_pub-default.html

The details page (actual content) is in /fcrm-1/product-details-default.html

The actual search and routing happens in /fcrm-1.js


## Limitations of v1
------------------------------

Search terms only works on title.

Only the first 'Building and maintaining FCERM assets' will work.
The content pages are only 'tagged' with one tag each. That means that filtering works, but only produces one page per option in 'Building and maintaining FCERM assets'.
