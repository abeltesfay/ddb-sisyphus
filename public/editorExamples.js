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

function addExampleNoRedraw(event) { addExample(event, false); }

function addExample(event, shouldRedrawPage = true) {
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
    
    if (shouldRedrawPage) {
        selectedExampleFacetToAdd = null;
        gebi("exampleFacetList").value = "";
        
        redrawPage();
    }
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
    const referenceValues = getReferenceValuesForExample(facet.fields);

    const generatedFieldAndValues = facet.fields
        .map(field => {
            const generatedValue = generateFieldValueByField(field, referenceValues);
            if (!generatedValue) { return; }
            return { fieldName: field.name, generatedValue};
        })
        .filter(field => field); // TODO Probably want to make sure we have a pk/sk if they're required

    generatedFieldAndValues.forEach(fieldAndValue => {
        gebi(`EXAMPLEFIELD#${fieldAndValue.fieldName}`).value = fieldAndValue.generatedValue;
    });

    updateNewExampleInputs();
}

function getReferenceValuesForExample(fields) {
    let uniqueFacets = fields.filter(field => {
            const isReferenceFormat = CONSTS.FORMAT_VALUES.VALID_REFERENCE_KEYS.includes(field.format?.type);
            return isReferenceFormat;
        })
        .map(field => field.format[CONSTS.FORMAT_TYPES[field.type][field.format.type].valueKey].split("."))
        .reduce((groupedFacetFields, facetFieldNameCombo) => {
            if (!groupedFacetFields[facetFieldNameCombo[0]]) { groupedFacetFields[facetFieldNameCombo[0]] = []; }
            if (groupedFacetFields[facetFieldNameCombo[0]].includes(facetFieldNameCombo[1])) { return groupedFacetFields; } // Uniques only

            groupedFacetFields[facetFieldNameCombo[0]].push(facetFieldNameCombo[1]);
            return groupedFacetFields;
        }, {});

    
    let examplesToReference = {};

    Object.keys(uniqueFacets).forEach(facetName => {
        examplesToReference[facetName] = [];

        for (let example of APP_STATE.examples) {
            if (example.__facetName !== facetName) { continue; }
            let hasAllFields = true;

            uniqueFacets[facetName].forEach(fieldName => {
                if (!hasAllFields) { return; }
                if (example[fieldName] === "") { hasAllFields = false; }
            });
            
            // Field doesn't have a value? skip this example
            if (!hasAllFields) { continue; }
            examplesToReference[facetName].push(clone(example));
        }
    });

    let facetsWithNoExample = Object.keys(examplesToReference)
        .filter(facetName => examplesToReference[facetName].length === 0)
        .map(facetName => `${facetName}: ${uniqueFacets[facetName].join(", ")}`);

    if (facetsWithNoExample.length !== 0) {
        const errorMessage = `Found references in facets, but no examples to reference when generating data for:\n\n${facetsWithNoExample.join("\n")}`;
        alert(errorMessage);
        throw errorMessage;
    }

    let oneExamplePerFacetToReference = getRandomExamplePerFacet(examplesToReference);

    return oneExamplePerFacetToReference;
}

// function getFacetsWithEmptyExamples(examplesToReference) {} 

function getRandomExamplePerFacet(facetExamples) {
    return Object.keys(facetExamples)
        .map(facetName => {
            const examplesToPullFrom = facetExamples[facetName];
            const count = examplesToPullFrom.length;
            const randomIndex = Math.floor(Math.random() * count);
            return facetExamples[facetName][randomIndex];
        })
        .reduce((examplesToReference, example) => {
            examplesToReference[example.__facetName] = example;
            return examplesToReference;
        }, {});
}

function generateFieldValueByField(field, references) {
    if (!field || !field.format?.type || field.format.type === "") { return ""; };

    return CONSTS.FORMAT_TYPES[field.type][field.format.type].fn(field, references);
}

function generateExamples(event) {
    const count = prompt("How many rows should we generate?");
    if (!isNumbersOnly(count)) { return; }

    console.debug(`GENEX: Completed generating ${count} examples`);
    const startMillis = new Date().getTime();

    for (let i = 0; i < parseInt(count, 10); i++) {
        generateStatusCheck(startMillis, i + 1, count);
        generateExample();
        addExampleNoRedraw(event);
    }

    redrawPage();
    
    const { minutes, seconds, millis } = getTimeSinceMSM(startMillis);
    console.debug(`GENEX: Completed generating ${count} examples in ${minutes}m${seconds}s${millis}ms`);
}

function generateStatusCheck(startMillis, countCompleted, countTotal) {
    if (countCompleted % 100 !== 0) { return; } // Only generate a status check every 100 units
    const { minutes, seconds, millis, totalTimeMillis } = getTimeSinceMSM(startMillis);
    
    const leftMillis = Math.max(Math.floor(totalTimeMillis / (countCompleted / countTotal)) - totalTimeMillis, 0);
    const left = convertTotalMillisToMSM(leftMillis);

    console.debug(`GENEX: Completed generating ${countCompleted} examples in ${minutes}m${seconds}s${millis}ms, estimated time remaining: ${left.minutes}m${left.seconds}s${left.millis}ms`);
}

function nukeExamples() {
    if (APP_STATE.examples.length === 0) { alert("Can't delete examples that don't exist. Stop playin'."); return; }

    if (!confirm("DELETE ALL EXAMPLES? It's recommended you click 'Download' or 'D+' first to download a backup file of your data.")) { return; }

    APP_STATE.examples = [];
    redrawPage();
}