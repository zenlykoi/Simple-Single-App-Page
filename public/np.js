/*
 * @name : NPjs
 * @description : The simple single page app
 * @author : Nguyen Phuong(NP)
 * @contributors : Nguyen Phuong(NP),...
 * @version : 0.1.0
 */
let NP = {
    /*
     * @name : initId
     * @type : variable(string)
     * @description : DOM id to init NPjs
     */
    initId: "",
    /*
     * @name : initElement
     * @type : variable(DOM object)
     * @description : DOM by initId
     */
    initElement: null,
    /*
     * @name : routes
     * @type : variable(array)
     * @description : Array to store all page router
     * @struct : [
     *              {
     *                  path : 'Url page',
     *                  template : {
     *                      title : 'Title of page',
     *                      html : `HTML of page (multiline string)`
     *                  } 
     *              },...
     *          ]
     */
    routes: [],
    /*
     * @name : data
     * @type : variable(object)
     * @description : Object to store all NP data
     * @struct : {
     *              if : {
     *                  example : true(or false)  -> if DOM
     *              },...
     *           }
     */
    data: {},
    /*
     * @name : dataProxy
     * @type : variable(object)
     * @description : If you change this -> data change and All variable in HTML document change ...
     */
    dataProxy: {},
    /*
     * @name : renderDataSymbol
     * @type : variable(object)
     * @description : Symbol to render data in HTML document
     */
    renderDataSymbol: { open : '{{' , close : '}}' },
    /*
     * @name : dataTag
     * @type : variable(string)
     * @description : The name of tag to init any text in HTML document
     */
    dataTag: 'np',
    /*
     * @name : attrIf
     * @type : variable(string)
     * @description : The name of attribute if DOM
     */
    attrIf: 'np-if',
    /*
     * @name : attrFor
     * @type : variable(string)
     * @description : The name of attribute for DOM
     */
    attrFor: 'np-for',
    /*
     * @name : initTemplateByRouter
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @functional : 
     *      - Init HTML of router to DOM(initId)
     *      - Add proxy to data (listen when data change)
     *      - Delete all DOM have attribute np-if == false -> renderTagWithAttr('if')
     *      - Render all tag have np-for attribute -> renderTagWithAttr('for')
     *      - Init any text in HTML document like template egine -> initTextToHTML()
     *      - Init event when click to link -> initEventToClickRoute()
     *      - Run all script in template after load
     */
    initTemplateByRouter: function() {
        let routesLength = this.routes.length;
        let path = (location.pathname[location.pathname.length-1] == '/') ? location.pathname.slice(0,location.pathname.length-1) : location.pathname;
        let template;

        if (routesLength > 0){
            for (let i = 0; i< routesLength; i++) {
                if(path == this.routes[i].path){
                    template = this.routes[i].template;
                    break;
                }
            }
            document.title = template.title;
            document.getElementById(this.initId).innerHTML = template.html;

            this.setDataProxy();

            this.renderTagWithAttr('if');

            this.renderTagWithAttr('for');

            this.initTextToHTML();

            this.initEventToClickRoute();

            this.runScriptInTemplate();
        }
    },
    /*
     * @name : initEventToClickRoute
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @functional : 
     *      - Init onclick event to all tag 'a' of DOM and disable attr href of this tag
     *      - When click tag 'a',NP will run history.pushState() function with 'a' href
     *      - After that,NP run initTemplateByRouter() function to init HTML
     */
    initEventToClickRoute: function() {
        let that = this;
        let routes = document.getElementsByTagName("a");
        let routeLength = routes.length;
        let routeLink;

        for(let i=0; i<routeLength; i++){
            if(location.origin == routes[i].origin && this.checkHaveRouter(routes[i].pathname)){
                routes[i].onclick = function(){
                    routeLink = document.getElementsByTagName("a")[i].href;
                    document.getElementsByTagName("a")[i].href = 'javascript: void(0)';
                    history.pushState({}, '',routeLink);

                    that.initTemplateByRouter();
                }
            }
        }
    },
    /*
     * @name : renderTagWithAttr
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @param : attr 
     * @functional : 
     *      - Delete all DOM have attribute np-if == false
     *      - Render for DOM
     */
    renderTagWithAttr: function(attr){
        if(attr == 'if'){
            let parentNode = document.getElementById(this.initId);
            let listIfDOM = this.getAllElementsByAttr(this.attrIf);
            let listIfDOMLength = listIfDOM.length;
            for(let i=0; i<listIfDOMLength; i++){
                if(this.data.if[listIfDOM[i].getAttribute(this.attrIf)] == false){
                    parentNode.removeChild(listIfDOM[i]);
                }
            }
        }
        if(attr == 'for'){
            let listForLoop = this.getAllElementsByAttr(this.attrFor);
            let dataLoop,listTextTag,forLoopElement,cloneNode,cloneNodelv2,cloneListTextTag,html='';
            for(let i=0; i<listForLoop.length; i++){
                forLoopElement = listForLoop[i];
                cloneNode = forLoopElement.cloneNode(true);
                dataLoop = this.data.for[forLoopElement.getAttribute(this.attrFor)];
                listTextTag = this.getAllElementsByAttrAndDataTag('tag',forLoopElement,'text-for');
                for(let j=0; j<dataLoop.length; j++){
                    cloneNodelv2 = cloneNode.cloneNode(true);
                    if(j == 0){
                        for(let k=0; k<listTextTag.length; k++){
                            listTextTag[k].outerHTML = dataLoop[j][listTextTag[k].getAttribute('data')];
                        }
                    }else{
                        cloneListTextTag = this.getAllElementsByAttrAndDataTag('tag',cloneNodelv2,'text-for');
                        for(let k=0; k<listTextTag.length; k++){
                            cloneListTextTag[k].outerHTML = dataLoop[j][cloneListTextTag[k].getAttribute('data')];
                        }

                        html += cloneNodelv2.outerHTML;
                    }
                }
                forLoopElement.outerHTML += html;
            }
        }
    },
    /*
     * @name : initTextToHTML
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @status : - Old function, now not use it
     * @functional : 
     *      - Render any text in HTML document like template egine
     * @example : 
     *      - <np tag='text'>Nguyen Phuong</np>   ->  'Nguyen Phuong'
     *      - <np tag='text' data='test'></np>  ->  data.test
     */
    initTextToHTML2: function(){
        let listTextTag = this.getAllElementsByAttrAndDataTag('tag',this.initElement,'text');
        for(let i=0; i<listTextTag.length; i++){
            if(listTextTag[i].hasAttribute('data')){
                listTextTag[i].outerHTML = this.data[listTextTag[i].getAttribute('data')];
            }else{
                listTextTag[i].outerHTML = listTextTag[i].innerHTML;
            }
        }
    },
    /*
     * @name : initTextToHTML
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @functional : 
     *      - Render any text in HTML document like template egine
     * @example : 
     *      - {{example.test.1.a}}   ->  data[example][test][1][a]
     */
    initTextToHTML: function(data = this.data, parent = this.initElement, symbolOpen = this.renderDataSymbol.open, symbolClose = this.renderDataSymbol.close){
        var innerHTML = parent.innerHTML;
        var cloneHTML = innerHTML;
        var arr1 = cloneHTML.split(symbolOpen);
        var arr2 = [];
        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i].indexOf('}}') != -1) {
                arr2.push(arr1[i].split(symbolClose)[0]);
            }
        }
        for (var i = 0; i < arr2.length; i++) {
            cloneHTML = cloneHTML.replace(symbolOpen + arr2[i] + symbolClose, this.getObjDataByString(arr2[i]));
        }
        parent.innerHTML = cloneHTML;
        return cloneHTML;
    },
    getObjDataByString: function(str , data = this.data){
        var arr = str.split('.');
        var result = data;
        for(let i=0; i<arr.length; i++){
            result = result[arr[i]];
        }
        return result;
    },
    /*
     * @name : runScriptInTemplate
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @functional : 
     *      - Run all script in template after load
     */
    runScriptInTemplate: function(){
        let listScriptTag = this.getAllElementsByAttrAndDataTag('tag',this.initElement,'script');
        for(let i=0; i<listScriptTag.length; i++){
            eval(listScriptTag[i].innerHTML);
            listScriptTag[i].outerHTML = '';
        }
    },
    /*
     * @name : setDataProxy
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @functional : 
     *      - Add proxy to data,if change dataProxy -> data change and all var in HTML document change...
     */
    setDataProxy: function(){
        var that = this;
        this.dataProxy = new Proxy(this.data, {
            // set: function (target, key, value) {
            //     console.log(target)
            //     console.log(key)
            //     console.log(value)
            //     return;
            // }
            set(target, prop, val) {
                console.log(target)
                return true
              }
        });
    },
    /*
     * @name : checkHaveRouter
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @params : 
     *      - path : Path of link you want to check
     * @functional : 
     *      - Check have router with any path
     * @return : 
     *      - True if have router
     *      - False if not have router
     */
    checkHaveRouter: function(path){
        for (let i = 0; i< this.routes.length; i++) {
            if(path == this.routes[i].path){
                return true;
            }
        }
        return false;
    },
    /*
     * @name : renderAfterLoad
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @functional : 
     *      - Active initEventToClickRoute() function and initTemplateByRouter() function in some cases
     */
    renderAfterLoad: function() {
        let that = this;
        that.initEventToClickRoute();

        window.onload = function() {
            that.initTemplateByRouter();
        };
        window.onbeforeunload = function() {
            that.initTemplateByRouter();
        };
        window.addEventListener("popstate", function() {
            that.initTemplateByRouter();
        })
    },
    /*
     * @name : getAllElementsByAttr
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @params : 
     *      - attr : Attribute of DOM element you want to get
     *      - parent : ParentNode of element (define = document)
     * @functional : 
     *      - Get all element have someone attribute
     * @return : DOM element have attr attribute
     */
    getAllElementsByAttr: function(attr,parent = this.initElement){
        return parent.querySelectorAll('['+attr+']');
    },
    /*
     * @name : getAllElementsByAttrAndDataTag
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @params : 
     *      - attr : Attribute of DOM element you want to get
     *      - parent : ParentNode of element (define = document)
     *      - attrValue : Value of attr
     * @functional : 
     *      - Get all element have someone attribute and dataTag
     * @return : List search result by attr and dataTag
     */
    getAllElementsByAttrAndDataTag: function(attr,parent = this.initElement,attrValue = ''){
        let listDataTag = parent.getElementsByTagName(this.dataTag);
        let result = [];
        if(attrValue && attrValue != undefined && attrValue != null && attrValue != ''){
            for(let i=0; i<listDataTag.length; i++){
                if(listDataTag[i].hasAttribute(attr) && listDataTag[i].getAttribute(attr) == attrValue){
                    result.push(listDataTag[i]);
                }
            }
        }else{
            for(let i=0; i<listDataTag.length; i++){
                if(listDataTag[i].hasAttribute(attr)){
                    result.push(listDataTag[i]);
                }
            }
        }
        return result;
    },
    /*
     * @name : init
     * @author : Nguyen Phuong(NP)
     * @type : function
     * @params : 
     *      - id : The attribute 'id' of DOM element you want to init NPjs
     * @functional : 
     *      - Init NPjs
     */
    init: function(id) {
        this.initId = id;
        this.initElement = document.getElementById(id);
        this.renderAfterLoad();
    }
};