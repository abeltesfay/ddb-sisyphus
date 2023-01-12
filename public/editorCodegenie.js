//
// Code genie
//
function generateCode() {
    const generatorType = gebi("codeType").value;
    const generatorFunction = CONSTS.GENERATORFN[generatorType];

    if (typeof generatorFunction !== "function") {
        alert(`Expect function type for option, function type was actually [${generatorFunction}]`);
        return;
    }

    generatorFunction();
}

function generateJavascript() {
    
}

function generateObjectList() {
    alert("This is not yet implemented");
}

function generateNSQLWBI() {
    alert("This is not yet implemented");
}

function generateCFT() {
    alert("This is not yet implemented");
}


//
// Static code
//