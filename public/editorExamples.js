//
// Examples
//
function selectExampleFacetToAdd() {
    if (selectedExampleDocumentToEdit && !confirm("Looks like you are editing an example, adding a new one will lose any unsaved changes. Are you sure?")) {
        gebi("exampleFacetList").value = "";
        return;
    }

    selectedExampleDocumentToEdit = null;
    selectedExampleFacetToAdd = this.value;
    redrawPage();
    focusFirstNonReadOnlyInput();
}

function addExample() {
    let exampleFields = gebi("examplesNewDocumentToAdd")?.getElementsByTagName("input");
    
    let newExampleDocument = Array.from(exampleFields).reduce((prevValue, curValue) => {
        const fieldName = curValue.dataset.fieldname;
        prevValue[fieldName] = curValue.value;
        return prevValue;
    }, {
        __facetName: selectedExampleFacetToAdd, // Should probably protect against this field name in other editor
        __dttm: getDatetimeFormatted()
    });

    if (!isGoodExampleDocument(newExampleDocument)) { return; }

    APP_STATE.examples.push(newExampleDocument);
    selectedExampleFacetToAdd = "";
    gebi("exampleFacetList").value = "";

    redrawPage();
    console.debug("ADDEXAMPLE: New example added");
}

function focusFirstNonReadOnlyInput() {
    // TODO.. this focuses on the first input
    gebi("examplesNewDocumentToAdd")?.getElementsByTagName("input")?.[0]?.focus();
}

function selectExampleDocument() {
    if (selectedExampleDocumentToEdit && !confirm("Looks like you are editing an example, selecting a different example will lose any unsaved changes. Are you sure?")) { return; }
    selectedExampleDocument = selectedExampleDocument == this.dataset.id ? null : this.dataset.id;
    selectedExampleDocumentToEdit = null;
    redrawPage();
}

function deleteExample() {
    if (!selectedExampleDocument) { return; }
    console.warn(`DELETEEXAMPLE: Deleting example #${selectedExampleDocument}`);
    if (!confirm("Are you sure you want to delete this example?")) { return; }

    APP_STATE.examples = APP_STATE.examples.filter((item, index) => index != selectedExampleDocument);
    redrawPage();
    console.warn(`DELETEEXAMPLE: Example #${selectedExampleDocument} deleted`);
    selectedExampleDocument = null;
}

// While adding an example, update all the composite key fields that are read only when another field is changed
function updateNewExampleInputs() {
    let exampleInputFields = Array.from(gebi("examplesNewDocumentToAdd").getElementsByTagName("input")).filter(ele => ele.readOnly);
    const facetName = gebi("exampleFacetList").value;

    exampleInputFields.forEach(ele => {
        let fieldName = ele.dataset.fieldname;
        let field = getFacetFieldByNames(facetName, fieldName);
        let calculatedFields = []; // EXAMPLEFIELD
        field.keys.forEach(key => {
            if (key.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) === 0) {
                calculatedFields.push(key.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, ""));
            } else {
                calculatedFields.push(gebi(`EXAMPLEFIELD#${key}`)?.value);
            }
        });
        ele.value = calculatedFields.join(CONSTS.DELIM);
    });
}

function selectExamplesQuery() {
    selectedExamplesQuery = gebi("examplesQuerySelect").value;
    examplesFilterValues = {};
    redrawPage();
}

function updateExampleQueryInputs() {
    examplesFilterValues = Array.from(document.getElementsByClassName("examplesQueryInputField"))
        .reduce((curObj, curEle) => {
            curObj[curEle.dataset.fieldname] = curEle.value;
            return curObj;
        }, {});

    redrawExampleQueryInputs();
}

function editExample() {
    if (selectedExampleFacetToAdd && !confirm("Looks like you are adding an example, editing an existing one will lose any unsaved changes. Are you sure?")) { return; }
    const example = APP_STATE.examples[selectedExampleDocument];
    selectedExampleFacetToAdd = null;
    selectedExampleDocumentToEdit = example.__facetName;
    redrawPage();
    focusFirstNonReadOnlyInput();
}