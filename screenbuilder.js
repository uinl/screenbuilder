"use strict"

//TODO: 
//  UINL should actually be UIOM -- enabling user to edit properties of each clicked object in preview
//      add clickability to every object in preview, then display each clicked object in UIOM window to edit
//      Add Component should only be visible when clicked object is a bin


// logToConsole();

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


var lastValidUINLcode=`{"v":[\n  \n]}\n`;

// on start (i.e., once handshake event is received)
app.start(event=>{
    app.display({
        cap:'UINL screen builder',
        require:{c:['grid','opt']},
        style:'style.css',
        value:[
            {id:"Preview"},
            {id:"UINL",v:[
                {id:'UINLcode',cap:'',v:lastValidUINLcode,in:1,on:{v:[]}},
                {id:'Clean up',class:'btn'},
                {id:'Save',class:'btn'},
            ]},
            {id:"Add Component",v:[...COMPONENTS.keys()].map(x=>({id:x,c:'btn'}))},
        ]
    });
});

// when UINLcode item is edited
app.event({u:'UINLcode'}, event=>{
    var displayUpdates=[{U:'Warning',v:null}];
    try{
        let uinlCode = event.v;
        let preview=JSON.parse(uinlCode);
        if(preview.constructor===Object){
            uinlCode=JSON.stringify(preview,null,2);
            if(uinlCode!==lastValidUINLcode){
                lastValidUINLcode=uinlCode;
                preview.id='Preview';
                preview.i=0;
                displayUpdates.push({U:'Preview',v:null},{add:[preview]});
            }
        }else{
            displayUpdates.push({U:'UINL',add:[{id:'Warning',v:'APP→UI message must be a JSON object.'}]});
        }
    }catch(e){
        if(e.message.includes('JSON')){
            displayUpdates.push({U:'UINL',add:[{id:'Warning',v:'Invalid JSON string.'}]});
        }else{
            throw(e);
        }
    }
    app.display({Q:displayUpdates});
});

// when Clean up button is clicked
app.event({u:'Clean up'}, event=>{
    app.display({Q:[
        {U:'Warning',v:null},
        {U:'UINLcode',v:lastValidUINLcode}
    ]});
});

// when Save button is clicked
app.event({u:'Save'},event=>{
    app.display({Q:[
        {U:'Warning',v:null},
        {save:['screenBuilder.uinl',lastValidUINLcode]}
    ]});
});

// any other event (e.g., when one of the COMPONENTS buttons is clicked)
app.event({}, event=>{
    var itemId=event.u;
    var displayUpdates=[{U:'Warning',v:null}];
    if(COMPONENTS.has(itemId)){ // check if one of the COMPONENTS buttons was clicked
        let preview=JSON.parse(lastValidUINLcode);
        if(!preview.v || preview.v.constructor!==Array)preview.v=[];
        preview.v.push(COMPONENTS.get(itemId));
        lastValidUINLcode=JSON.stringify(preview,null,2);
        displayUpdates.push({U:'UINLcode',v:lastValidUINLcode});
        preview.id='Preview';
        preview.i=0;
        displayUpdates.push({U:'Preview',v:null},{add:[preview]});        
    }
    app.display({Q:displayUpdates});
});
