/*
 * @Library Fearchy  
 * @Version v1.3.234.2253 
 * @Author: Subathiran
 * @Email: vyzvam@gmail.com
 * 
 * @Summary
 * Fearchy is a federated search engine, that can be configured to include
 * multiple search sources. The library then will aumatically include the source within its context for searching.
 *
 */

var Fearchy = {

    /*
     * Library configuration variables
     * @param {string} form - Search form's id
     * @param {string} fearchText - Search text input's id
     * @param {string} fearchButton - Search submit button's id
     * @param {string} fearchableButton - Checkbox selection button
     * @param {string} waitSpinner - Image tag for loading spinner
     * @param {string} noCoverPage - Image used when there are no book cover pages found
     * @param {string} resultSection - DIV id of result section
     * @param {string} tabNav - div id of tabbed navigation bar
     * @param {string} tabContent - div id of tabbed content
     * @param {object} fearchContainer - contains object array of fearchable elements and object array of tab items
     * @param {string array} quotes - list of movie quotes
     * @param {object} sources - contains object array, api / resource information
     */

    config: {
        form: '#fearch-form',
        fearchText: '#fearch-text',
        fearchButton: '#fearch-button',
        fearchableButton: 'fearchable-button',
        waitSpinner: '<img src="http://www.autotires.gr/skin/frontend/default/default/images/autotires-loading.gif" height="16px" width="16px">',
        noCoverImage: 'http://www.clipartbest.com/cliparts/pi5/ey8/pi5ey8XiB.png',
        resultSection: '#body-fearch-results',
        tabNav: '#result-tab-nav',
        tabContent: '#result-tab',
        fearchContainer: null,

        quotes: [
            'What is thy bidding?',
            'Go ahead, make my day.',
            'How do you like them apples?',
            'Get To The Choppa!',
            'Beam me up, Scotty!',
            'Make it so...',
            'Set phasers to stun..',
            'You win again gravity!',
            'Good news everyone!'
        ],

        sources: {
            google: {
                id: 'google',
                isToUse: true,
                checkBoxValue: 'check-google',
                label: 'Google Search',
                apiUrl: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=',
                htmlTemplate: 'google-list.html',
                method: 'searchGoogle'
            }
            , googleBooks: {
                id: 'googleBooks',
                isToUse: true,
                checkBoxValue: 'check-google-books',
                label: 'Google Books',
                apiUrl: 'https://www.googleapis.com/books/v1/volumes?q=',
                htmlTemplate: 'google-books-list.html',
                method: 'searchGoogleBooks'
            }
        }
    },


    /*
     * Initializes the Library
     * @param {object} config - config overrider
     */
    initiate: function (config) {

        $.extend(this.config, config);
        this.setDefault();
        this.bindEvents();

    },

    /*
     * Prepares the library for the DOM
     */
    setDefault: function () {
        this.prepareFearchOptions();
        this.setRandomQuote();
    },

    /*
     * Attaches events to the DOM
     */
    bindEvents: function () {
        $doc = $(document);
        $doc.on('click', this.config.fearchButton, $.proxy(this.startFearchRoutine, this));
    },

    /*
     * Attaches events to the DOM
     */
    setRandomQuote: function() {
        $(this.config.fearchText).attr({ placeholder: this.getRandomQuote() });
    },

    /*
     * Getting random quotes
     * @returns {string} quote string
     */
    getRandomQuote: function() {
        var num = Math.floor(Math.random() * (( this.config.quotes.length - 0) + 1 ) + 0);        
        return this.config.quotes[num];
    },

    /*
     * loads the search source option in the checkbox selection
     */
    prepareFearchOptions: function() {

        var source = $('#fearchables-template').html(),
            template = Handlebars.compile(source),
            fearchables = [];
        ;

        $.each(this.config.sources, function() { fearchables.push(this); });
        $('#fearchables-input').html(template({'results':fearchables}));

    },

    /*
     * Starts the federated search process upon form submission
     */
    startFearchRoutine: function(e) {
        this.projectFearchPanel();
        e.preventDefault();
    },


    /*
     * Shows the ResultSection and performs the searches
     */
    projectFearchPanel: function (e) {

        var self = this,
            config = self.config
        ;

        self.setResultPanelToShow();

        self.prepareResultTabs().then(function () { self.performFearch(); });

    },
   
    /*
     * Show the result section
     */
    setResultPanelToShow: function() {
        var config = this.config;
        $(config.tabNav).html('');
        $(config.tabContent).html('');
        $(config.resultSection).show();
    },

    /*
     * Prepares each of the result tabs
     * @returns {object} a deferred promise
     */
    prepareResultTabs: function () {

        var tabItems = [],
            $deferred = new $.Deferred(),
            contentTemplate = '',
            sources = this.config.sources;
        ;

        this.config.fearchContainer = {};

        $.each(sources, function() {
            if ($('#' + this.checkBoxValue).is(':checked')) {
                tabItems.push({ key: this.id, value: this.label, partial: this.htmlTemplate });
            }
        });

        this.config.fearchContainer.tabItems = tabItems;
        this.config.fearchContainer.tableAPIs = {};

        $.each(this.config.fearchContainer.tabItems, function (index, obj) {

            $('#result-tab-nav')
                .append('<li role="presentation" id="' + obj.key + '-tablink"><a href="#' + obj.key + '-pane" aria-controls="' + obj.value + '" role="tab" data-toggle="tab">' + obj.value + ' <span></span></a></li>');

            $('#result-tab')
                .append('<div id="' + obj.key + '-pane" data-value="' + obj.key + '" role="tabpanel" class="tab-pane"></div>');

            $('#result-tab-nav a:first').tab('show');                                

        });

        this.loadAllTabContent().then(function () {

            $(".nav-tabs a").click(function(e){
                $(this).tab('show');
                e.preventDefault();
            });

            $deferred.resolve();
        });

        return $deferred.promise();
    },

    /*
     * Loads the content of each result tab
     * 
     * @returns {object} a deferred promise
     * 
     */
    loadAllTabContent: function () {

        var loadedCounter = 0,
            tabItems = this.config.fearchContainer.tabItems,
            tableAPIs = this.config.fearchContainer.tableAPIs,
            $deferred = new $.Deferred()
        ;

        $.each(tabItems, function (index, obj) {

            $(document).find('#' + obj.key + '-pane').load(obj.partial, function () {

                tableAPIs[obj.key] = Fearchy.initDataTableAPIDefault('#' + obj.key + '-result-table');
                loadedCounter += 1;
                if (tabItems.length === loadedCounter) { $deferred.resolve(); }

            });
        });

        return $deferred.promise();
    },

    /*
     * Initiates multiple search
     */
    performFearch: function() {
        var self = this,
            config = self.config,
            searchField = $(config.fearchText).val(),
            $resultHeader = $(document).find(config.tabNav),
            methodToCall = undefined // Alert! Dynamic call to the function belonging to the source object
        ;

        $(config.fearchContainer.tabItems).each(function (index, item) {

            $resultHeader.find('#' + item.key + '-tablink').find('span')
                        .removeClass()
                        .html(config.waitSpinner)
            ;

            methodToCall = self[config.sources[item.key].method];
            methodToCall(index, item, searchField);

        });
    },

    /*
     * Shows result from google search
     * @param {number} index - index of the object from the caller
     * @param {object} item - tab parameters
     * @param {string} searchValue - search keyword
     */
    searchGoogle: function (index, item, searchValue) {

        var self = Fearchy;

        $resultHeader = $(document).find('#result-tab-nav');

        self.cacheGoogleResults(item.key, searchValue).then(function (results) {

            var tableAPI = self.config.fearchContainer.tableAPIs[item.key];

            $resultHeader.find('#' + item.key + '-tablink').find('span')
                        .html('')
                        .addClass('label label-warning')
                        .text(results.length);

            $.each(results, function() {
                tableAPI.row.add([
                    '<a target="_blank" href="' + this.url + '">' + this.title + '</a>',
                    this.content
                ]).draw();           
            });
        });
    },

    /*
     * caches the result from source search
     * 
     * @param {string} sourceId - id or the object name of the source
     * @param {string} searchValue - search keyword
     * @returns {object} a deferred promise
     */
    cacheGoogleResults: function (sourceId, searchValue) {

        var $deferred = new $.Deferred(),
            startNumber = 1,
            resolveCounterLimit = 20,
            resolveCounter = 0,
            results = []
        ;

        for (var ii = 0; ii < resolveCounterLimit; ii++) {

            Fearchy.getResultsFromGoogle(sourceId, searchValue, startNumber)
            .done(function (data, textStatus, jqXHR) {

                if (data.responseData == null) {
                
                    $deferred.resolve(results);                    
                
                } else {
                
                    results = results.concat(data.responseData.results);
                
                }                
            })
            .fail(function (jqXHR, textStatus, errorThrown) { })
            .always(function () {
                resolveCounter += 1;

                if (resolveCounter >= resolveCounterLimit) {
                    $deferred.resolve(results);
                }

                startNumber += 4;
            });


        }

        return $deferred.promise();
    },

    /*
     * Calls the source API and gets the result
     * 
     * @param {string} sourceId - id or the object name of the source
     * @param {string} searchValue - search keyword
     * @param {number} startNumber - the starting number of search at source
     * @returns {object} a deferred promise
     */
    getResultsFromGoogle: function (sourceId, searchValue, startNumber) {
        var self = this;

        return $.ajax(
        {
            type: 'GET',
            dataType: 'jsonp',
            url: self.config.sources[sourceId].apiUrl + searchValue + '&start=' + startNumber + '&callback=?'
        }).promise();
    },

    /*
     * Shows result from source search
     * 
     * @param {number} index - index of the object from the caller
     * @param {object} item - tab parameters
     * @param {string} searchValue - search keyword
     */
    searchGoogleBooks: function (index, item, searchValue) {

        var self = Fearchy;

        console.log(this);
        $resultHeader = $(document).find('#result-tab-nav');

        self.cacheGoogleBooksResults(item.key, searchValue).then(function (results) {

            var tableAPI = self.config.fearchContainer.tableAPIs[item.key];

            $resultHeader.find('#' + item.key + '-tablink').find('span')
                        .html('')
                        .addClass('label label-warning')
                        .text(results.length);

            
            $.each(results, function() {

                var bookDetails = this.volumeInfo,
                    bookImgSource = (bookDetails.imageLinks == undefined) ? self.config.noCoverImage : bookDetails.imageLinks.smallThumbnail,
                    bookCover = '<img src="' + bookImgSource + '" width="50px" height="70px" />',
                    author = (bookDetails.authors == undefined) ? 'Not available' : bookDetails.authors[0]
                ;

                tableAPI.row.add([
                  bookCover,
                  '<a href="' + bookDetails.infoLink + '" target="_blank">' + bookDetails.title + '</a>',
                  author
                ]).draw();           
            });


        });
    },

    /*
     * caches the result from source search
     * 
     * @param {string} sourceId - id or the object name of the source
     * @param {string} searchValue - search keyword
     * @returns {object} a deferred promise
     */

    cacheGoogleBooksResults: function (sourceId, searchValue) {

        var $deferred = new $.Deferred(),
            startNumber = 1,
            resolveCounterLimit = 2,
            resolveCounter = 0,
            results = []
        ;

        for (var ii = 0; ii < resolveCounterLimit; ii++) {

            Fearchy.getResultsFromGoogleBooks(sourceId, searchValue, startNumber)
            .done(function (data, textStatus, jqXHR) {

                if (data.items.length < 1) {
                
                    $deferred.resolve(results);                    
                
                } else {
                
                    results = results.concat(data.items);
               
                }                
            })
            .fail(function (jqXHR, textStatus, errorThrown) { })
            .always(function () {
                resolveCounter += 1;

                if (resolveCounter >= resolveCounterLimit) {
                    $deferred.resolve(results);
                }

                startNumber += 4;
            });


        }

        return $deferred.promise();
    },

    /*
     * Shows result from source search
     * 
     * @param {string} sourceId - id or the object name of the source
     * @param {number} index - index of the object from the caller
     * @param {object} item - tab parameters
     * @param {string} searchValue - search keyword
     */
    getResultsFromGoogleBooks: function (sourceId, searchValue, startNumber) {
        var self = this;

        return $.ajax(
        {
            type: 'GET',
            dataType: 'jsonp',
            url: self.config.sources[sourceId].apiUrl + searchValue + '&startIndex=' + startNumber + '&maxResults=40'
        }).promise();
    },

    /*
     * Applies the jQuery.DataTables library on a DOM element
     * 
     * @param {string} targetClass - an id or class of element(s)
     * @returns {object} returns the DataTable object
     */
     initDataTableAPIDefault: function (targetClass) {
        return $(targetClass).DataTable({
            bSort: false,
            scrollCollapse: false,
            oLanguage: {
                sSearch: "Filter: "
            }
        });
    }
};
