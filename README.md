# Fearchy

## Summary
Explanation available in the jQuery.fearch.js 

## Prerequisites
1. jQuery v2.1.4 
2. jQuery.Datables v1.10.9
3. Bootstrap v3.3.5
4. Handlebars 4.0.2 

## Use Guide
1. Load the sample file on the browser
2. The search screen will have 3 options (search text input, search source selection and a search button)
3. perform your search (make sure to select multiple sources)
4. the result of the search will be presented below the search form in tabs
5. Click on each tab to see their results
6. click on the title link to be redirected to the detail screen at the source site
7. Enjoy!

## Adding more sources
1. in the config.source object, copy+paste an existing object.
2. specify / change the parameters (More details available in the js file)
3. Copy paste the searchGoogle function and rename it based on the config.source.<yoursourceid>.method value 
4. Copy paste the cacheGoogleResults function, rename it as per your need (make sure the function created prior (item 3) calls to this function)
5. Copy paste the getResultsFromGoogle function, rename it as per your need (make sure the function created prior (item 4) calls to this function)
6. Make sure the contents of the function (item 5) are set correctly and the results are retrieved from the source
   
