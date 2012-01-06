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
    alert('enabled');
    /*
    var url = 'vendors/VisualEvent/VisualEvent_Loader.js';

    if( typeof VisualEvent!='undefined' ) {
        if ( VisualEvent.instance !== null ) {
            VisualEvent.close();
        }
        else {
            new VisualEvent();
        }
    }
    else {
        var n=document.createElement('script');
        n.setAttribute('language','JavaScript');
        n.setAttribute('src',url+'?rand='+new Date().getTime());
        console.log(document.innerHTML);
        document.body.appendChild(n);
    }
    */
};
})();