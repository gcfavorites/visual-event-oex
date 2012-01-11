// ==UserScript==
// ==/UserScript==

/**
 * Observer script
 *
 * Adding listeners to every loaded page
 *
 * @author      Victor Grischeno <victor.grischenko@gmail.com>
 * @copyright   Victor Grischeno <victor.grischenko@gmail.com>
 * @license     GPLv2
 */

(function(){
/**
 * This code is from cleanPages extension by QuHno
 * (https://addons.opera.com/ru/addons/extensions/details/cleanpages/)
 */
opera.extension.onmessage = function(e) {
    var dataArray = e.data.split('|');
    if(window.top == window.self && e.data && JSON.parse(dataArray[0]) == window.decodeURI(window.location.href.replace(window.location.hash, ''))){
        switch(dataArray[1])
        {
            case 'VisualEvent-1.0':
                enableVisualEvent();
                break;
            default:
                break;
        }
    }
}; // end of onMessage listener

function enableVisualEvent() {
    if( typeof window.VisualEvent!='undefined' ) {
        if ( window.VisualEvent.instance !== null ) {
            window.VisualEvent.close();
        }
        else {
            new window.VisualEvent();
        }
    }
    else {
        loadVisualEvent(window, document);
    }
}; // end of function enableVisualEvent()

/**
 * Loading of Visual Event library
 */
function loadVisualEvent(window, document) {
    if ( typeof window.VisualEvent_Loader == 'undefined' ) {

        /**
        * VisualEvent_Loader is a class which will provide pre-loading of Javascript and CSS files
        * for VisualEvent based on the environment the script is running in (for example if jQuery is
        * already available or not).
        *
        *  @class VisualEvent_Loader
        *  @constructor
        *
        *  @example
        *      new VisualEvent_Loader();
        */
        window.VisualEvent_Loader = function ()
        {
            /* Sanity check */
            if ( ! this instanceof window.VisualEvent_Loader ) {
                alert( "VisualEvent loader warning: Must be initialised with the 'new' keyword." );
                return;
            }

            /**
            * Settings object containing the settings information for the instance
            *  @namespace
            */
            this.s = {
                /**
                * Flag to indicate if loading has finished or not. False until the required JS classes are
                * found to be available.
                *  @type     boolean
                *  @default  false
                */
                "loadingComplete": false
            };

            /**
            * DOM elements used by the instance
            *  @namespace
            */
            this.dom = {
                /**
                * Visual Label to show the end user that Visual Event is being loaded
                *  @type     element
                *  @default  div
                */
                "loading": document.createElement('div')
            };

            this._construct();
        };


        window.VisualEvent_Loader.prototype = {
            /**
            * Constrctor - show a loading element to the end user and then load up the various files
            * that are needed
            *  @returns {undefined}
            *  @private
            */
            "_construct": function ()
            {
                var that = this,
                    loading,
                    style;

                /* Check to see if already loaded */
                if ( this.s.loadingComplete === true ) {
                    return 0;
                }

                /* Show a label to the user to let them know that Visual Event is currently loading */
                loading = this.dom.loading;
                loading.setAttribute( 'id', 'EventLoading' );
                loading.appendChild( document.createTextNode( 'Loading Visual Event...' ) );

                style = loading.style;
                style.position = 'fixed';
                style.bottom = '0';
                style.left = '0';
                style.color = 'white';
                style.padding = '5px 10px';
                style.fontSize = '11px';
                style.fontFamily = '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
                style.zIndex = '55999';
                style.backgroundColor = '#93a8cf';
                document.body.insertBefore( loading, document.body.childNodes[0] );

                /* Store a static flag to let the VisualEvent instance know if jQuery was already available on
                * the page or not - used in the "close" method
                */
                window.VisualEvent_Loader.jQueryPreLoaded = (typeof window.jQuery == 'undefined') ? false : true;

                /* Start the polling for ready */
                if ( typeof window.VisualEvent == 'object' ) {
                    this._pollReady();
                    return; // Don't need to load any files if its already loaded
                }
                else {
                    setTimeout( function () {
                        that._pollReady();
                    }, 1000 );
                }

                /* Load the required files - note that the token /vendors/VisualEvent/VisualEvent-1325838720 is replaced by the build
                * script with the location of the combined Visual Event file (i.e. with the parsers included
                */
                initCss();
                //this._loadFile( '/vendors/VisualEvent/VisualEvent-1325838720/css/VisualEvent.css', 'css' );
                if ( typeof window.jQuery == 'undefined' ) {
                    alert('Load jQuery');
                    //this._loadFile( '/vendors/VisualEvent/VisualEvent-1325838720/js/VisualEvent-jQuery.js', 'js' );
                }
                else {
                    alert('Load Visual Event1');
                    initVisualEvent(window.jQuery);
                    //this._loadFile( '/vendors/VisualEvent/VisualEvent-1325838720/js/VisualEvent.js', 'js' ));
                }
            },


            /**
            * Load a new file into the DOM, and have it processed based on its type. This can be a
            * Javascript file, a CSS file or an image
            *  @param {string} file URL to the file to load
            *  @param {string} type The file type. Can be "css", "js" or "image"
            *  @returns {undefined}
            *  @private
            */
            "_loadFile": function ( file, type )
            {
                var n, img;

                if ( type == 'css' ) {
                    n = document.createElement('link');
                    n.type = 'text/css';
                    n.rel = 'stylesheet';
                    n.href = file;
                    n.media = 'screen';
                    document.getElementsByTagName('head')[0].appendChild( n );
                }
                else if ( type == 'image' ) {
                    img = new Image( 1, 1 );
                    img.src = file;
                }
                else {
                    n = document.createElement( 'script' );
                    n.setAttribute( 'language', 'JavaScript' );
                    n.setAttribute( 'src', file );
                    n.setAttribute( 'charset', 'utf8' );
                    document.body.appendChild( n );
                }
            },


            /**
            * Check if VisualEvent components (specifically VisualEvent itself and the SyntaxHighlighter)
            * have been loaded and are available. If not, wait a little while and try again.
            *  @returns {undefined}
            *  @private
            */
            "_pollReady": function ()
            {
                var that = this,
                    tmp;

                if ( typeof window.VisualEvent == 'function' &&
                        typeof window.VisualEventSyntaxHighlighter == 'object' )
                {
                    this._complete();
                }
                else {
                    setTimeout( function() {
                        that._pollReady();
                    }, 100 );
                }
            },


            /**
            * Loading is complete, initialise VisualEvent
            *  @returns {undefined}
            *  @private
            */
            "_complete": function ()
            {
                var that = this;

                this.s.loadingComplete = true;

                tmp = new window.VisualEvent(); // jsLint need to assign it to a var

                /* Tidy up our display */
                document.body.removeChild( this.dom.loading );
            }
        };

        window.VisualEvent_Loader.jQueryPreLoaded = false;
    } /* /typeof VisualEvent_Loader */


    /*
    * If visual event is already defined then we can toggle the display - giving the effect of
    * starting it up and shutting it down when using the loader. Note it's preferable to do this in
    * the bookmarklet code (and is now - but is it for backwards compatability)
    */
    var tmp;
    if ( typeof window.VisualEvent != 'undefined' )
    {
        if ( window.VisualEvent.instance !== null ) {
            window.VisualEvent.close();
        }
        else {
            tmp = new window.VisualEvent();
        }
    }
    else {
        tmp = new window.VisualEvent_Loader();
    }

}; // end of function loadVisualEvent()


/**
 * Initialization of Virtual event styles
 */
function initCss() {
    var css = '#Event_Label{font:11px "lucida grande",verdana,arial,helvetica,sans-serif;background:#7c94c0;padding:5px 10px 5px 5px;z-index:55999}#Event_Label,#Event_Help{position:fixed;bottom:0}#Event_Label,#Event_Help,#Event_Display{left:0}#Event_Label,#Event_Label>span,.Event_syntaxhighlighter .gutter .line.highlighted,.Event_syntaxhighlighter .toolbar,.Event_syntaxhighlighter .toolbar a{color:white !important}#Event_Label,#Event_Display div.Event_info{z-index:55002}#Event_Label span.Event_LabelHelp,#Event_Label span.Event_LabelClose{background:#93a8cf;width:17px;border:1px solid #627ba9;color:#4b6698;margin-right:5px}#Event_Label span.Event_LabelHelp,#Event_Label span.Event_LabelClose,#Event_Label span.Event_LabelBy{display:inline-block}#Event_Label span.Event_LabelHelp,#Event_Label span.Event_LabelClose,#Event_Help p.Event_HelpClose{text-align:center}#Event_Label span.Event_LabelHelp,#Event_Label span.Event_LabelClose,#Event_Lightbox ul li,#Event_Lightbox div.Event_NodeRemove,#Event_Lightbox #Event_Trigger,.datatables_ref:hover,.Event_syntaxhighlighter .dtapi:hover{cursor:pointer;*cursor:hand}#Event_Label span.Event_LabelHelp:hover,#Event_Label span.Event_LabelClose:hover{background:#aebfdd}#Event_Label span.Event_LabelHelp,#Event_Label span.Event_LabelBy{margin-right:10px}#Event_Label span.Event_LabelBy,#Event_Lightbox div.Event_NodeRemove{font-size:10px}#Event_Label span.Event_LabelBy a{color:#eee}#Event_Help{font:14px "lucida grande",verdana,arial,helvetica,sans-serif;background:#ddd;right:0}#Event_Help,#Event_Display{top:0;z-index:55001}#Event_Help,#Event_Help h1,#Event_Help p{color:#222}#Event_Help div.Event_HelpInner{width:800px;margin:30px auto 0 auto}#Event_Help h1{font-size:18px;border-bottom:1px solid #ccc}#Event_Help p{margin:1em 0}#Event_Help table{width:90%;margin:0 auto}#Event_Help p.Event_HelpClose{margin-top:2em}#Event_Lightbox{background:#f8f8f8;display:none;color:#111;width:660px;z-index:55003;text-align:left;border-radius:10px;-moz-border-radius:10px;-webkit-border-radius:10px;font-size:12px;direction:ltr;border:4px solid #7c94c0;-moz-box-shadow:3px 3px 5px #111;-webkit-box-shadow:3px 3px 5px #111;box-shadow:3px 3px 5px #111}#Event_Lightbox,#Event_Display{position:absolute}#Event_Lightbox,#Event_Lightbox ul li,#Event_Lightbox div.Event_Code,#Event_Lightbox div.Event_NodeName{padding:5px}#Event_Lightbox ul{list-style-type:none;padding:0}#Event_Lightbox ul,#Event_Lightbox div.Event_Code p{margin:0}#Event_Lightbox ul li{display:block;width:90px}#Event_Lightbox ul li.Event_EventSelected,#Event_Lightbox div.Event_Code{background:#eee}#Event_Lightbox div.Event_NodeRemove{float:right}#Event_Lightbox div.Event_NodeRemove,#Event_Lightbox #Event_Trigger{color:#4e6ca3}#Event_Lightbox div.Event_NodeRemove:hover,#Event_Lightbox #Event_Trigger:hover,.datatables_ref:hover,.Event_syntaxhighlighter .dtapi:hover{text-decoration:underline}#Event_Lightbox div.Event_Nav,#Event_Lightbox div.Event_Code,#Event_Display div.Event_info{float:left}#Event_Lightbox div.Event_Nav{width:100px}#Event_Lightbox div.Event_Code{width:550px}#Event_Lightbox div.Event_Code p{padding:0 0 12px 0}#Event_Display{background:rgba(0,0,0,0.2);height:100%;width:100%}#Event_Display div.Event_info{width:15px;height:15px;border:transparent 2px solid}#Event_Display div.Event_bg_blue{background:rgba(0,0,255,0.3);border:rgba(0,0,255,0.5) 2px solid}#Event_Display div.Event_bg_blue:hover{border:rgba(0,0,255,1) 2px solid}#Event_Display div.Event_bg_red{background:rgba(255,0,0,0.3);border:rgba(255,0,0,0.5) 2px solid}#Event_Display div.Event_bg_red:hover{border:rgba(255,0,0,1) 2px solid}#Event_Display div.Event_bg_yellow{background:rgba(0,255,0,0.3);border:rgba(0,255,0,0.5) 2px solid}#Event_Display div.Event_bg_yellow:hover{border:rgba(0,255,0,1) 2px solid}#Event_Display div.Event_bg_green{background:rgba(0,167,0,0.3);border:rgba(0,167,0,0.5) 2px solid}#Event_Display div.Event_bg_green:hover{border:rgba(0,167,0,1) 2px solid}#Event_Display div.Event_bg_purple{background:rgba(167,0,145,0.3);border:rgba(167,0,145,0.5) 2px solid}#Event_Display div.Event_bg_purple:hover{border:rgba(167,0,145,1) 2px solid}#Event_Display div.Event_bg_orange{background:rgba(201,145,35,0.3);border:rgba(201,145,35,0.5) 2px solid}#Event_Display div.Event_bg_orange:hover{border:rgba(201,145,35,1) 2px solid}#Event_Display div.Event_bg_black{background:rgba(190,190,190,0.3);border:rgba(190,190,190,0.5) 2px solid}#Event_Display div.Event_bg_black:hover{border:rgba(190,190,190,1) 2px solid}.Event_syntaxhighlighter textarea,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter table thead,.Event_syntaxhighlighter table tbody,.Event_syntaxhighlighter table tr,.Event_syntaxhighlighter table td,.Event_syntaxhighlighter table,.Event_syntaxhighlighter code,.Event_syntaxhighlighter div,.Event_syntaxhighlighter a{font:1em !important "consolas","monaco","bitstream vera sans mono","courier new",courier,monospace !important normal !important normal !important /1.1em !important;-moz-border-radius:0 0 0 0 !important;-webkit-border-radius:0 0 0 0 !important;border:0 !important;bottom:auto !important;float:none !important;left:auto !important;margin:0 !important;outline:0 !important;right:auto !important;top:auto !important;vertical-align:baseline !important;box-sizing:content-box !important;min-height:inherit !important;min-height:auto !important}.Event_syntaxhighlighter textarea,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter table thead,.Event_syntaxhighlighter table tbody,.Event_syntaxhighlighter table tr,.Event_syntaxhighlighter table td,.Event_syntaxhighlighter table,.Event_syntaxhighlighter code,.Event_syntaxhighlighter div,.Event_syntaxhighlighter a,.Event_syntaxhighlighter.printing .line.highlighted.alt2 .content,.Event_syntaxhighlighter.printing .line.highlighted.alt1 .content,.Event_syntaxhighlighter.printing .line.highlighted .number,.Event_syntaxhighlighter.printing .line.alt2 .content,.Event_syntaxhighlighter.printing .line.alt1 .content{background:none !important}.Event_syntaxhighlighter textarea,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter table thead,.Event_syntaxhighlighter table tbody,.Event_syntaxhighlighter table tr,.Event_syntaxhighlighter table td,.Event_syntaxhighlighter table,.Event_syntaxhighlighter code,.Event_syntaxhighlighter div,.Event_syntaxhighlighter a,.Event_syntaxhighlighter.collapsed .toolbar{height:auto !important;position:static !important;width:auto !important}.Event_syntaxhighlighter textarea,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter table thead,.Event_syntaxhighlighter table tbody,.Event_syntaxhighlighter table tr,.Event_syntaxhighlighter table td,.Event_syntaxhighlighter table,.Event_syntaxhighlighter code,.Event_syntaxhighlighter div,.Event_syntaxhighlighter a,.Event_syntaxhighlighter.collapsed{overflow:visible !important}.Event_syntaxhighlighter textarea,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter table thead,.Event_syntaxhighlighter table tbody,.Event_syntaxhighlighter table tr,.Event_syntaxhighlighter table td,.Event_syntaxhighlighter table,.Event_syntaxhighlighter code,.Event_syntaxhighlighter div,.Event_syntaxhighlighter a,.Event_syntaxhighlighter.collapsed .toolbar span a{padding:0 !important}.Event_syntaxhighlighter textarea,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter table thead,.Event_syntaxhighlighter table tbody,.Event_syntaxhighlighter table tr,.Event_syntaxhighlighter table td,.Event_syntaxhighlighter table,.Event_syntaxhighlighter code,.Event_syntaxhighlighter div,.Event_syntaxhighlighter a,.Event_syntaxhighlighter table caption{text-align:left !important}.Event_syntaxhighlighter,.Event_syntaxhighlighter table,.Event_syntaxhighlighter table td.code,.Event_syntaxhighlighter table td.code .container textarea{width:100% !important}.Event_syntaxhighlighter{margin:1em 0 1em 0 !important;font-size:13px !important}.Event_syntaxhighlighter,.Event_syntaxhighlighter table td.code .container{position:relative !important}.Event_syntaxhighlighter,.Event_syntaxhighlighter{overflow:auto !important}.Event_syntaxhighlighter,.Event_syntaxhighlighter.collapsed .toolbar{font-size:1em !important}.Event_syntaxhighlighter.source,.Event_syntaxhighlighter table td.code .container textarea{overflow:hidden !important}.Event_syntaxhighlighter .bold,.Event_syntaxhighlighter.printing .keyword,.Event_syntaxhighlighter.printing .script,.Event_syntaxhighlighter .script,.Event_syntaxhighlighter .keyword{font-weight:bold !important}.Event_syntaxhighlighter .italic{font-style:italic !important}.Event_syntaxhighlighter .line,.Event_syntaxhighlighter table td.code .container textarea{white-space:pre !important}.Event_syntaxhighlighter table caption{padding:.5em 0 0.5em 1em !important}.Event_syntaxhighlighter table td.code .container textarea{box-sizing:border-box !important;left:0 !important;top:0 !important;height:100% !important;padding-left:1em !important}.Event_syntaxhighlighter table td.code .container textarea,.Event_syntaxhighlighter .toolbar{position:absolute !important}.Event_syntaxhighlighter table td.code .container textarea,.Event_syntaxhighlighter.printing .line .content,.Event_syntaxhighlighter .toolbar{border:none !important}.Event_syntaxhighlighter table td.code .container textarea,.Event_syntaxhighlighter.collapsed .toolbar{background:white !important}.Event_syntaxhighlighter table td.gutter .line{text-align:right !important;padding:2px 0.5em 2px 1em !important}.Event_syntaxhighlighter table td.code .line{padding:2px 1em !important}.Event_syntaxhighlighter.nogutter td.code .line,.Event_syntaxhighlighter.nogutter td.code .container textarea{padding-left:0em !important}.Event_syntaxhighlighter.show,.Event_syntaxhighlighter .toolbar a{display:block !important}.Event_syntaxhighlighter.collapsed table,.Event_syntaxhighlighter.collapsed .toolbar span a,.Event_syntaxhighlighter .toolbar a.expandSource,.Event_syntaxhighlighter.printing .toolbar{display:none !important}.Event_syntaxhighlighter.collapsed .toolbar{padding:0.1em 0.8em 0em 0.8em !important;border:1px solid #4e6ca3 !important}.Event_syntaxhighlighter.collapsed .toolbar span,.Event_syntaxhighlighter.collapsed .toolbar span a.expandSource,.Event_syntaxhighlighter .toolbar span.title{display:inline !important}.Event_syntaxhighlighter.collapsed .toolbar span{margin-right:1em !important}.Event_syntaxhighlighter .toolbar{right:1px !important;top:1px !important;font-size:10px !important;z-index:10 !important}.Event_syntaxhighlighter .toolbar a{text-align:center !important;padding-top:1px !important;font:100%/1.45em "Lucida Grande",Verdana,Arial,Helvetica,sans-serif !important;background:#4e6ca3 !important;float:right !important;padding:2px 5px !important;clear:both}.Event_syntaxhighlighter .toolbar a,.Event_syntaxhighlighter.printing a{text-decoration:none !important}.Event_syntaxhighlighter.ie{font-size:.9em !important;padding:1px 0 1px 0 !important}.Event_syntaxhighlighter.ie .toolbar{line-height:8px !important}.Event_syntaxhighlighter.ie .toolbar a{padding-top:0 !important}.Event_syntaxhighlighter.printing .line .number{color:#bbb !important}.Event_syntaxhighlighter.printing .line .content,.Event_syntaxhighlighter.printing .plain a,.Event_syntaxhighlighter.printing .plain,.Event_syntaxhighlighter.printing .break a,.Event_syntaxhighlighter.printing .break,.Event_syntaxhighlighter .line.highlighted.number,.Event_syntaxhighlighter table caption,.Event_syntaxhighlighter .plain a,.Event_syntaxhighlighter .plain{color:black !important}.Event_syntaxhighlighter.printing .comments a,.Event_syntaxhighlighter.printing .comments,.Event_syntaxhighlighter .comments a,.Event_syntaxhighlighter .comments{color:#008200 !important}.Event_syntaxhighlighter.printing .string a,.Event_syntaxhighlighter.printing .string,.Event_syntaxhighlighter.collapsed .toolbar,.Event_syntaxhighlighter.collapsed .toolbar a,.Event_syntaxhighlighter .string a,.Event_syntaxhighlighter .string{color:blue !important}.Event_syntaxhighlighter.printing .keyword,.Event_syntaxhighlighter .keyword,.Event_syntaxhighlighter .script{color:#069 !important}.Event_syntaxhighlighter.printing .preprocessor,.Event_syntaxhighlighter.printing .color1 a,.Event_syntaxhighlighter.printing .color1,.Event_syntaxhighlighter .preprocessor,.Event_syntaxhighlighter .color1 a,.Event_syntaxhighlighter .color1{color:gray !important}.Event_syntaxhighlighter.printing .variable,.Event_syntaxhighlighter .variable{color:#a70 !important}.Event_syntaxhighlighter.printing .value,.Event_syntaxhighlighter .value{color:#090 !important}.Event_syntaxhighlighter.printing .functions,.Event_syntaxhighlighter.printing .color2 a,.Event_syntaxhighlighter.printing .color2,.Event_syntaxhighlighter .functions,.Event_syntaxhighlighter .color2 a,.Event_syntaxhighlighter .color2{color:#ff1493 !important}.Event_syntaxhighlighter.printing .constants,.Event_syntaxhighlighter .constants{color:#06c !important}.Event_syntaxhighlighter.printing .color3 a,.Event_syntaxhighlighter.printing .color3,.Event_syntaxhighlighter.collapsed .toolbar a:hover,.Event_syntaxhighlighter .color3 a,.Event_syntaxhighlighter .color3{color:red !important}.Event_syntaxhighlighter,.Event_syntaxhighlighter  .gutter .line.alt2,.Event_syntaxhighlighter .gutter .line.alt1{background:transparent !important}.Event_syntaxhighlighter .line.alt1{background:white !important}.Event_syntaxhighlighter .line.alt2{background:#f8f8f8 !important}.Event_syntaxhighlighter .line.highlighted.alt2,.Event_syntaxhighlighter .line.highlighted.alt1{background:#e0e0e0 !important}.Event_syntaxhighlighter .gutter div{color:#5c5c5c !important;width:20px !important}.odd .Event_syntaxhighlighter  .gutter .line.alt2,.odd .Event_syntaxhighlighter .gutter .line.alt1{background:#f2f2f2 !important}.Event_syntaxhighlighter .gutter .line{border-right:3px solid #4e6ca3 !important}.Event_syntaxhighlighter .gutter .line.highlighted{background:#4e6ca3 !important}.Event_syntaxhighlighter .toolbar a:hover{color:#b7c5df !important;background:#39568b !important}.Event_syntaxhighlighter .script{background:none !important}.Event_syntaxhighlighter .dtapi{color:#069}';

    var n = document.createElement('style');
    n.type = 'text/css';
    var rules = document.createTextNode(css);

    if(n.styleSheet) {
        n.styleSheet.cssText = rules.nodeValue;
    }
    else {
        n.appendChild(rules);
    }
    document.getElementsByTagName('head')[0].appendChild(n);
}; // end of function initCss()

function initVisualEvent() {

    /**
    * SyntaxHighlighter
    * http://alexgorbatchev.com/SyntaxHighlighter
    *
    * SyntaxHighlighter is donationware. If you are using it, please donate.
    * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
    *
    * @version
    * 3.0.83 (July 02 2010)
    *
    * @copyright
    * Copyright (C) 2004-2010 Alex Gorbatchev.
    *
    * @license
    * Dual licensed under the MIT and GPL licenses.
    */
    if(typeof XRegExp == 'undefined') {
    var XRegExp;if(XRegExp){throw Error("can't load XRegExp twice in the same frame")}(function(){function o(a,b,c){if(Array.prototype.indexOf){return a.indexOf(b,c)}for(var d=c||0;d<a.length;d++){if(a[d]===b){return d}}return-1}function n(a,b,c,f){var g=e.length,h,i,j;d=true;try{while(g--){j=e[g];if(c&j.scope&&(!j.trigger||j.trigger.call(f))){j.pattern.lastIndex=b;i=j.pattern.exec(a);if(i&&i.index===b){h={output:j.handler.call(f,i,c),match:i};break}}}}catch(k){throw k}finally{d=false}return h}function m(a){return(a.global?"g":"")+(a.ignoreCase?"i":"")+(a.multiline?"m":"")+(a.extended?"x":"")+(a.sticky?"y":"")}function l(a,b){if(!XRegExp.isRegExp(a)){throw TypeError("type RegExp expected")}var c=a._xregexp;a=XRegExp(a.source,m(a)+(b||""));if(c){a._xregexp={source:c.source,captureNames:c.captureNames?c.captureNames.slice(0):null}}return a}XRegExp=function(a,c){var e=[],g=XRegExp.OUTSIDE_CLASS,h=0,i,j,m,o,p;if(XRegExp.isRegExp(a)){if(c!==undefined){throw TypeError("can't supply flags when constructing one RegExp from another")}return l(a)}if(d){throw Error("can't call the XRegExp constructor within token definition functions")}c=c||"";i={hasNamedCapture:false,captureNames:[],hasFlag:function(a){return c.indexOf(a)>-1},setFlag:function(a){c+=a}};while(h<a.length){j=n(a,h,g,i);if(j){e.push(j.output);h+=j.match[0].length||1}else{if(m=f.exec.call(k[g],a.slice(h))){e.push(m[0]);h+=m[0].length}else{o=a.charAt(h);if(o==="["){g=XRegExp.INSIDE_CLASS}else{if(o==="]"){g=XRegExp.OUTSIDE_CLASS}}e.push(o);h++}}}p=RegExp(e.join(""),f.replace.call(c,b,""));p._xregexp={source:a,captureNames:i.hasNamedCapture?i.captureNames:null};return p};XRegExp.version="1.5.0";XRegExp.INSIDE_CLASS=1;XRegExp.OUTSIDE_CLASS=2;var a=/\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g,b=/[^gimy]+|([\s\S])(?=[\s\S]*\1)/g,c=/^(?:[?*+]|{\d+(?:,\d*)?})\??/,d=false,e=[],f={exec:RegExp.prototype.exec,test:RegExp.prototype.test,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split},g=f.exec.call(/()??/,"")[1]===undefined,h=function(){var a=/^/g;f.test.call(a,"");return!a.lastIndex}(),i=function(){var a=/x/g;f.replace.call("x",a,"");return!a.lastIndex}(),j=RegExp.prototype.sticky!==undefined,k={};k[XRegExp.INSIDE_CLASS]=/^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;k[XRegExp.OUTSIDE_CLASS]=/^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;XRegExp.addToken=function(a,b,c,d){e.push({pattern:l(a,"g"+(j?"y":"")),handler:b,scope:c||XRegExp.OUTSIDE_CLASS,trigger:d||null})};XRegExp.cache=function(a,b){var c=a+"/"+(b||"");return XRegExp.cache[c]||(XRegExp.cache[c]=XRegExp(a,b))};XRegExp.copyAsGlobal=function(a){return l(a,"g")};XRegExp.escape=function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")};XRegExp.execAt=function(a,b,c,d){b=l(b,"g"+(d&&j?"y":""));b.lastIndex=c=c||0;var e=b.exec(a);if(d){return e&&e.index===c?e:null}else{return e}};XRegExp.freezeTokens=function(){XRegExp.addToken=function(){throw Error("can't run addToken after freezeTokens")}};XRegExp.isRegExp=function(a){return Object.prototype.toString.call(a)==="[object RegExp]"};XRegExp.iterate=function(a,b,c,d){var e=l(b,"g"),f=-1,g;while(g=e.exec(a)){c.call(d,g,++f,a,e);if(e.lastIndex===g.index){e.lastIndex++}}if(b.global){b.lastIndex=0}};XRegExp.matchChain=function(a,b){return function c(a,d){var e=b[d].regex?b[d]:{regex:b[d]},f=l(e.regex,"g"),g=[],h;for(h=0;h<a.length;h++){XRegExp.iterate(a[h],f,function(a){g.push(e.backref?a[e.backref]||"":a[0])})}return d===b.length-1||!g.length?g:c(g,d+1)}([a],0)};RegExp.prototype.apply=function(a,b){return this.exec(b[0])};RegExp.prototype.call=function(a,b){return this.exec(b)};RegExp.prototype.exec=function(a){var b=f.exec.apply(this,arguments),c,d;if(b){if(!g&&b.length>1&&o(b,"")>-1){d=RegExp(this.source,f.replace.call(m(this),"g",""));f.replace.call(a.slice(b.index),d,function(){for(var a=1;a<arguments.length-2;a++){if(arguments[a]===undefined){b[a]=undefined}}})}if(this._xregexp&&this._xregexp.captureNames){for(var e=1;e<b.length;e++){c=this._xregexp.captureNames[e-1];if(c){b[c]=b[e]}}}if(!h&&this.global&&!b[0].length&&this.lastIndex>b.index){this.lastIndex--}}return b};if(!h){RegExp.prototype.test=function(a){var b=f.exec.call(this,a);if(b&&this.global&&!b[0].length&&this.lastIndex>b.index){this.lastIndex--}return!!b}}String.prototype.match=function(a){if(!XRegExp.isRegExp(a)){a=RegExp(a)}if(a.global){var b=f.match.apply(this,arguments);a.lastIndex=0;return b}return a.exec(this)};String.prototype.replace=function(b,c){var d=XRegExp.isRegExp(b),e,g,h;if(d&&typeof c.valueOf()==="string"&&c.indexOf("${")===-1&&i){return f.replace.apply(this,arguments)}if(!d){b=b+""}else{if(b._xregexp){e=b._xregexp.captureNames}}if(typeof c==="function"){g=f.replace.call(this,b,function(){if(e){arguments[0]=new String(arguments[0]);for(var a=0;a<e.length;a++){if(e[a]){arguments[0][e[a]]=arguments[a+1]}}}if(d&&b.global){b.lastIndex=arguments[arguments.length-2]+arguments[0].length}return c.apply(null,arguments)})}else{h=this+"";g=f.replace.call(h,b,function(){var b=arguments;return f.replace.call(c,a,function(a,c,d){if(c){switch(c){case"$":return"$";case"&":return b[0];case"`":return b[b.length-1].slice(0,b[b.length-2]);case"'":return b[b.length-1].slice(b[b.length-2]+b[0].length);default:var f="";c=+c;if(!c){return a}while(c>b.length-3){f=String.prototype.slice.call(c,-1)+f;c=Math.floor(c/10)}return(c?b[c]||"":"$")+f}}else{var g=+d;if(g<=b.length-3){return b[g]}g=e?o(e,d):-1;return g>-1?b[g+1]:a}})})}if(d&&b.global){b.lastIndex=0}return g};String.prototype.split=function(a,b){if(!XRegExp.isRegExp(a)){return f.split.apply(this,arguments)}var c=this+"",d=[],e=0,g,h;if(b===undefined||+b<0){b=Infinity}else{b=Math.floor(+b);if(!b){return[]}}a=XRegExp.copyAsGlobal(a);while(g=a.exec(c)){if(a.lastIndex>e){d.push(c.slice(e,g.index));if(g.length>1&&g.index<c.length){Array.prototype.push.apply(d,g.slice(1))}h=g[0].length;e=a.lastIndex;if(d.length>=b){break}}if(a.lastIndex===g.index){a.lastIndex++}}if(e===c.length){if(!f.test.call(a,"")||h){d.push("")}}else{d.push(c.slice(e))}return d.length>b?d.slice(0,b):d};XRegExp.addToken(/\(\?#[^)]*\)/,function(a){return f.test.call(c,a.input.slice(a.index+a[0].length))?"":"(?:)"});XRegExp.addToken(/\((?!\?)/,function(){this.captureNames.push(null);return"("});XRegExp.addToken(/\(\?<([$\w]+)>/,function(a){this.captureNames.push(a[1]);this.hasNamedCapture=true;return"("});XRegExp.addToken(/\\k<([\w$]+)>/,function(a){var b=o(this.captureNames,a[1]);return b>-1?"\\"+(b+1)+(isNaN(a.input.charAt(a.index+a[0].length))?"":"(?:)"):a[0]});XRegExp.addToken(/\[\^?]/,function(a){return a[0]==="[]"?"\\b\\B":"[\\s\\S]"});XRegExp.addToken(/^\(\?([imsx]+)\)/,function(a){this.setFlag(a[1]);return""});XRegExp.addToken(/(?:\s+|#.*)+/,function(a){return f.test.call(c,a.input.slice(a.index+a[0].length))?"":"(?:)"},XRegExp.OUTSIDE_CLASS,function(){return this.hasFlag("x")});XRegExp.addToken(/\./,function(){return"[\\s\\S]"},XRegExp.OUTSIDE_CLASS,function(){return this.hasFlag("s")})})();
    }

    var VisualEventSyntaxHighlighter=function(){function J(a){var b=a.target,e=l(b,".Event_syntaxhighlighter"),f=l(b,".container"),g=document.createElement("textarea"),i;if(!f||!e||k(f,"textarea"))return;i=h(e.id);c(e,"source");var j=f.childNodes,m=[];for(var n=0;n<j.length;n++)m.push(j[n].innerText||j[n].textContent);m=m.join("\r");g.appendChild(document.createTextNode(m));f.appendChild(g);g.focus();g.select();r(g,"blur",function(a){g.parentNode.removeChild(g);d(e,"source")})}function I(a){var b="<![CDATA[",c="]]>",d=C(a),e=false,f=b.length,g=c.length;if(d.indexOf(b)==0){d=d.substring(f);e=true}var h=d.length;if(d.indexOf(c)==h-g){d=d.substring(0,h-g);e=true}return e?d:a}function H(){var a=document.getElementsByTagName("script"),b=[];for(var c=0;c<a.length;c++)if(a[c].type=="syntaxhighlighter")b.push(a[c]);return b}function G(b){var c=/(.*)((>|<).*)/;return b.replace(a.regexLib.url,function(a){var b="",d=null;if(d=c.exec(a)){a=d[1];b=d[2]}return'<a href="'+a+'">'+a+"</a>"+b})}function F(b,c){function d(a,b){return a[0]}var e=0,f=null,g=[],h=c.func?c.func:d;while((f=c.regex.exec(b))!=null){var i=h(f,c);if(typeof i=="string")i=[new a.Match(i,f.index,c.css)];g=g.concat(i)}return g}function E(a,b){if(a.index<b.index)return-1;else if(a.index>b.index)return 1;else{if(a.length<b.length)return-1;else if(a.length>b.length)return 1}return 0}function D(a){var b=f(B(a)),c=new Array,d=/^\s*/,e=1e3;for(var g=0;g<b.length&&e>0;g++){var h=b[g];if(C(h).length==0)continue;var i=d.exec(h);if(i==null)return a;e=Math.min(i[0].length,e)}if(e>0)for(var g=0;g<b.length;g++)b[g]=b[g].substr(e);return b.join("\n")}function C(a){return a.replace(/^\s+|\s+$/g,"")}function B(b){var c=/<br\s*\/?>|<br\s*\/?>/gi;if(a.config.bloggerMode==true)b=b.replace(c,"\n");if(a.config.stripBrs==true)b=b.replace(c,"");return b}function A(a,b){function h(a,b,c){return a.substr(0,b)+e.substr(0,c)+a.substr(b+1,a.length)}var c=f(a),d="\t",e="";for(var g=0;g<50;g++)e+="                    ";a=u(a,function(a){if(a.indexOf(d)==-1)return a;var c=0;while((c=a.indexOf(d))!=-1){var e=b-c%b;a=h(a,c,e)}return a});return a}function z(a,b){var c="";for(var d=0;d<b;d++)c+=" ";return a.replace(/\t/g,c)}function y(a,b){var c=a.toString();while(c.length<b)c="0"+c;return c}function x(b,c){if(b==null||b.length==0||b=="\n")return b;b=b.replace(/</g,"<");b=b.replace(/ {2,}/g,function(b){var c="";for(var d=0;d<b.length-1;d++)c+=a.config.space;return c+" "});if(c!=null)b=u(b,function(a){if(a.length==0)return"";var b="";a=a.replace(/^( | )+/,function(a){b=a;return""});if(a.length==0)return b;return b+'<code class="'+c+'">'+a+"</code>"});return b}function w(a){var b,c={},d=new XRegExp("^\\[(?<values>(.*?))\\]$"),e=new XRegExp("(?<name>[\\w-]+)"+"\\s*:\\s*"+"(?<value>"+"[\\w-%#]+|"+"\\[.*?\\]|"+'".*?"|'+"'.*?'"+")\\s*;?","g");while((b=e.exec(a))!=null){var f=b.value.replace(/^['"]|['"]$/g,"");if(f!=null&&d.test(f)){var g=d.exec(f);f=g.values.length>0?g.values.split(/\s*,\s*/):[]}c[b.name]=f}return c}function v(a){return a.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g,"")}function u(a,b){var c=f(a);for(var d=0;d<c.length;d++)c[d]=b(c[d],d);return c.join("\n")}function t(b,c){var d=a.vars.discoveredBrushes,e=null;if(d==null){d={};for(var f in a.brushes){var g=a.brushes[f],h=g.aliases;if(h==null)continue;g.brushName=f.toLowerCase();for(var i=0;i<h.length;i++)d[h[i]]=f}a.vars.discoveredBrushes=d}e=a.brushes[d[b]];if(e==null&&c!=false)s(a.config.strings.noBrush+b);return e}function s(b){window.alert(a.config.strings.alert+b)}function r(a,b,c,d){function e(a){a=a||window.event;if(!a.target){a.target=a.srcElement;a.preventDefault=function(){this.returnValue=false}}c.call(d||window,a)}if(a.attachEvent){a.attachEvent("on"+b,e)}else{a.addEventListener(b,e,false)}}function q(a,b,c,d,e){var f=(screen.width-c)/2,g=(screen.height-d)/2;e+=", left="+f+", top="+g+", width="+c+", height="+d;e=e.replace(/^,/,"");var h=window.open(a,b,e);h.focus();return h}function p(a){var b={"true":true,"false":false}[a];return b==null?a:b}function o(a,b){var c={},d;for(d in a)c[d]=a[d];for(d in b)c[d]=b[d];return c}function n(a){return(a||"")+Math.round(Math.random()*1e6).toString()}function m(a,b,c){c=Math.max(c||0,0);for(var d=c;d<a.length;d++)if(a[d]==b)return d;return-1}function l(a,b){return k(a,b,true)}function k(a,b,c){if(a==null)return null;var d=c!=true?a.childNodes:[a.parentNode],e={"#":"id",".":"className"}[b.substr(0,1)]||"nodeName",f,g;f=e!="nodeName"?b.substr(1):b.toUpperCase();if((a[e]||"").indexOf(f)!=-1)return a;for(var h=0;d&&h<d.length&&g==null;h++)g=k(d[h],b,c);return g}function j(b){a.vars.highlighters[g(b.id)]=b}function i(a){return document.getElementById(g(a))}function h(b){return a.vars.highlighters[g(b)]}function g(a){var b="highlighter_";return a.indexOf(b)==0?a:b+a}function f(a){return a.split("\n")}function e(a){var b=[];for(var c=0;c<a.length;c++)b.push(a[c]);return b}function d(a,b){a.className=a.className.replace(b,"")}function c(a,c){if(!b(a,c))a.className+=" "+c}function b(a,b){return a.className.indexOf(b)!=-1}if(typeof require!="undefined"&&typeof XRegExp=="undefined"){XRegExp=require("XRegExp").XRegExp}var a={defaults:{"class-name":"","first-line":1,"pad-line-numbers":false,highlight:null,title:null,"smart-tabs":true,"tab-size":4,gutter:true,toolbar:true,"quick-code":true,collapse:false,"auto-links":true,light:false,"html-script":false},config:{space:" ",useScriptTags:true,bloggerMode:false,stripBrs:false,tagName:"pre",strings:{expandSource:"expand source",help:"?",jsbin:"Run in JS Bin",alert:"SyntaxHighlighter\n\n",noBrush:"Can't find brush for: ",brushNotHtmlScript:"Brush wasn't configured for html-script option: ",aboutDialog:'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>About SyntaxHighlighter</title></head><body style="font-family:Geneva,Arial,Helvetica,sans-serif;background-color:#fff;color:#000;font-size:1em;text-align:center;"><div style="text-align:center;margin-top:1.5em;"><div style="font-size:xx-large;">SyntaxHighlighter</div><div style="font-size:.75em;margin-bottom:3em;"><div>version 3.0.83 (July 02 2010)</div><div><a href="http://alexgorbatchev.com/SyntaxHighlighter" target="_blank" style="color:#005896">http://alexgorbatchev.com/SyntaxHighlighter</a></div><div>JavaScript code syntax highlighter.</div><div>Copyright 2004-2010 Alex Gorbatchev.</div></div><div>If you like this script, please <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=2930402" style="color:#005896">donate</a> to <br/>keep development active!</div></div></body></html>'}},vars:{discoveredBrushes:null,highlighters:{}},brushes:{},regexLib:{multiLineCComments:/\/\*[\s\S]*?\*\//gm,singleLineCComments:/\/\/.*$/gm,singleLinePerlComments:/#.*$/gm,doubleQuotedString:/"([^\\"\n]|\\.)*"/g,singleQuotedString:/'([^\\'\n]|\\.)*'/g,multiLineDoubleQuotedString:new XRegExp('"([^\\\\"]|\\\\.)*"',"gs"),multiLineSingleQuotedString:new XRegExp("'([^\\\\']|\\\\.)*'","gs"),xmlComments:/(<|<)!--[\s\S]*?--(>|>)/gm,url:/\w+:\/\/[\w-.\/?%&=:@;]*/g,phpScriptTags:{left:/(<|<)\?=?/g,right:/\?(>|>)/g},aspScriptTags:{left:/(<|<)%=?/g,right:/%(>|>)/g},scriptScriptTags:{left:/(<|<)\s*script.*?(>|>)/gi,right:/(<|<)\/\s*script\s*(>|>)/gi}},toolbar:{getHtml:function(b){function f(b,c){return a.toolbar.getButtonHtml(b,c,a.config.strings[c])}var c='<div class="toolbar">',d=a.toolbar.items,e=d.list;for(var g=0;g<e.length;g++)c+=(d[e[g]].getHtml||f)(b,e[g]);c+="</div>";return c},getButtonHtml:function(a,b,c){return'<span><a href="#" class="toolbar_item'+" command_"+b+" "+b+'">'+c+"</a></span>"},handler:function(b){function e(a){var b=new RegExp(a+"_(\\w+)"),c=b.exec(d);return c?c[1]:null}var c=b.target,d=c.className||"";var f=h(l(c,".Event_syntaxhighlighter").id),g=e("command");if(f&&g)a.toolbar.items[g].execute(f);b.preventDefault()},items:{list:["expandSource"/*,"jsbin"*/,"help"],expandSource:{getHtml:function(b){if(b.getParam("collapse")!=true)return"";var c=b.getParam("title");return a.toolbar.getButtonHtml(b,"expandSource",c?c:a.config.strings.expandSource)},execute:function(a){var b=i(a.id);d(b,"collapsed")}},help:{execute:function(b){var c=q("","_blank",500,250,"scrollbars=0"),d=c.document;d.write(a.config.strings.aboutDialog);d.close();c.focus()}},jsbin:{execute:function(a){var b=document.createElement("form");b.method="POST";b.action="http://live.datatables.net";b.style.display="none";var c=document.createElement("textarea");c.name="js";c.value=a.code;b.appendChild(c);document.body.appendChild(b);b.submit()}}}},findElements:function(b,c){var d=c?[c]:e(document.getElementsByTagName(a.config.tagName)),f=a.config,g=[];if(f.useScriptTags)d=d.concat(H());if(d.length===0)return g;for(var h=0;h<d.length;h++){var i={target:d[h],params:o(b,w(d[h].className))};if(i.params["brush"]==null)continue;g.push(i)}return g},highlight:function(b,c){var d=this.findElements(b,c),e="innerHTML",f=null,g=a.config;if(d.length===0)return;for(var h=0;h<d.length;h++){var c=d[h],i=c.target,j=c.params,k=j.brush,l;if(k==null)continue;if(j["html-script"]=="true"||a.defaults["html-script"]==true){f=new a.HtmlScript(k);k="htmlscript"}else{var m=t(k);if(m)f=new m;else continue}l=i[e];if(g.useScriptTags)l=I(l);if((i.title||"")!="")j.title=i.title;j["brush"]=k;f.init(j);c=f.getDiv(l);if((i.id||"")!="")c.id=i.id;i.parentNode.replaceChild(c,i)}},all:function(b){r(window,"load",function(){a.highlight(b)})}};a["all"]=a.all;a["highlight"]=a.highlight;a.Match=function(a,b,c){this.value=a;this.index=b;this.length=a.length;this.css=c;this.brushName=null};a.Match.prototype.toString=function(){return this.value};a.HtmlScript=function(b){function k(a,b){var e=a.code,f=[],g=d.regexList,h=a.index+a.left.length,i=d.htmlScript,k;for(var l=0;l<g.length;l++){k=F(e,g[l]);j(k,h);f=f.concat(k)}if(i.left!=null&&a.left!=null){k=F(a.left,i.left);j(k,a.index);f=f.concat(k)}if(i.right!=null&&a.right!=null){k=F(a.right,i.right);j(k,a.index+a[0].lastIndexOf(a.right));f=f.concat(k)}for(var m=0;m<f.length;m++)f[m].brushName=c.brushName;return f}function j(a,b){for(var c=0;c<a.length;c++)a[c].index+=b}var c=t(b),d,e=new a.brushes.Xml,f=null,g=this,h="getDiv getHtml init".split(" ");if(c==null)return;d=new c;for(var i=0;i<h.length;i++)(function(){var a=h[i];g[a]=function(){return e[a].apply(e,arguments)}})();if(d.htmlScript==null){s(a.config.strings.brushNotHtmlScript+b);return}e.regexList.push({regex:d.htmlScript.code,func:k})};a.Highlighter=function(){};a.Highlighter.prototype={getParam:function(a,b){var c=this.params[a];return p(c==null?b:c)},create:function(a){return document.createElement(a)},findMatches:function(a,b){var c=[];if(a!=null)for(var d=0;d<a.length;d++)if(typeof a[d]=="object")c=c.concat(F(b,a[d]));return this.removeNestedMatches(c.sort(E))},removeNestedMatches:function(a){for(var b=0;b<a.length;b++){if(a[b]===null)continue;var c=a[b],d=c.index+c.length;for(var e=b+1;e<a.length&&a[b]!==null;e++){var f=a[e];if(f===null)continue;else if(f.index>d)break;else if(f.index==c.index&&f.length>c.length)a[b]=null;else if(f.index>=c.index&&f.index<d)a[e]=null}}return a},figureOutLineNumbers:function(a){var b=[],c=parseInt(this.getParam("first-line"));u(a,function(a,d){b.push(d+c)});return b},isLineHighlighted:function(a){var b=this.getParam("highlight",[]);if(typeof b!="object"&&b.push==null)b=[b];return m(b,a.toString())!=-1},getLineHtml:function(a,b,c){var d=["line","number"+b,"index"+a,"alt"+(b%2==0?1:2).toString()];if(this.isLineHighlighted(b))d.push("highlighted");if(b==0)d.push("break");return'<div class="'+d.join(" ")+'">'+c+"</div>"},getLineNumbersHtml:function(b,c){var d="",e=f(b).length,g=parseInt(this.getParam("first-line")),h=this.getParam("pad-line-numbers");if(h==true)h=(g+e-1).toString().length;else if(isNaN(h)==true)h=0;for(var i=0;i<e;i++){var j=c?c[i]:g+i,b=j==0?a.config.space:y(j,h);d+=this.getLineHtml(i,j,b)}return d},getCodeLinesHtml:function(b,c){b=C(b);var d=f(b),e=this.getParam("pad-line-numbers"),g=parseInt(this.getParam("first-line")),b="",h=this.getParam("brush");for(var i=0;i<d.length;i++){var j=d[i],k=/^( |\s)+/.exec(j),l=null,m=c?c[i]:g+i;if(k!=null){l=k[0].toString();j=j.substr(l.length);l=l.replace(" ",a.config.space)}j=C(j);if(j.length==0)j=a.config.space;b+=this.getLineHtml(i,m,(l!=null?'<code class="'+h+' spaces">'+l+"</code>":"")+j)}return b},getTitleHtml:function(a){return a?"<caption>"+a+"</caption>":""},getMatchesHtml:function(a,b){function f(a){var b=a?a.brushName||e:e;return b?b+" ":""}var c=0,d="",e=this.getParam("brush","");for(var g=0;g<b.length;g++){var h=b[g],i;if(h===null||h.length===0)continue;i=f(h);d+=x(a.substr(c,h.index-c),i+"plain")+x(h.value,i+h.css);c=h.index+h.length+(h.offset||0)}d+=x(a.substr(c),f()+"plain");return d},getHtml:function(b){var c="",d=["Event_syntaxhighlighter"],e,f,h;if(this.getParam("light")==true)this.params.toolbar=this.params.gutter=false;className="Event_syntaxhighlighter";if(this.getParam("collapse")==true)d.push("collapsed");if((gutter=this.getParam("gutter"))==false)d.push("nogutter");d.push(this.getParam("class-name"));d.push(this.getParam("brush"));b=v(b).replace(/\r/g," ");e=this.getParam("tab-size");b=this.getParam("smart-tabs")==true?A(b,e):z(b,e);b=D(b);if(gutter)h=this.figureOutLineNumbers(b);f=this.findMatches(this.regexList,b);c=this.getMatchesHtml(b,f);c=this.getCodeLinesHtml(c,h);if(this.getParam("auto-links"))c=G(c);if(typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.match(/MSIE/))d.push("ie");c='<div id="'+g(this.id)+'" class="'+d.join(" ")+'">'+(this.getParam("toolbar")?a.toolbar.getHtml(this):"")+'<table border="0" cellpadding="0" cellspacing="0">'+this.getTitleHtml(this.getParam("title"))+"<tbody>"+"<tr>"+(gutter?'<td class="gutter">'+this.getLineNumbersHtml(b)+"</td>":"")+'<td class="code">'+'<div class="container">'+c+"</div>"+"</td>"+"</tr>"+"</tbody>"+"</table>"+"</div>";return c},getDiv:function(b){if(b===null)b="";this.code=b;var c=this.create("div");c.innerHTML=this.getHtml(b);if(this.getParam("toolbar"))r(k(c,".toolbar"),"click",a.toolbar.handler);if(this.getParam("quick-code"))r(k(c,".code"),"dblclick",J);return c},init:function(b){this.id=n();j(this);this.params=o(a.defaults,b||{});if(this.getParam("light")==true)this.params.toolbar=this.params.gutter=false},getKeywords:function(a){a=a.replace(/^\s+|\s+$/g,"").replace(/\s+/g,"|");return"\\b(?:"+a+")\\b"},forHtmlScript:function(a){this.htmlScript={left:{regex:a.left,css:"script"},right:{regex:a.right,css:"script"},code:new XRegExp("(?<left>"+a.left.source+")"+"(?<code>.*?)"+"(?<right>"+a.right.source+")","sgi")}}};return a}();typeof exports!="undefined"?exports["VisualEventSyntaxHighlighter"]=VisualEventSyntaxHighlighter:null
    /**
    * SyntaxHighlighter
    * http://alexgorbatchev.com/SyntaxHighlighter
    *
    * SyntaxHighlighter is donationware. If you are using it, please donate.
    * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
    *
    * @version
    * 3.0.83 (July 02 2010)
    *
    * @copyright
    * Copyright (C) 2004-2010 Alex Gorbatchev.
    *
    * @license
    * Dual licensed under the MIT and GPL licenses.
    */
    ;(function()
    {
        // CommonJS
        //typeof(require) != 'undefined' ? VisualEventSyntaxHighlighter = require('shCore').VisualEventSyntaxHighlighter : null;

        function Brush()
        {
            var keywords =  'break case catch continue ' +
                            'default delete do else false  ' +
                            'for function if in instanceof ' +
                            'new null return super switch ' +
                            'this throw true try typeof var while with'
                            ;
            var r = VisualEventSyntaxHighlighter.regexLib;

            this.regexList = [
                { regex: r.multiLineDoubleQuotedString,                 css: 'string' },            // double quoted strings
                { regex: r.multiLineSingleQuotedString,                 css: 'string' },            // single quoted strings
                { regex: r.singleLineCComments,                         css: 'comments' },          // one line comments
                { regex: r.multiLineCComments,                          css: 'comments' },          // multiline comments
                { regex: /\s*#.*/gm,                                    css: 'preprocessor' },      // preprocessor tags like #region and #endregion
                { regex: new RegExp(this.getKeywords(keywords), 'gm'),  css: 'keyword' }            // keywords
                ];

            this.forHtmlScript(r.scriptScriptTags);
        };

        Brush.prototype = new VisualEventSyntaxHighlighter.Highlighter();
        Brush.aliases   = ['js', 'jscript', 'javascript'];

        VisualEventSyntaxHighlighter.brushes.JScript = Brush;

        // CommonJS
        //typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
    })();
    /**
    * @summary     Visual Event
    * @description Visual Event - show Javascript events which have been attached to objects, and
    *              the event's associated function code, visually.
    * @file        VisualEvent_Loader.js
    * @author      Allan Jardine (www.sprymedia.co.uk)
    * @license     GPL v2
    * @contact     www.sprymedia.co.uk/contact
    *
    * @copyright Copyright 2007-2011 Allan Jardine.
    *
    * This source file is free software, under the GPL v2 license:
    *   http://www.gnu.org/licenses/gpl-2.0.html
    */

    (function(window, document, $){


    /**
    * Visual Event will show, visually, which DOM elements on a web-page have events attached to
    * them, information about those events and the code accossiated with each handler for the
    * event. It does this by parsing through the cache of Javascript libraries (as there is no DOM
    * method to get the information required), thus a major part of Visual Event are the library
    * parsers. A result of this is that universal display of events is not possible - there must
    * be a parser available.
    *
    * Visual Event's display is broken into four major areas:
    *   - Label - The information toolbar at the bottom of the window (fixed) showing Visual Event
    * controls (close and help), the name of the program and information about the events that have
    * been found on the page.
    *
    *   - Help - The help view is a completely blocking layer which shows information about Visual
    * Event and how to use it. A single click will remove the help layer and restore the standard
    * Visual Event view.
    *
    *   - Display - A layer which provides a background to Visual Event (thus when Visual Event is
    * active is it blocking to the web-page below it) and acts as a container for the boxes (DIVs)
    * which serve as a visual indicator that there is an event attached to the element below it
    * (sized to match the element with the event attached).
    *
    *   - Lightbox - The event information and code display of attached events.
    *
    * Note that currently there can only be one instance of Visual Event at a time, due to
    * practicality (no point in showing the same thing twice, at the same time) and the use of
    * element IDs in the script.
    *
    *  @class VisualEvent
    *  @constructor
    *
    *  @example
    *      new VisualEvent();
    */
    window.VisualEvent = function ()
    {
        // Sanity check
        if ( ! this instanceof VisualEvent ) {
            alert( "VisualEvent warning: Must be initialised with the 'new' keyword." );
            return;
        }

        // Only one instance of VisualEvent at a time, in the current running mode. So if there is a
        // current instance, shut it down first
        if ( VisualEvent.instance !== null ) {
            VisualEvent.instance.close();
        }
        VisualEvent.instance = this;


        /**
        * Settings object containing customisable information for the class instance
        * @namespace
        */
        this.s = {
            /**
            * Array of objects containing information about the nodes which have been found to have
            * events attached to them. Each object contains the following parameters:
            *   {element} node The DOM element in question
            *   {array} listeners Array of objects which with details about each of the events on this node
            *     {string} func Source of the event handler (from Function.toString())
            *     {string} source Library name / version
            *     {string} type Type of event (click, change, keyup etc)
            *     {boolean} removed Flag to indicate if the event has been removed (for API)
            *  @type     array
            *  @default  null
            */
            "elements": null,

            /**
            * setTimeout reference for delayed hiding of the lightbox layer
            *  @type     int
            *  @default  null
            *  @private
            */
            "mouseTimer": null,

            /**
            * Counter for the number of events which have been found from a JS library's cache, but
            * are not currently available in the document's DOM
            *  @type     int
            *  @default  null
            *  @private
            */
            "nonDomEvents": 0,

            /**
            * Array of objects holding information about each SCRIPT tag that is found in the DOM. Each
            * object contains the parameters:
            *   {string} src The URL of the script source (or inline string if no src attribute)
            *   {string} code The code (.text) from the script
            *  @type     array
            *  @default  []
            *  @private
            */
            "scripts": []
        };

        /**
        * DOM elements used by the class instance
        * @namespace
        */
        this.dom = {
            /**
            * Label layer - for showing that Visual Event is currently running and information and
            * controls, about and for this instance
            *  @type     element
            *  @default  See code
            */
            "label": $(
                '<div id="Event_Label">'+
                    '<span class="Event_LabelClose">x</span>'+
                    '<span class="Event_LabelHelp">?</span>'+
                    'Visual Event <span class="Event_LabelBy">by <a href="http://sprymedia.co.uk/">Allan Jardine</a>.</span>'+
                    '<span class="Event_LabelEvents"></span> events were found attached to '+
                    '<span class="Event_LabelNodes"></span> nodes. '+
                    '<span class="Event_LabelNonDom"></span> events were attached to elements not currently in the document.'+
                '</div>')[0],

            /**
            * Display layer - background layer and container for Visual Event visual node indicators
            *  @type     element
            *  @default  See code
            */
            "display": $('<div id="Event_Display"></div>')[0],

            /**
            * Lightbox layer - Template for information display about a given node, and the code for
            * a given event handler
            *  @type     element
            *  @default  See code
            */
            "lightbox": $(
                '<div id="Event_Lightbox">'+
                    '<div class="Event_NodeName">Node: <i></i>'+
                        '<div class="Event_NodeRemove">Remove from display</div>'+
                    '</div>'+
                    '<div>'+
                        '<div class="Event_Nav">'+
                            '<ul></ul>'+
                        '</div>'+
                    '</div>'+
                    '<div class="Event_Code"></div>'+
                '</div>')[0],

            /**
            * Help layer - information about Visual Event and how to use it
            *  @type     element
            *  @default  See code
            */
            "help": $(
                '<div id="Event_Help">'+
                    '<div class="Event_HelpInner">'+
                        '<h1>Visual Event help</h1>'+
                        '<p>Visual Event will show which elements on any given page have Javascript events attached '+
                            'to them, what those events are and the code associated with the events. In Webkit '+
                            'browsers and Opera, Visual Event will also indicate where the code in question was '+
                            'defined.</p>'+
                        '<p>Note that Visual Event is only able to show events for Javascript libraries for which '+
                            'it has a parser. This is currently: DOM0 events, Glow, jQuery, MooTools, Prototype and YUI2.</p>'+
                        '<p>Commands:</p>'+
                        '<table cellpadding="0" cellspacing="0" border="0">'+
                            '<tr>'+
                                '<td>Double click element with event</td>'+
                                '<td>Hide event indicator. Allows access to nodes underneath</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>Key: space</td>'+
                                '<td>Restore all events to be visible</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>Key: esc</td>'+
                                '<td>Quit out of Visual Event</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>Key: h</td>'+
                                '<td>Show / hide this help box</td>'+
                            '</tr>'+
                            '<tr>'+
                                '<td>Key: r</td>'+
                                '<td>Reload and display events on page</td>'+
                            '</tr>'+
                        '</table>'+
                        '<p>Visual Event is open source software (GPLv2). If you would like to contribute an '+
                            'enhancement, please fork the project on '+
                            '<a href="https://github.com/SpryMedia/VisualEvent">Github</a>!</p>'+
                        '<p class="Event_HelpClose">Click anywhere to close this help box.</p>'+
                    '</div>'+
                '</div>')[0],

            /**
            * Reference to the visual event node indicator - so we have a reference to what node we are
            * showing the lightbox information about
            *  @type     element
            *  @default  See code
            */
            "activeEventNode": null
        };

        this._construct();
    };


    VisualEvent.prototype = {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * API methods
        */

        /**
        * Shutdown Visual Event and return to the original page
        * @param {event} e Event object
        */
        "close": function ( e )
        {
            // Remove all events that we've added
            $('*').unbind('.VisualEvent');
            $(this.dom.display).remove();
            $(this.dom.label).remove();
            $(this.dom.help).remove();

            if ( typeof VisualEvent_Loader !== 'undefined' && !VisualEvent_Loader.jQueryPreLoaded ) {
                $.noConflict();
            }

            VisualEvent.instance = null;
        },


        /**
        * Reinitialise Visual Event (i.e. bring it up-to-date with any new events which might have
        *   been added
        */
        "reInit": function ()
        {
            $('*').unbind('.VisualEvent');
            $(this.dom.display).empty();
            $(this.dom.display).remove();
            $(this.dom.label).remove();
            $(this.dom.help).remove();

            this.s.elements.splice(0, this.s.elements.length);
            this.s.nonDomEvents = 0;

            this._construct();
        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Private methods
        */

        /**
        * Visual Event constructor
        *  @private
        */
        "_construct": function ()
        {
            var that = this;
            var i, iLen;
            var windowHeight = $(document).height();
            var windowWidth = $(document).width();

            /* Prep the DOM */
            this.dom.display.style.width = windowWidth+'px';
            this.dom.display.style.height = windowHeight+'px';

            document.body.appendChild( this.dom.display );
            document.body.appendChild( this.dom.lightbox );
            document.body.appendChild( this.dom.label );

            /* Event handlers */
            $(this.dom.lightbox).bind('mouseover.VisualEvent', function (e) {
                that._timerClear( e );
            } ).bind( 'mousemove.VisualEvent', function (e) {
                that._timerClear( e );
            } ).bind( 'mouseout.VisualEvent', function (e) {
                that._lightboxHide();
            } );

            $('div.Event_NodeRemove', this.dom.lightbox).bind('click.VisualEvent', function (e) {
                that.dom.activeEventNode.style.display = "none";
                that.dom.lightbox.style.display = "none";
            } );

            $(document).bind( 'keydown.VisualEvent', function( e ) {
                if ( e.which === 0 || e.which === 27 ) { // esc
                    that.close();
                }
                if ( e.which === 72 ) { // 'h'
                    if ( $(that.dom.help).filter(':visible').length === 0 ) {
                        that._help();
                    }
                    else {
                        that._hideHelp();
                    }
                }
                else if ( e.which === 32 ) { // space
                    $('div.EventLabel').css('display', 'block');
                    e.preventDefault();
                }
                else if ( e.which === 82 ) { // r
                    that.reInit();
                }
            } );

            /* Build the events list and display */
            this.s.elements = this._eventsLoad();
            for ( i=0, iLen=this.s.elements.length ; i<iLen ; i++ ) {
                this._eventElement( this.s.elements[i] );
            }

            this._renderLabel();

            /* Load the text of all the Javascript on the page so we can try to find source */
            this._scriptsLoad();
        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * User help
        */

        /**
        * Show the help box
        *  @private
        */
        "_help": function () {
            document.body.appendChild( this.dom.help );
        },


        /**
        * Hide hte help box
        *  @private
        */
        "_hideHelp": function () {
            document.body.removeChild( this.dom.help );
        },



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Javascript source handling
        */

        /**
        * Parse the DOM for script tags and store the Javascript that is found. For any scripts which
        * have a 'src' attribute, add them to a queue for Ajax loading and then start the queue running
        *  @private
        */
        "_scriptsLoad": function ()
        {
            // Don't load scripts again if they are already loaded
            if ( this.s.scripts.length > 0 ) {
                return;
            }

            var loadQueue = [];
            var scripts = document.getElementsByTagName('script');
            for ( var i=0, iLen=scripts.length ; i<iLen ; i++ ) {
                if ( scripts[i].src  && scripts[i].src !== "" ) {
                    if ( scripts[i].src.indexOf('VisualEvent') === -1 ) {
                        loadQueue.push( scripts[i].src );
                    }
                }
                else {
                    this.s.scripts.push( {
                        "src": "Inline script",
                        "code": scripts[i].text
                    } );
                }
            }

            this._scriptLoadQueue( loadQueue );
        },


        /**
        * Pull an item off the script loading queue and load it up by an Ajax return. When done, loop
        * back and load the next item off the queue, until all done.
        *  @private
        */
        "_scriptLoadQueue": function ( loadQueue )
        {
            /* Check if we still have anything to do or not */
            if ( loadQueue.length === 0 ) {
                return;
            }

            var that = this;
            var url = loadQueue.shift();

            $.ajax( {
                "dataType": 'text',
                "type": "GET",
                "url": url,
                "success": function (text) {
                    that.s.scripts.push( {
                        "src": url,
                        "code": text
                    } );
                    that._scriptLoadQueue( loadQueue );
                },
                "error": function () {
                    that._scriptLoadQueue( loadQueue );
                }
            } );
        },


        /**
        * Attempt to find the source location (file and line number) for a given function and
        * format a return string which is human readable explaining where the source might come from
        *  @param {string} func The function string to search for
        *  @returns {string} Formatted string with information about the source
        *  @private
        */
        "_scriptSource": function ( func )
        {
            var origin = "";
            var srcFiles = [];
            var i, iLen, a;

            // Webkit reformats the prototype for the function, so the whitespace might not match our
            // intended target. Remove the prototype - it means we are more likely to get a clash, but
            // don't see much choice if we want to do matching other than trying all variations
            if ( $.browser.webkit ) {
                func = $.trim( func.replace(/^(function.*?\))/, '') );
            }

            for ( i=0, iLen=this.s.scripts.length ; i<iLen ; i++ ) {
                if ( this.s.scripts[i].code.indexOf( func ) !== -1 ) {
                    a = this.s.scripts[i].code.split( func );
                    srcFiles.push( {
                        "src": this.s.scripts[i].src,
                        "line": a[0].split('\n').length
                    } );
                }
            }

            // Firefox reformats the functions from toString() rather than keeping the original format
            // so we'll never be able to find the original. Should we just return an empty string
            // for Firefox?

            if ( srcFiles.length === 0 ) {
                origin = "Function definition could not be found automatically<br/>";
            } else if ( srcFiles.length === 1 ) {
                origin = "Function defined on line "+srcFiles[0].line+
                    ' in <a href="'+srcFiles[0].src+'">'+this._scriptName(srcFiles[0].src)+'</a><br/>';
            } else {
                origin = "Function could originate in multiple locations:<br/>";
                for ( i=0, iLen=srcFiles.length ; i<iLen ; i++ ) {
                    origin += (i+1)+'. line '+srcFiles[0].line+
                        ' in <a href="'+srcFiles[0].src+'">'+this._scriptName(srcFiles[0].src)+'</a><br/>';
                }
            }

            return origin;
        },


        /**
        * Get the name of a file from a URL (i.e. the last part in a slash seperated string)
        *  @param {string} src URL to get the file name from
        *  @returns {string} File name
        *  @private
        */
        "_scriptName": function ( src )
        {
            var a = src.split('/');
            return a[ a.length-1 ];
        },



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Display
        */

        /**
        * Build the list of nodes that have events attached to them by going through all installed
        * parsers
        *  @returns {array} List of nodes with their associated events
        *  @private
        */
        "_eventsLoad": function ()
        {
            var i, iLen;
            var elements=[], libraryListeners;

            /* Gather the events from the supported libraries */
            for ( i=0, iLen=VisualEvent.parsers.length ; i<iLen ; i++ ) {
                // Given the millions of environments that the parsers will run in, it is quite possible one
                // will hit an error - if it does, just ignore it and pass on.
                try {
                    libraryListeners = VisualEvent.parsers[i]();
                    elements = elements.concat( libraryListeners );
                } catch (e) {}
            }

            /* Add the API array information - if it is available */
            if ( typeof VisualEvents == 'object' ) {
                if ( this._ceckIntegrity( VisualEvents ) ) {
                    elements = this._combineEvents( elements, VisualEvents );
                }
            }

            /* Group the events */
            return this._merge( elements );
        },


        /**
        * A node has at least one event subscribed to it - draw it visually
        *  @param {object} eventNode Event information for this node in the same format as
        *    VisualEvent.s.elements objects
        *  @private
        */
        "_eventElement": function ( eventNode )
        {
            var that = this;
            var i, iLen;
            var pos;
            var label;

            // Element is hidden
            if ( $(eventNode.node).filter(':visible').length === 0 ) {
                this.s.nonDomEvents += 1;
                return;
            }

            pos = $(eventNode.node).offset();

            label = document.createElement( 'div' );
            label.style.position = "absolute";
            label.style.top = pos.top+"px";
            label.style.left = pos.left+"px";
            label.className = 'EventLabel Event_bg_'+this._getColorFromTypes( eventNode.listeners );

            /* If dealing with the html or body tags, don't paint over the whole screen */
            if ( eventNode.node != document.body && eventNode.node != document.documentElement ) {
                label.style.width = (eventNode.node.offsetWidth-4)+'px';
                label.style.height = (eventNode.node.offsetHeight-4)+'px';
            }

            /* Event listeners for showing the lightbox for this element */
            $(label).bind( 'dblclick.VisualEvent', function (e) {
                this.style.display = "none";
                return false;
            } ).bind( 'mouseover.VisualEvent', function (e) {
                that.dom.activeEventNode = this;
                that._lightboxList( e, eventNode.node, eventNode.listeners );
            } ).bind( 'mouseout.VisualEvent', function (e) {
                that._lightboxHide();
            } );

            /* Finally have the html engine render our output */
            this.dom.display.appendChild( label );
        },



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Lightbox
        */

        /**
        * Show the list of event types which are attached to this node and add event listeners to show
        * the code when required (mouseover on the list)
        *  @param {event} e The mouse event that triggered this display
        *  @param {element} node The node with the attached listeners
        *  @param {array} listeners List of listeners attached to the element
        *  @private
        */
        "_lightboxList": function ( e, node, listeners )
        {
            var that = this;
            var i, iLen;
            var ul;

            this._timerClear();

            $('i', this.dom.lightbox).html( this._renderNodeInfo(node) );
            $('div.Event_Code', this.dom.lightbox).empty();

            ul = $('ul', this.dom.lightbox).empty();
            for ( i=0, iLen=listeners.length ; i<iLen ; i++ ) {
                ul.append( $('<li>'+listeners[i].type+'</li>').bind( 'mouseover.VisualEvent',
                    this._lightboxCode(e, node, listeners[i]) )
                );
            }

            /* Show the code for the first event in the list */
            $('li:eq(0)', this.dom.lightbox).mouseover();

            this._lightboxPosition( this.dom.lightbox, node );
        },


        /**
        * Create a function which will build the HTML needed for the display of the code for an
        * event handler
        *  @param {event} e Original mouse event that triggered the lightbox to be shown
        *  @param {element} node The node with the attached listeners
        *  @param {object} listener Listener attached to the element
        *  @returns {function} Function which will display the code for the event when called
        *  @private
        */
        "_lightboxCode": function ( e, node, listener )
        {
            var that = this;

            return function () {
                $('li', this.parentNode).removeClass( 'Event_EventSelected' );
                $(this).addClass( 'Event_EventSelected' );

                var evt = that._createEvent( e, listener.type, e.target );
                that._renderCode( e, listener.func, listener.source, listener.type,
                    evt===null ? null : function() {
                        node.dispatchEvent(evt);

                        // Might cause stuff to move around by the activation of the event, so re-init
                        setTimeout( function () {
                            that.reInit.call(that);
                        }, 200 );
                    }
                );
            };
        },


        /**
        * Position the lightbox relative to the element which has an event attached to it
        *  @param {element} target The lightbox node to move (note there is only one this.dom.lightbox
        *    but this keeps it nice and generic!)
        *  @param {element} parent The element with the event attached to it
        *  @private
        */
        "_lightboxPosition": function ( target, parent )
        {
            var offset = $(parent).offset();
            var targetT = offset.top + 15; // magic number - height of info button
            var targetL = offset.left;
            var viewportW = $(window).width() - 25; // use window rather than document, since the target could cause the document to resize
            var viewportH = $(document).height();
            var targetW = $(target).width();
            var targetH = $(target).height();

            // Correct for over-run
            if ( targetL + targetW > viewportW ) {
                targetL -= (targetL + targetW) - viewportW;
            }

            if ( targetT + targetH > viewportH ) {
                targetH -= (targetT + targetH) - viewportH;
            }

            // Correct for under-run
            if ( targetT < 0 ) {
                targetT = 0;
            }

            if ( targetL < 0 ) {
                targetL = 0;
            }

            target.style.top = targetT+'px';
            target.style.left = targetL+'px';
            target.style.display = 'block';
        },


        /**
        * Close the lightbox - use a cancellable timer for the hiding of the lightbox, so we can move
        * the mouse from element to element without having it flicker.
        *  @private
        */
        "_lightboxHide": function ()
        {
            var that = this;
            this.s.mouseTimer = setTimeout( function () {
                    that.dom.lightbox.style.display = 'none';
                },
            200 );
        },



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Rendering methods
        */

        /**
        * Display a tooltip with event information for a particular event handler
        *  @param {event} e Target node information
        *  @param {function} func The function string
        *  @param {string} type Event type
        *  @param {function|null} trigger Function to trigger the event
        *  @private
        */
        "_renderCode": function( e, func, source, type, trigger )
        {
            var that = this;
            var eventElement = e.target;
            var i, iLen;

            this._timerClear( e );

            if ( trigger === null ) {
                $('div.Event_Code', this.dom.lightbox).html( '<div id="Event_inner"><p><i>'+type+
                    '</i> event subscribed by '+source+'<br/>'+
                    this._scriptSource( func )+
                    '</p><pre id="Event_code" class="brush: js"></pre></div>' );
            }
            else {
                $('div.Event_Code', this.dom.lightbox).html( '<div id="Event_inner"><p><i>'+type+
                    '</i> event subscribed by '+source+' ('+
                    '<span id="Event_Trigger">trigger event</span>)<br/>'+
                    this._scriptSource( func )+
                    '</p><pre id="Event_code" class="brush: js"></pre></div>' );
                $('#Event_Trigger').bind( 'click.VisualEvent', trigger );
            }

            /* Modify the function slightly such that the white space that is found at the start of the
            * last line in the function is also put at the start of the first line. This allows
            * SyntaxHighlighter to be cunning and remove the block white space - otherwise it is all
            * shifted to the left, other than the first line
            */
            var lines = func.split('\n');
            if ( lines.length > 1 ) {
                var last = lines[lines.length-1].match(/^(\s*)/g);
                lines[0] = last + lines[0];
                func = lines.join('\n');
            }

            /* Inject the function string here incase it includes a '</textarea>' string */
            $('pre', this.dom.lightbox).html(
                func.replace('&', '&amp;').replace('<', '&lt;').replace('<', '&gt;')
            );

            VisualEventSyntaxHighlighter.highlight( null, document.getElementById('Event_code') );
        },


        /**
        * Show information about a particular node - the node name, ID and class (if it has either/both
        * of the last two)
        *  @param {element} node The element to inspect
        *  @returns {string} Information about the element
        *  @private
        */
        "_renderNodeInfo": function ( node )
        {
            var s = node.nodeName.toLowerCase();

            var id = node.getAttribute('id');
            if ( id && id !== '' ) {
                s += '#'+id;
            }

            var className = node.className;
            if ( className !== '' ) {
                s += '.'+className;
            }

            return s;
        },


        /**
        * Display the Visual Event toolbar, writing in the required information and adding the event
        * handlers as needed
        *  @private
        */
        "_renderLabel": function ()
        {
            var that = this,
                events = 0;

            for ( i=0, iLen=this.s.elements.length ; i<iLen ; i++ ) {
                events += this.s.elements[i].listeners.length;
            }

            $('span.Event_LabelEvents', this.dom.label).html( events );
            $('span.Event_LabelNodes', this.dom.label).html( this.s.elements.length );
            $('span.Event_LabelNonDom', this.dom.label).html( this.s.nonDomEvents );

            //this.dom.label.innerHTML = "Visual Event";
            $('span.Event_LabelClose', this.dom.label).bind( 'click.VisualEvent', function () {
                that.close();
            } );

            $('span.Event_LabelHelp', this.dom.label).bind( 'click.VisualEvent', function () {
                that._help();
            } );

            $(this.dom.help).bind( 'click.VisualEvent', function () {
                that._hideHelp();
            } );
        },



        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Support methods
        */

        /**
        * Create an event oject based on the type to trigger an event - cross-platform
        *  @param {event} originalEvt The original event (click) which cased this function to run
        *  @param {string} type Type of event
        *  @param {node} target Target node of the event
        *  @returns {event} The constructed event
        *  @private
        */
        "_createEvent": function( originalEvt, type, target )
        {
            var evt = null;
            var offset = $(target).offset();
            var typeGroup = this._eventTypeGroup( type );

            if ( document.createEvent ) {
                switch ( typeGroup ) {
                    case 'mouse':
                        evt = document.createEvent( "MouseEvents" );
                        evt.initMouseEvent( type, true, true, window, 0, offset.left, offset.top,
                            offset.left, offset.top, originalEvt.ctrlKey, originalEvt.altKey, originalEvt.shiftKey,
                            originalEvt.metaKey, originalEvt.button, null );
                        break;

                    case 'html':
                        evt = document.createEvent( "HTMLEvents" );
                        evt.initEvent( type, true, true );
                        break;

                    case 'ui':
                        evt = document.createEvent( "UIEvents" );
                        evt.initUIEvent( type, true, true, window, 0 );
                        break;

                    default:
                        break;
                }
            }
            else if ( document.createEventObject ) {
                switch ( typeGroup ) {
                    case 'mouse':
                        evt = document.createEventObject();
                        evt.screenX = offset.left;
                        evt.screenX = offset.top;
                        evt.clientX = offset.left;
                        evt.clientY = offset.top;
                        evt.ctrlKey = originalEvt.ctrlKey;
                        evt.altKey = originalEvt.altKey;
                        evt.metaKey = originalEvt.metaKey;
                        evt.button = originalEvt.button;
                        evt.relatedTarget = null;
                        break;

                    case 'html':
                        /* fall through to basic event object */

                    case 'ui':
                        evt = document.createEventObject();
                        break;

                    default:
                        break;
                }
            }

            return evt;
        },


        /**
        * Cancel tooltip mouse timer
        *  @param {event} e Mouse event
        *  @private
        */
        "_timerClear": function ( e )
        {
            if ( this.s.mouseTimer !== null ) {
                clearTimeout( this.s.mouseTimer );
                this.s.mouseTimer = null;
            }
        },


        /**
        * Combine the main events array, so that each node only has one element
        *  @param {array} main The main source array
        *  @returns {array} Augmented internal representation
        *  @private
        */
        "_merge": function ( main )
        {
            var ret = [];
            var i, iLen, j, jLen;

            for ( i=0, iLen=main.length ; i<iLen ; i++ ) {
                found = false;

                for ( j=0, jLen=ret.length ; j<jLen ; j++ ) {
                    if ( ret[j].node == main[i].node ) {
                        ret[j].listeners = ret[j].listeners.concat( main[i].listeners );
                        found = true;
                        break;
                    }
                }

                if ( !found ) {
                    ret.push( main[i] );
                }
            }

            return ret;
        },


        /**
        * Combine the API array into the internal representation.
        * The input structure MUST be valid for this to work - two types of objects are allowed as
        *   array entries:
        *     { node: '', source: '', func: '', type: '', removed: bool }
        *     { node: '', source: '', listeners: [ func: '', type: '', removed: bool, ... ] }
        *  @param {array} main The main source array
        *  @param {array} api The API array
        *  @returns {array} Augmented internal representation
        *  @private
        */
        "_combineEvents": function ( main, api )
        {
            var i, j,
                found, found2;

            for ( i=0 ; i<api.length ; i++ ) {
                if ( typeof api[i].listeners != 'undefined' ) {
                    main.push( api[i] );
                }
                else {
                    found = -1;

                    /* Want to combine single definitions into our single entry for each node array */
                    for ( j=0 ; j<main.length ; j++ ) {
                        if ( main[j].node == api[i].node ) {
                            found = j;
                            break;
                        }
                    }

                    if ( found == -1 ) {
                        main.push( {
                            "node": api[i].node,
                            "source": api[i].source,
                            "listeners": [ {
                                "type": api[i].type,
                                "func": api[i].func,
                                "removed": api[i].removed
                            } ]
                        } );
                    }
                    else {
                        /* Check to see if this exact event has already been added at some point */
                        found2 = -1;
                        for ( j=0 ; j<main[ found ].listeners.length ; j++ ) {
                            if ( main[ found ].listeners[j].type == api[i].type &&
                                    main[ found ].listeners[j].func == api[i].func )
                            {
                                /* Update removed variable */
                                main[ found ].listeners[j].removed = api[i].removed;
                                found2 = j;
                                break;
                            }
                        }

                        /* If not found - then add it in */
                        if ( found2 != -1 ) {
                            main[ found ].listeners.push( {
                                "type": api[i].type,
                                "func": api[i].func,
                                "removed": api[i].removed
                            } );
                        }
                    }
                }
            }

            return main;
        },


        /**
        * Group the event types as per w3c groupings
        *  @param {string} type Event type
        *  @returns {string} Event grouping
        *  @private
        */
        "_eventTypeGroup": function ( type )
        {
            switch ( type ) {
                case 'click':
                case 'dblclick':
                case 'mousedown':
                case 'mousemove':
                case 'mouseout':
                case 'mouseover':
                case 'mouseup':
                case 'scroll':
                    return 'mouse';

                case 'change':
                case 'focus':
                case 'blur':
                case 'select':
                case 'submit':
                    return 'html';

                case 'keydown':
                case 'keypress':
                case 'keyup':
                case 'load':
                case 'unload':
                    return 'ui';

                default:
                    return 'custom';
            }
        },


        /**
        * Compute the background colour of the event indicator from the event types
        *  @param {array} events Events information
        *  @returns {string} Color
        *  @private
        */
        "_getColorFromTypes": function ( events )
        {
            var hasMouse = false;
            var hasHtml = false;
            var hasUi = false;
            var group, i;

            for ( i=0 ; i<events.length ; i++ ) {
                group = this._eventTypeGroup( events[i].type );

                switch ( group ) {
                    case 'mouse':
                        hasMouse = true;
                        break;

                    case 'html':
                        hasHtml = true;
                        break;

                    case 'ui':
                        /* We call 'custom' and 'unknown' types UI as well */
                        hasUi = true;
                        break;

                    default:
                        hasUi = true;
                        break;
                }
            }

            /*
            * Since we have three event groups which can be in any combination - then we can group the
            * resultant colours via the colour wheel
            *
            *                        Red (UI)
            *                         +++++
            *                       ++     ++
            *                     ++         ++
            *                     ++         ++
            *       Yellow (Html)   ++     ++   Blue (mouse)
            *                         +++++
            */
        if ( hasMouse && hasHtml && hasUi ) {
                return 'black';
            }
            else if ( !hasMouse && hasHtml && hasUi ) {
                return 'orange';
            }
            else if ( hasMouse && !hasHtml && hasUi ) {
                return 'purple';
            }
            else if ( hasMouse && hasHtml && !hasUi ) {
                return 'green';
            }
            else if ( hasMouse ) {
                return 'blue';
            }
            else if ( hasHtml ) {
                return 'yellow';
            }
            else if ( hasUi ) {
                return 'red';
            }
        }
    };



    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Statics
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
    * Javascript library parsers which will find information about the nodes and events which are
    * used in the page. This is an array of functions which must return an array of objects with
    * the following parameters
    *   {element} node The DOM element in question
    *   {array} listeners Array of objects which with details about each of the events on this node
    *     {string} func Source of the event handler (from Function.toString())
    *     {string} source Library name / version
    *     {string} type Type of event (click, change, keyup etc)
    *     {boolean} removed Flag to indicate if the event has been removed (for API)
    *  @type array
    *  @default []
    *  @static
    */
    VisualEvent.parsers = [];


    /**
    * Reference to the currently running VisualEvent instance (one at a time only)
    *  @type object
    *  @default null
    *  @static
    *  @private
    */
    VisualEvent.instance = null;


    /**
    * Close Visual Event, removing all DOM elements and event handlers
    *  @static
    */
    VisualEvent.close = function ()
    {
        VisualEvent.instance.close();
        VisualEvent.instance = null;
    };


    })(window, document, jQuery);

    (function(window, document, $, VisualEvent){

    VisualEvent.parsers.push( function () {
        var
            elements = [], n,
            all = document.getElementsByTagName('*'),
            types = [ 'click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover',
                'mouseup', 'change', 'focus', 'blur', 'scroll', 'select', 'submit', 'keydown', 'keypress',
                'keyup', 'load', 'unload' ],
            i, iLen, j, jLen = types.length;

        for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
            for ( j=0 ; j<jLen ; j++ ) {
                if ( typeof all[i]['on'+types[j]] == 'function' ) {
                    elements.push( {
                        "node": all[i],
                        "listeners": [ {
                            "type": types[j],
                            "func": all[i]['on'+types[j]].toString(),
                            "removed": false,
                            "source": 'DOM 0 event'
                        } ]
                    } );
                }
            }
        }

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    VisualEvent.parsers.push( function () {
        if ( typeof glow == 'undefined' || typeof glow.events.listenersByObjId == 'undefined' ) {
            return [];
        }

        var listeners = glow.events.listenersByObjId;
        var globalGlow = "__eventId"+glow.UID;
        var elements = [];
        var all = document.getElementsByTagName('*');
        var i, iLen, j, jLen;
        var eventIndex, eventType, typeEvents;

        for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
            /* If the element has a "__eventId"+glow.UID parameter, then it has glow events */
            if ( typeof all[i][globalGlow] != 'undefined' ) {
                eventIndex = all[i][globalGlow];

                elements.push( {
                    "node": all[i],
                    "listeners": []
                } );

                for ( eventType in listeners[eventIndex] ) {
                    typeEvents = listeners[eventIndex][eventType];

                    /* There is a sub array for each event type in Glow, so we loop over that */
                    for ( j=0, jLen=typeEvents.length ; j<jLen ; j++ ) {
                        elements[ elements.length-1 ].listeners.push( {
                            "type": eventType,
                            "func": typeEvents[j][2].toString(),
                            "removed": false,
                            "source": "Glow"
                        } );
                    }
                }
            }
        }

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    // jQuery 1.3
    VisualEvent.parsers.push( function () {
        if ( !jQuery || jQuery.fn.jquery.substr(0,3)*1 > 1.3 ) {
            return [];
        }

        var elements = [];
        var cache = jQuery.cache;

        for ( i in cache ) {
            if ( typeof cache[i].events == 'object' ) {
                var nEventNode = cache[i].handle.elem;

                elements.push( {
                    "node": nEventNode,
                    "listeners": []
                } );

                for ( type in cache[i].events )
                {
                    var oEvent = cache[i].events[type];
                    var iFunctionIndex;
                    for (iFunctionIndex in oEvent) break;

                    /* We use jQuery for the Visual Event events... don't really want to display them */
                    var func = oEvent[ iFunctionIndex ].toString();
                    if ( !func.match(/VisualEvent/) && !func.match(/EventLoader/) )
                    {
                        elements[ elements.length-1 ].listeners.push( {
                            "type": type,
                            "func": func,
                            "removed": false,
                            "source": 'jQuery'
                        } );
                    }
                }
            }
        }

        return elements;
    } );


    // jQuery 1.3 live events
    VisualEvent.parsers.push( function () {
        if ( !jQuery || jQuery.fn.live != 'undefined' ||
            typeof jQuery.data == 'undefined' ||
            typeof jQuery.data(document, "events") == 'undefined' ||
            typeof jQuery.data(document, "events").live == 'undefined' )
        {
            return [];
        }

        var elements = [];
        var cache = jQuery.cache;

        jQuery.each( jQuery.data(document, "events").live || [], function(i, fn) {
            var event = fn.type.split('.');
            event = event[0];
            var selector = fn.data;

            $(selector).each( function(i) {
                elements.push( {
                    node: this,
                    listeners: []
                } );

                elements[elements.length - 1].listeners.push({
                    type: event,
                    func: 'Unable to obtain function from live() bound event.',
                    removed: false,
                    source: "jQuery 1.3 live"
                } )
            } );
        } );

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    // jQuery 1.5, 1.6
    VisualEvent.parsers.push( function () {
        var version = jQuery.fn.jquery.substr(0,3)*1;

        if ( !jQuery || version < 1.5 || version >= 1.7 ) {
            return [];
        }

        var elements = [];
        for ( j in jQuery.cache ) {
            jQueryGeneric( elements, jQuery.cache[j] );
        }

        return elements;
    } );

    // jQuery 1.4, 1.7
    VisualEvent.parsers.push( function () {
        var version = jQuery.fn.jquery.substr(0,3)*1;

        if ( !jQuery || version < 1.4 ) {
            return [];
        }

        var elements = [];
        jQueryGeneric( elements, jQuery.cache );

        return elements;
    } );


    function jQueryGeneric (elements, cache)
    {
        for ( i in cache ) {
            if ( typeof cache[i].events == 'object' ) {
                var eventAttachedNode = cache[i].handle.elem;
                var func;

                for ( type in cache[i].events ) {
                    /* Ignore live event object - live events are listed as normal events as well */
                    if ( type == 'live' ) {
                        continue;
                    }

                    var oEvents = cache[i].events[type];

                    for ( j in oEvents ) {
                        var aNodes = [];
                        var sjQuery = "jQuery "+jQuery.fn.jquery;

                        if ( typeof oEvents[j].selector != 'undefined' && oEvents[j].selector !== null ) {
                            aNodes = $(oEvents[j].selector, cache[i].handle.elem);
                            sjQuery += " (live event)";
                        }
                        else {
                            aNodes.push( eventAttachedNode );
                        }

                        for ( var k=0, kLen=aNodes.length ; k<kLen ; k++ ) {
                            elements.push( {
                                "node": aNodes[k],
                                "listeners": []
                            } );

                            if ( typeof oEvents[j].origHandler != 'undefined' ) {
                                func = oEvents[j].origHandler.toString();
                            }
                            else if ( typeof oEvents[j].handler != 'undefined' ) {
                                func = oEvents[j].handler.toString();
                            }
                            else {
                                func = oEvents[j].toString();
                            }

                            /* We use jQuery for the Visual Event events... don't really want to display them */
                            if ( oEvents[j] && oEvents[j].namespace != "VisualEvent" && func != "0" )
                            {
                                elements[ elements.length-1 ].listeners.push( {
                                    "type": type,
                                    "func": func,
                                    "removed": false,
                                    "source": sjQuery
                                } );
                            }
                        }
                    }
                }
            }
        }
    };

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    VisualEvent.parsers.push( function () {
        if ( typeof jsBase == 'undefined' ) {
            return [];
        }

        var elements = [];
        var a = jsBase.aEventCache;
        var i, iLen;

        for ( i=0, iLen=a.length ; i<iLen ; i++ )
        {
            elements.push( {
                "node": a[i].nElement,
                "listeners": [ {
                    "type": a[i].type,
                    "func": a[i].fn.toString(),
                    "removed": false,
                    "source": 'jsBase'
                } ]
            } );
        }

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    VisualEvent.parsers.push( function () {
        if ( typeof MooTools == 'undefined' ) {
            return [];
        }

        var elements = [];
        var all = document.getElementsByTagName('*');
        var i, iLen;
        var events, mooEvent;

        for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
            events = all[i].retrieve('events', {});

            if ( !$.isEmptyObject( events ) ) {
                elements.push( {
                    "node": all[i],
                    "listeners": []
                } );

                for ( mooEvent in events ) {
                    elements[ elements.length-1 ].listeners.push( {
                        "type": mooEvent,
                        "func": events[mooEvent].keys.toString(),
                        "removed": false,
                        "source": 'MooTools'
                    } );
                }
            }
        }

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    VisualEvent.parsers.push( function () {
        if ( typeof Prototype == 'undefined' ) {
            return [];
        }

        var elements = [];
        var all = document.getElementsByTagName('*');
        var i, iLen;
        var eventType;

        for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
            if ( typeof all[i]._prototypeEventID != 'undefined' ) {
                elements.push( {
                    "node": all[i],
                    "listeners": []
                } );

                for ( eventType in Event.cache[ all[i]._prototypeEventID ] ) {
                    elements[ elements.length-1 ].listeners.push( {
                        "type": eventType,
                        "func": Event.cache[ all[i]._prototypeEventID ][eventType][0].handler.toString(),
                        "removed": false,
                        "source": 'Prototype'
                    } );
                }
            }
        }

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    (function(window, document, $, VisualEvent){

    VisualEvent.parsers.push( function () {
        if ( typeof YAHOO == 'undefined' || typeof YAHOO.util == 'undefined' ||
            typeof YAHOO.util.Event == 'undefined' )
        {
            return [];
        }

        /*
        * Since the YUI cache is a private variable - we need to use the getListeners function on
        * all nodes in the document
        */
        var all = document.getElementsByTagName('*');
        var i, iLen, j, jLen;
        var elements = [], events;

        for ( i=0, iLen=all.length ; i<iLen ; i++ )
        {
            events = YAHOO.util.Event.getListeners( all[i] );
            if ( events != null && events.length != 0 )
            {
                elements.push( {
                    "node": events[0].scope,
                    "listeners": []
                } );

                for ( j=0, jLen=events.length ; j<jLen ; j++ )
                {
                    elements[ elements.length-1 ].listeners.push( {
                        "type": events[j].type,
                        "func": events[j].fn.toString(),
                        "removed": false,
                        "source": 'YUI 2'
                    } );
                }
            }
        }

        return elements;
    } );

    })(window, document, jQuery, VisualEvent);

    
}; // end of function initVisualEvent

})();