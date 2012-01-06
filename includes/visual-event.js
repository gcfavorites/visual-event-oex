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
    if( typeof VisualEvent!='undefined' ) {
        if ( VisualEvent.instance !== null ) {
            VisualEvent.close();
        }
        else {
            new VisualEvent();
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
    if ( typeof VisualEvent_Loader == 'undefined' ) {

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
        VisualEvent_Loader = function ()
        {
            /* Sanity check */
            if ( ! this instanceof VisualEvent_Loader ) {
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


        VisualEvent_Loader.prototype = {
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
                VisualEvent_Loader.jQueryPreLoaded = (typeof jQuery == 'undefined') ? false : true;

                /* Start the polling for ready */
                if ( typeof VisualEvent == 'object' ) {
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
                if ( typeof jQuery == 'undefined' ) {
                    alert('Load jQuery');
                    //this._loadFile( '/vendors/VisualEvent/VisualEvent-1325838720/js/VisualEvent-jQuery.js', 'js' );
                }
                else {
                    alert('Load Visual Event');
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

                if ( typeof VisualEvent == 'function' &&
                        typeof VisualEventSyntaxHighlighter == 'object' )
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

                tmp = new VisualEvent(); // jsLint need to assign it to a var

                /* Tidy up our display */
                document.body.removeChild( this.dom.loading );
            }
        };

        VisualEvent_Loader.jQueryPreLoaded = false;
    } /* /typeof VisualEvent_Loader */


    /*
    * If visual event is already defined then we can toggle the display - giving the effect of
    * starting it up and shutting it down when using the loader. Note it's preferable to do this in
    * the bookmarklet code (and is now - but is it for backwards compatability)
    */
    var tmp;
    if ( typeof VisualEvent != 'undefined' )
    {
        if ( VisualEvent.instance !== null ) {
            VisualEvent.close();
        }
        else {
            tmp = new VisualEvent();
        }
    }
    else {
        tmp = new VisualEvent_Loader();
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
})();