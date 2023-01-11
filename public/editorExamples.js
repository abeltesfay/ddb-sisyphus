//
// Examples
//
function addExample() {
    let exampleFields = gebi("examplesNewDocumentToAdd")?.getElementsByTagName("input");
    
    let newExampleDocument = Array.from(exampleFields).reduce((prevValue, curValue) => {
        prevValue[curValue.id] = curValue.value;
        return prevValue;
    }, {});

    APP_STATE.examples.push(newExampleDocument);
    selectedExampleFacetToAdd = "";
    gebi("exampleFacetList").value = "";

    redrawPage();
    console.debug("ADDEXAMPLE: New example added");
}

function selectExampleFacetToAdd() {
    selectedExampleFacetToAdd = this.value;
    redrawPage();
}
