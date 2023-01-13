//
// Examples
//
function selectExampleFacetToAdd() {
    if (selectedExampleDocumentToEdit && !confirm("Looks like you are editing an example, adding a new one will lose any unsaved changes. Are you sure?")) {
        gebi("exampleFacetList").value = "";
        return;
    }

    selectedExampleDocumentToEdit = null;
    selectedExampleFacetToAdd = gebi("exampleFacetList").value;
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
    selectedExampleFacetToAdd = null;
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
    selectedExampleDocumentIndex = selectedExampleDocumentIndex == this.dataset.id ? null : this.dataset.id;
    selectedExampleDocumentToEdit = null;
    redrawPage();
}

function deleteExample() {
    if (!selectedExampleDocumentIndex) { return; }
    console.warn(`DELETEEXAMPLE: Deleting example #${selectedExampleDocumentIndex}`);
    if (!confirm("Are you sure you want to delete this example?")) { return; }

    APP_STATE.examples = APP_STATE.examples.filter((item, index) => index != selectedExampleDocumentIndex);
    redrawPage();
    console.warn(`DELETEEXAMPLE: Example #${selectedExampleDocumentIndex} deleted`);
    selectedExampleDocumentIndex = null;
}

// While adding an example, update all the composite key fields that are read only when another field is changed
function updateNewExampleInputs() {
    let exampleInputFields = Array.from(gebi("examplesNewDocumentToAdd").getElementsByTagName("input")).filter(ele => ele.readOnly);
    const facetName = getCurrentExampleFacetName();

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
    if (selectedExamplesQuery !== "") { validateExamplesQueryOrIndex(); }
    examplesFilterValues = {};
    redrawPage();
}

function validateExamplesQueryOrIndex() {
    const queryOrIndex = selectedExamplesQuery;
    const fieldKeys = getFieldKeysByQueryName(queryOrIndex) ?? getFieldKeysByIndexName(queryOrIndex);
    if (!fieldKeys) {
        selectedExamplesQuery = "";
        gebi("examplesQuerySelect").value = "";
        alert("Invalid filter, please make sure the query or index is fully set up.");
    }
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
    const example = APP_STATE.examples[selectedExampleDocumentIndex];
    selectedExampleFacetToAdd = null;
    selectedExampleDocumentToEdit = example;
    redrawPage();
    focusFirstNonReadOnlyInput();
}

function updateExample() {
    let exampleFields = gebi("examplesNewDocumentToAdd")?.getElementsByTagName("input");
    
    let newExampleDocument = Array.from(exampleFields).reduce((prevValue, curValue) => {
        const fieldName = curValue.dataset.fieldname;
        prevValue[fieldName] = curValue.value;
        return prevValue;
    }, {
        __facetName: selectedExampleDocumentToEdit.__facetName, // Should probably protect against this field name in other editor
        __dttm: getDatetimeFormatted()
    });

    if (!isGoodExampleDocument(newExampleDocument, true)) { return; }

    APP_STATE.examples[selectedExampleDocumentIndex] = newExampleDocument;
    selectedExampleDocumentToEdit = null;

    redrawPage();
    console.debug("ADDEXAMPLE: New example added");   
}

function copyExample() {
    if (!selectedExampleDocumentIndex) { return; }

    const example = APP_STATE.examples[selectedExampleDocumentIndex]

    const currentFacetName = example.__facetName;

    if (!selectedExampleFacetToAdd) {
        selectedExampleFacetToAdd = currentFacetName;
        gebi("exampleFacetList").value = selectedExampleFacetToAdd;
        selectExampleFacetToAdd();
    }

    if (currentFacetName !== selectedExampleFacetToAdd) {
        alert("Cannot copy values in from an different facet");
        return;
    }

    // Validate that current add doesn't already have data
    const inputEles = Array.from(gebi("examplesNewDocumentToAdd")?.getElementsByTagName("input") ?? []);
    const alreadyHasInputValues = inputEles.some(ele => ele.value !== "");

    if (alreadyHasInputValues && !confirm("Looks like you are adding an example, copying an existing one in will lose any unsaved changes. Are you sure?")) { return; }

    inputEles.forEach(ele => ele.value = example[ele.dataset.fieldname]);
    focusFirstNonReadOnlyInput();
}

function generateExample() {
    if (!selectedExampleFacetToAdd) { return; }
    const facet = getFacetByName(selectedExampleFacetToAdd);

    const generatedFieldAndValues = facet.fields
        .map(field => {
            const generatedValue = generateFieldValueByField(field);
            if (!generatedValue) { return; }
            return { fieldName: field.name, generatedValue};
        })
        .filter(field => field);

    generatedFieldAndValues.forEach(fieldAndValue => {
        gebi(`EXAMPLEFIELD#${fieldAndValue.fieldName}`).value = fieldAndValue.generatedValue;
    });

    updateNewExampleInputs();
}

function generateFieldValueByField(field) {
    if (!field || !field.format?.type || field.format.type === "") { return ""; };

    return CONSTS.FORMAT_TYPES[field.type][field.format.type].fn(field);
}

function generateExamples() {
    alert("2+");
}