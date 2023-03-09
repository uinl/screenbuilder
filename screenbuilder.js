"use strict"

//TODO: 
//  UINL should actually be UIOM -- enabling user to edit properties of each clicked object in preview
//      add clickability to every object in preview, then display each clicked object in UIOM window to edit
//      Add Component should only be visible when clicked object is a bin


logToConsole();

var curDate=(new Date()),curDateTime=Math.floor(curDate.getTime()/1000)-curDate.getTimezoneOffset()*60;

var COMPONENTS = new Map([
    ['bin', {"c":"bin","id":"title","v":[]}],
    ['txt', {"c":"txt","v":"hello world"}],
    ['num', {"c":"num","id":"X","v":0}],
    ['btn', {"c":"btn","id":"press me"}],
    ['opt', {"c":"opt","id":"select me"}],
    ['date', {"c":"dt","v":curDateTime,"step":86400}],
    ['date-time', {"c":"dt","v":curDateTime,"step":60}],
    ['grid', {"c":"grid","id":"table","v":[["A","B","C"],[1,2,3],[4,5,6]]}]
]);


var lastUINL=`{"v":[\n  \n]}\n`;


function userEvent(event){

    if(event.t==0){  // on handshake
        app.display({
            cap:'UINL screen builder',
            require:{c:['grid','opt']},
            style:'style.css',
            value:[
                {id:"Preview"},
                {id:"UINL",v:[
                    {id:'UINLcode',cap:'',v:lastUINL,in:1,on:{v:[]}},
                    {id:'Reindent',class:'btn'},
                    {id:'Save',class:'btn'},
                ]},
                {id:"Add Component",v:[...COMPONENTS.keys()].map(x=>({id:x,c:'btn'}))},
            ]
        });

    }else{ // on any user event other than handshake
        var itemId=event.u,itemValue=event.v,uinl,display={};
        display.Q=[];
        display.Q.push({U:'UI→APP message',v:null});
        display.Q.push({U:'Warning',v:null});
        let addItems=[];
        
        if(itemId=='UINLcode'){ // if user is editing UINL directly
            try{
                uinl=JSON.parse(itemValue);
                if(uinl.constructor===Object){
                    itemValue=JSON.stringify(uinl,null,2);
                    if(itemValue!==lastUINL){
                        lastUINL=itemValue;
                        uinl.id='Preview';
                        uinl.i=0;
                        display.Q.push({U:'Preview',v:null});
                        addItems.push(uinl);
                    }
                }else{
                    addItems.push({id:'Warning',v:'APP→UI message must be a JSON object.'});
                }
            }catch(e){
                if(e.message.includes('JSON')){
                    addItems.push({id:'Warning',v:'Invalid JSON string'});
                }else{
                    throw(e);
                }
            }

        }else if(itemId==='Reindent'){ // if user clicks Reindent
            if(lastUINL){
                display.Q.push({U:'UINLcode',v:lastUINL});
            }

        }else if(itemId==='Reindent'){ // if user clicks Reindent
            if(lastUINL){
                display.Q.push({U:'UINLcode',v:lastUINL});
            }

        }else if(COMPONENTS.has(itemId)){ // check if one of the COMPONENTS buttons was clicked
            uinl=JSON.parse(lastUINL);
            if(!uinl.v || uinl.v.constructor!==Array)uinl.v=[];
            uinl.v.push(COMPONENTS.get(itemId));
            lastUINL=JSON.stringify(uinl,null,2);
            display.Q.push({U:'UINLcode',v:lastUINL});
            uinl.id='Preview';
            uinl.i=0;
            // uinl.df={on:{pc:[]}};
            display.Q.push({U:'Preview',v:null});
            addItems.push(uinl);

        }else if(event.pc){ // check for point-click event
            console.log(event);
            

        }else{ // if one of the preview components is toggled/edited
            addItems.push({id:'UI→APP message',v:JSON.stringify(event)});
        }

        display.Q.push({add:addItems});
    }
    app.display(display);
}
