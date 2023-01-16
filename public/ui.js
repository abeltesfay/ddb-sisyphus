function preparePage() {
    console.debug("PREP: Preparing page and buttons");
    
    getInputsOnPageRefresh();
    loadAppState();
    redrawPage();
    setClick("saveState", saveAppState);
    setClick("loadFromOrbit", loadFromOrbit);
    setClick("nukeFromOrbit", nukeFromOrbit);
    setClick("logState", logState);
    setClick("addFacet", addFacet);
    setClick("addField", addField);
    setClick("addFields", addFields);
    setClick("editFacetName", editFacetName);
    setClick("editField", editField);
    setClick("deleteFacet", deleteFacet);
    setClick("deleteField", deleteField);
    setClick("addKey", addKey);
    gebi("compositeKeyOptions").onchange = addKeyStatic;
    setClick("removeKey", removeKey);
    setClick("moveKeyUp", moveKeyUp);
    setClick("moveKeyDown", moveKeyDown);
    setClick("addQuery", addQuery);
    setClick("addIndex", addIndex);
    setClick("deleteQuery", deleteQuery);
    setClick("deleteIndex", deleteIndex);
    setClick("updateIndex", updateIndex);
    setClick("updateQuery", updateQuery);
    gebi("fieldFilter").onkeyup = updateFieldFilterValue;
    gebi("queryIndex").onchange = redrawQueryEditIndexArea;
    gebi("exampleFacetList").onchange = selectExampleFacetToAdd;
    setClick("addExample", addExample);
    setClick("editExample", editExample);
    setClick("updateExample", updateExample);
    setClick("copyExample", copyExample);
    setClick("deleteExample", deleteExample);
    gebi("compositeKeyFieldsOnly").onchange = toggleExampleAddCkfsOnly;
    gebi("examplesQuerySelect").onchange = selectExamplesQuery;
    setClick("generateCode", generateCode);
    setClick("importNoSqlWBJson", importNoSqlWBJson);
    setClick("downloadState", downloadState);
    setClick("downloadStateFormatted", downloadStateFormatted);
    gebi("formatOptions").onchange = updateFieldFormat;
    setClick("addFormatEnum", addFormatEnum);
    setClick("removeFormatEnum", removeFormatEnum);
    setClick("facetFieldFilterHelp", facetFieldFilterHelp);
    
    // formatType, key, elementId
    const staticValueFields = { formatType: "updateFieldFormatStatic", key: "staticValue", elementId: "formatStaticValue"};
    const varcharValueFields = { formatType: "updateFieldFormatVarchar", key: "varcharValue", elementId: "formatVarcharValue"};
    const varnumValueFields = { formatType: "updateFieldFormatVarnum", key: "varnumValue", elementId: "formatVarnumValue"};
    const varwordValueFields = { formatType: "updateFieldFormatVarword", key: "varwordValue", elementId: "formatVarwordValue"};
    const staticBoolValueFields = { formatType: "updateFieldFormatStaticBool", key: "staticBoolValue", elementId: "formatStaticBoolValue"};
    const staticNumValueFields = { formatType: "updateFieldFormatStaticNum", key: "staticNumValue", elementId: "formatStaticNumValue"};
    const referenceValueFields = { formatType: "updateFieldFormatReference", key: "srefValue", elementId: "formatReferenceValue"};
    gebi("formatStaticValue").onkeydown = updateFieldFormatDynamic.bind(staticValueFields); // key presses trigger delayed saves to state to dynamic field
    gebi("formatStaticValue").onchange = updateFieldFormatDynamic.bind(staticValueFields);
    gebi("formatVarcharValue").onkeydown = updateFieldFormatDynamic.bind(varcharValueFields);
    gebi("formatVarcharValue").onchange = updateFieldFormatDynamic.bind(varcharValueFields);
    gebi("formatVarnumValue").onkeydown = updateFieldFormatDynamic.bind(varnumValueFields);
    gebi("formatVarnumValue").onchange = updateFieldFormatDynamic.bind(varnumValueFields);
    gebi("formatVarwordValue").onkeydown = updateFieldFormatDynamic.bind(varwordValueFields);
    gebi("formatVarwordValue").onchange = updateFieldFormatDynamic.bind(varwordValueFields);
    gebi("formatStaticBoolValue").onkeydown = updateFieldFormatDynamic.bind(staticBoolValueFields);
    gebi("formatStaticBoolValue").onchange = updateFieldFormatDynamic.bind(staticBoolValueFields);
    gebi("formatStaticNumValue").onkeydown = updateFieldFormatDynamic.bind(staticNumValueFields);
    gebi("formatStaticNumValue").onchange = updateFieldFormatDynamic.bind(staticNumValueFields);
    setFieldFormatVarNumV2EventListeners();
    gebi("formatReferenceValue").onchange = updateFieldFormatDynamic.bind(referenceValueFields);

    setClick("copyFormat", copyFormat);
    setClick("generateExample", generateExample);
    setClick("generateExamples", generateExamples);
    setClick("nukeExamples", nukeExamples);
    
    setEditorViewButtons();
    
    console.debug("PREP: Finished prep");
}

function getInputsOnPageRefresh() {
    checkSavedState();
    updateFieldFilterValue();
}

function setEditorViewButtons() {
    setClick("showTableStructureEditor", showTableStructureEditor);
    setClick("showQueryEditor", showQueryEditor);
    setClick("showExamplesEditor", showExamplesEditor);
    setClick("showCodegenieEditor", showCodegenieEditor);
}

function redrawPage() {
    try {
        let lastFocusedElement = document.activeElement;
        checkSavedState();
        redrawFacets();
        redrawFields();
        redrawCompositeEditor();
        redrawFormatEditor();
        showCurrentEditor();

        redrawQueries();
        redrawQueryEditArea();
        redrawIndices();
        redrawIndexEditArea();

        redrawExamplePage();

        redrawGeneratorOptions();
        
        updateFilteredFields();
        lastFocusedElement.focus();
    } catch (error) {
        alert("REDRAWPAGE: Redraw page failed, error: " + error);
        console.error("REDRAWPAGE: Redraw page failed, error: ", error);
    }
}

function checkSavedState() {
    // console.debug("CHECKSTATE: Checking saved state");
    const unchanged = JSON.stringify(APP_STATE) === JSON.stringify(APP_STATE_SAVED);
    setSavedFlag(unchanged);
    // console.debug(`CHECKSTATE: Unchanged = ${unchanged}`);
}

function setSavedFlag(isSaved) {
    const savedBanner = gebi("unsaved");
    const saveButton = gebi("saveState");

    
    const isVisible = !savedBanner.classList.contains("hidden");
    if (isSaved && isVisible) {
        saveButton.disabled = true;
        savedBanner.classList.add("hidden");
        window.onbeforeunload = undefined;
    } else if (!isSaved && !isVisible) {
        savedBanner.classList.remove("hidden");
        saveButton.disabled = false;
        window.onbeforeunload = function() { return "You have unsaved changes"; }
    }
}

function redrawFacets() {
    const facetListEle = gebi("facetList");
    Array.from(facetListEle.getElementsByTagName("li")).forEach(o => o.remove())
    gebi("editFacetName").disabled = !selectedFacet;
    gebi("deleteFacet").disabled = !selectedFacet;
    
    let facetNames = APP_STATE?.facets?.map(facet => facet.name);
    
    facetNames?.forEach(facet => {
        let facetEle = dce("li");
        facetEle.innerText = facet;
        facetEle.dataset.name = facet;
        facetEle.onclick = selectFacet.bind(facetEle);
        facetListEle.appendChild(facetEle);

        if (selectedFacet == facet) {
            facetEle.classList.add("highlightedfacet");
        }
    });

    gebi("editFacetName").disabled = !selectedFacet;
    gebi("deleteFacet").disabled = !selectedFacet;
}

function redrawFields() {
    const fieldListEle = gebi("fieldList");
    Array.from(fieldListEle.getElementsByTagName("li")).forEach(o => o.remove())
    gebi("addField").disabled = !selectedFacet;
    gebi("addFields").disabled = !selectedFacet;
    gebi("editField").disabled = !selectedField || !selectedFacet;
    gebi("deleteField").disabled = !selectedField || !selectedFacet;

    if (!selectedFacet) { redrawAllFields(); return; }
    
    let fields = getFacetByName(selectedFacet)?.fields ?? [];
    
    fields?.forEach(field => {
        let fieldEle = dce("li");
        let fieldLabelEle = dce("span");
        // fieldText = `${field}`;
        // fieldLabelEle.innerText = fieldText;
        let fieldText = `${selectedFacet}.${field.name}`;
        fieldLabelEle.innerText = field.name;
        fieldLabelEle.dataset.name = field.name;
        fieldLabelEle.dataset.facet = selectedFacet;
        fieldLabelEle.dataset.facetfieldname = fieldText;
        fieldLabelEle.onclick = selectField.bind(fieldLabelEle);
        fieldEle.appendChild(fieldLabelEle);
        fieldListEle.appendChild(fieldEle);

        let fieldTypeDropdownEle = getNewFieldTypeElement(selectedFacet, field.name);
        let fieldTypeDropdownEleFiller = fieldTypeDropdownEle.cloneNode(true);
        fieldTypeDropdownEle.classList.add("floater");
        fieldEle.appendChild(fieldTypeDropdownEle);
        
        fieldTypeDropdownEleFiller.classList.add("spacefiller");
        fieldEle.appendChild(fieldTypeDropdownEleFiller);

        if (selectedField == field.name) {
            fieldEle.classList.add("highlightedfield");
        }
    });
}

function redrawAllFields() {
    const fieldListEle = gebi("fieldList");
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    
    APP_STATE.facets.forEach(facet => {
        facet.fields.forEach(field => {
            let fieldEle = dce("li");
            let fieldLabelEle = dce("span");
            let fieldText = `${facet.name}.${field.name}`;
            fieldLabelEle.innerText = fieldText;
            fieldLabelEle.dataset.name = field.name;
            fieldLabelEle.dataset.facet = facet.name;
            fieldLabelEle.dataset.facetfieldname = fieldText;
            fieldLabelEle.onclick = selectField.bind(fieldLabelEle);
            fieldEle.appendChild(fieldLabelEle);
            fieldListEle.appendChild(fieldEle);

            let fieldTypeDropdownEle = getNewFieldTypeElement(facet.name, field.name);
            let fieldTypeDropdownEleFiller = fieldTypeDropdownEle.cloneNode(true);
            fieldTypeDropdownEle.classList.add("floater");
            fieldEle.appendChild(fieldTypeDropdownEle);

            fieldTypeDropdownEleFiller.classList.add("spacefiller");
            fieldEle.appendChild(fieldTypeDropdownEleFiller);

            if (facetName === facet.name && fieldName === field.name) {
                fieldEle.classList.add("highlightedfield");
            }
        });
    });
}

function redrawCompositeEditor() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    let field = getFacetFieldByNames(facetName, fieldName);
    
    // Flip visibility
    const editorVisible = field?.type === CONSTS.FIELD_TYPES.COMPOSITE;
    setCompositeEditorVisible(editorVisible);
    if (!editorVisible) { return; }

    fillCompositeDropdown();
}

function setCompositeEditorVisible(visible) {
    const editor = gebi("compositeEditor");
    const isVisible = !editor.classList.contains("hidden");

    if (visible && !isVisible) {
        editor.classList.remove("hidden");
    } else if (!visible && isVisible) {
        editor.classList.add("hidden");
    }
}

function fillCompositeDropdown() {
    selectedKey = undefined;
    const compositeDropdown = gebi("compositeKeyOptions");
    const compositeKeyList = gebi("compositeKeys");
    Array.from(compositeDropdown.getElementsByTagName("option")).forEach(o => o.innerText != "" && o.remove());
    Array.from(compositeKeyList.getElementsByTagName("option")).forEach(o => o.remove());
    
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();

    const compositeKey = gebi("compositeKeys");
    let field = getFacetFieldByNames(facetName, fieldName);
    field.keys.forEach(key => {
        let selectableKeyEle = dce("option");
        selectableKeyEle.innerText = key;
        selectableKeyEle.value = key;
        selectableKeyEle.dataset.field = key;
        selectableKeyEle.onclick = selectKey.bind(selectableKeyEle);
        compositeKey.appendChild(selectableKeyEle);
    });

    // Create our empty & static prompt options
    let selectableKeyEmptyValueEle = dce("option");
    let selectableKeyStaticValueEle = dce("option");
    selectableKeyEmptyValueEle.innerText = CONSTS.DROPDOWN_KEY_DEFAULT_LABEL;
    selectableKeyStaticValueEle.innerText = CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID;
    selectableKeyEmptyValueEle.value = "";
    selectableKeyStaticValueEle.value = CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID;

    compositeDropdown.appendChild(selectableKeyEmptyValueEle);
    compositeDropdown.appendChild(selectableKeyStaticValueEle);

    let fieldNames = getFacetByName(facetName).fields
        .filter(fieldToAdd => fieldToAdd.type !== CONSTS.FIELD_TYPES.COMPOSITE && !field.keys.includes(fieldToAdd.name))
        .map(field => field.name);

    // Create an element for each non-composite type field name
    fieldNames.forEach(fieldName => {
        let selectableKeyEle = dce("option");
        selectableKeyEle.value = fieldName;
        selectableKeyEle.innerText = fieldName;
        compositeDropdown.appendChild(selectableKeyEle);
    });
}

//
// Format values for fields
//
function redrawFormatEditor() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    let field = getFacetFieldByNames(facetName, fieldName);
    
    // Flip visibility
    const editorVisible = field?.type && field?.type !== "" && field?.type !== CONSTS.FIELD_TYPES.COMPOSITE;
    setFormatEditorVisible(editorVisible);
    if (!editorVisible) { return; }

    fillFormatTypeDropdown();
    redrawFormatFormElements();
}

function setFormatEditorVisible(visible) {
    const editor = gebi("formatEditor");
    const isVisible = !editor.classList.contains("hidden");

    if (visible && !isVisible) {
        editor.classList.remove("hidden");
    } else if (!visible && isVisible) {
        editor.classList.add("hidden");
    }
}

function setFieldFormatVarNumV2EventListeners() {
    const elementIdsToWatch = CONSTS.FORMAT_FIELDIDS_VARNUMV2;
    elementIdsToWatch.forEach(elementId => {
        const varNumV2ValueFields = { formatType: "updateFieldFormatVarNumV2", key: "varNumV2Value", elementId };
        gebi(elementId).onkeydown = updateFieldFormatDynamic.bind(varNumV2ValueFields);
        gebi(elementId).onchange = updateFieldFormatDynamic.bind(varNumV2ValueFields);
    });
}

function fillFormatTypeDropdown() {
    let formatOptionsEle = gebi("formatOptions");
    Array.from(formatOptionsEle.getElementsByTagName("option")).forEach(ele => ele.remove());

    // let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    // let field = getFacetFieldByNames(facetName, fieldName);
    let field = getCurrentFacetField();
    const fieldFormatType = field.format?.type;

    let formatTypes = CONSTS.FORMAT_TYPES[field.type];
    if (!formatTypes) {
        alert(`Couldn't find format type for this field type=[${field.type}], exiting fillFormatTypeDropdown`);
        return;
    }
    
    const optionEle = dce("option");
    optionEle.value = "";
    optionEle.innerText = CONSTS.DROPDOWN_KEY_DEFAULT_LABEL;
    formatOptionsEle.appendChild(optionEle);

    for (key of Object.keys(formatTypes)) {
        const formatType = formatTypes[key];
        const optionEle = dce("option");
        optionEle.innerText = formatType.label;
        optionEle.value = formatType.key;
        formatOptionsEle.appendChild(optionEle);
        if (fieldFormatType === formatType.key) { optionEle.selected = true; }
    };
}

function redrawFormatFormElements() {
    // Hide everything first
    const elementsToHide = ["addFormatEnum", "removeFormatEnum", "formatEnumList", "formatStaticValue", "copyFormat",
        "formatVarcharValueContainer",
        "formatVarnumValueContainer",
        "formatVarwordValueContainer",
        "formatStaticBoolValue",
        "formatStaticNumValueContainer",
        "formatVarnumV2ValueContainer",
        "formatReferenceValueContainer",
    ];

    addClassTo("hidden", elementsToHide);

    // Fill fields with data
    redrawEnumList();
    setFormatStaticValue();
    setFormatVarcharValue();
    setFormatVarnumValue();
    setFormatVarwordValue();
    setFormatStaticBoolValue();
    setFormatStaticNumValue();
    setFormatVarNumV2Value();
    redrawReferenceList();
    // setFormatReferenceValue();

    // Show the elements that make sense
    const formatType = getCurrentFieldFormatType();

    switch (formatType) {
        case CONSTS.FORMAT_TYPES.S.ENUMLIST.key: {
            const elementToShow = ["addFormatEnum", "removeFormatEnum", "formatEnumList", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.S.STATIC.key: {
            const elementToShow = ["formatStaticValue", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.S.VARCHAR.key: {
            const elementToShow = ["formatVarcharValueContainer", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.S.VARNUM.key: {
            const elementToShow = ["formatVarnumValueContainer", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.S.VARWORD.key: {
            const elementToShow = ["formatVarwordValueContainer", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.B.STATICBOOL.key: {
            const elementToShow = ["formatStaticBoolValue", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.N.STATICNUM.key: {
            const elementToShow = ["formatStaticNumValueContainer", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.N.VARNUMV2.key: {
            const elementToShow = ["formatVarnumV2ValueContainer", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }

        case CONSTS.FORMAT_TYPES.S.SREF.key: {
            const elementToShow = ["formatReferenceValueContainer", "copyFormat"];
            removeClassFrom("hidden", elementToShow);
            break;
        }
    }
}

function redrawEnumList() {
    const field = getCurrentFacetField();
    if (!field) { return; }

    const formatEnumListEle = gebi("formatEnumList");
    clearOptionElements(formatEnumListEle);

    field.format?.enumValues?.forEach(enumValue => {
        const optionEle = dce("option");
        optionEle.innerText = enumValue;
        optionEle.dataset.fieldname = field.name;
        formatEnumListEle.appendChild(optionEle);
    });
}

function setFormatStaticValue() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.S.STATIC.key) { return; }
    
    gebi("formatStaticValue").value = field.format.staticValue ?? "";
}

function setFormatVarcharValue() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.S.VARCHAR.key) { return; }

    gebi("formatVarcharValue").value = field.format.varcharValue;
}

function setFormatVarnumValue() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.S.VARNUM.key) { return; }

    gebi("formatVarnumValue").value = field.format.varnumValue ?? "";
}

function setFormatVarwordValue() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.S.VARWORD.key) { return; }

    gebi("formatVarwordValue").value = field.format.varwordValue ?? "";
}

function setFormatStaticBoolValue() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.B.STATICBOOL.key) { return; }
    
    gebi("formatStaticBoolValue").value = field.format.staticBoolValue ?? "";
}

function setFormatStaticNumValue() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.N.STATICNUM.key) { return; }
    
    gebi("formatStaticNumValue").value = field.format.staticNumValue ?? "";
}

function setFormatVarNumV2Value() {
    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.N.VARNUMV2.key) { return; }
    
    if (!field.format.varNumV2Value || field.format.varNumV2Value === "") { return; }

    try {
        const values = JSON.parse(field.format.varNumV2Value);
        CONSTS.FORMAT_FIELDIDS_VARNUMV2.forEach(fieldId => {
            const prefix = CONSTS.FORMAT_FIELDIDS_VARNUMV2_PREFIX;
            const settingsKey = fieldId.replace(prefix, "");
            const extractedValue = values[settingsKey];
            gebi(fieldId).value = extractedValue;
        });
    } catch (exception) {
        console.error(`Error while setting varNumV2 values=[${field.format.varNumV2Value}]. Expected if values are not set yet`, exception);
    }
}

function redrawReferenceList() {
    let dropdownEle = gebi("formatReferenceValue");
    let fields = APP_STATE.facets
        .map(facet => facet.fields.map(field => `${facet.name}.${field.name}`))
        .flat();
    
    dropdownEle.appendChild(dce("option"));

    fields.forEach(field => {
        let option = dce("option");
        option.innerText = field;
        dropdownEle.appendChild(option);
    });

    let field = getCurrentFacetField();
    if (field.format?.type !== CONSTS.FORMAT_TYPES.S.SREF.key) { return; }
    
    gebi("formatReferenceValue").value = field.format.srefValue ?? "";
}

//
// Query
//
function redrawQueries() {
    const queryListEle = gebi("queryList");
    Array.from(queryListEle.getElementsByTagName("li")).forEach(o => o.remove())
    gebi("editQueryName").disabled = !selectedQuery;
    gebi("deleteQuery").disabled = !selectedQuery;
    gebi("updateQuery").disabled = !selectedQuery;
    
    let queryNames = APP_STATE?.queries?.map(query => query.name);
    
    queryNames?.forEach(query => {
        let queryEle = dce("li");
        queryEle.innerText = query;
        queryEle.dataset.name = query;
        queryEle.onclick = selectQuery.bind(queryEle);
        queryListEle.appendChild(queryEle);

        if (selectedQuery == query) {
            queryEle.classList.add("highlightedquery");
        }
    });

    gebi("editQueryName").disabled = !selectedQuery;
    gebi("deleteQuery").disabled = !selectedQuery;
}

function redrawQueryEditArea() {
    let nameEle = gebi("queryName");
    let descrEle = gebi("queryDescription");
    let indexEle = gebi("queryIndex");

    nameEle.value = "";
    descrEle.value = "";
    Array.from(indexEle.getElementsByTagName("option")).forEach(o => o.remove())
    
    if (selectedQuery) {
        const query = getQueryByName(selectedQuery);
        nameEle.value = selectedQuery;
        descrEle.value = query.description;
        redrawQueryIndicesDropdown(query.index);
    }

    // Must happen after above to allow query's index dropdown to populate
    redrawQueryEditIndexArea();
}

function redrawQueryEditIndexArea() {
    let queryIndexName = gebi("queryIndex").value;
    let queryPkEle = gebi("queryPk");
    let querySkBeginsWithEle = gebi("querySkBeginsWith");
    
    queryPkEle.value = "";
    Array.from(querySkBeginsWithEle.getElementsByTagName("option")).forEach(o => o.remove())
    
    const query = getQueryByName(selectedQuery);
    if (!queryIndexName) { return; }
    const index = getIndexByName(queryIndexName);
    
    if (index?.pk) {
        const underlyingFacetFieldName = getFacetAndFieldByFullName(index.pk);
        const underlyingField = getFacetFieldByNames(underlyingFacetFieldName.facetName, underlyingFacetFieldName.fieldName);
        
        if (underlyingField.keys) {
            const fieldKeys = `${underlyingField.keys}`.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "").replace(",", CONSTS.DELIM);
            const queryPkFull = `${index.pk} -> ${fieldKeys}`;
            queryPkEle.value = queryPkFull;
        } else {
            // Non-composite key field
            const queryPkFull = `${index.pk} -> ${underlyingField.name}`;
            queryPkEle.value = queryPkFull;
        }
    }

    if (index?.sk) { redrawQuerySkDropdown(query.sk, index?.name); }
}

function redrawQueryIndicesDropdown(indexToSelect) {
    const queryIndexEle = gebi("queryIndex");
    Array.from(queryIndexEle.getElementsByTagName("option")).forEach(o => o.remove());

    let pleaseSelectOption = dce("option");
    pleaseSelectOption.value = "";
    pleaseSelectOption.innerText = CONSTS.DROPDOWN_KEY_DEFAULT_LABEL;
    queryIndexEle.appendChild(pleaseSelectOption);

    APP_STATE.indices?.forEach(index => {
        const option = dce("option");
        option.innerText = index.name;
        option.value = index.name;
        if (index.name === indexToSelect) { option.selected = true; }
        queryIndexEle.appendChild(option);
    });
}

function redrawQuerySkDropdown(selectedSkValue, indexName) {
    const querySkBeginsWithEle = gebi("querySkBeginsWith");
    Array.from(querySkBeginsWithEle.getElementsByTagName("option")).forEach(o => o.remove());
    if (!indexName) { return; }

    const index = getIndexByName(indexName);
    const underlyingFacetFieldName = getFacetAndFieldByFullName(index.sk);
    const underlyingField = getFacetFieldByNames(underlyingFacetFieldName.facetName, underlyingFacetFieldName.fieldName);

    // Empty/no-string option
    querySkBeginsWithEle.appendChild(dce("option"));

    // Single option if field is a non-composite key
    if (underlyingField.type !== CONSTS.FIELD_TYPES.COMPOSITE) {
        const option = dce("option");
        option.innerText = underlyingField.name;
        option.value = underlyingField.name;
        querySkBeginsWithEle.appendChild(option);
        if (selectedSkValue === underlyingField.name) { option.selected = true; }
        return;
    }

    let potentialSearch = "";
    for (field of underlyingField.keys) {
        let cleanedUpField = field.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "");
        potentialSearch += `${cleanedUpField}${CONSTS.DELIM}`;
        const usableSearchPattern = potentialSearch.slice(0, -1);

        const option = dce("option");
        option.innerText = usableSearchPattern;
        option.value = usableSearchPattern;
        querySkBeginsWithEle.appendChild(option);

        if (selectedSkValue === usableSearchPattern) { option.selected = true; }
    }
}

function redrawIndices() {
    const indexListEle = gebi("indexList");
    Array.from(indexListEle.getElementsByTagName("li")).forEach(o => o.remove())
    gebi("editIndexName").disabled = !selectedIndex;
    gebi("deleteIndex").disabled = !selectedIndex;
    gebi("updateIndex").disabled = !selectedIndex;
    
    let indexNames = APP_STATE?.indices?.map(index => index.name);
    
    indexNames?.forEach(index => {
        let indexEle = dce("li");
        indexEle.innerText = index;
        indexEle.dataset.name = index;
        indexEle.onclick = selectIndex.bind(indexEle);
        indexListEle.appendChild(indexEle);

        if (selectedIndex == index) {
            indexEle.classList.add("highlightedindex");
        }
    });

    gebi("editIndexName").disabled = !selectedIndex;
    gebi("deleteIndex").disabled = !selectedIndex;
}

function redrawIndexEditArea() {
    let nameEle = gebi("indexName");
    let descrEle = gebi("indexDescription");
    let pkEle = gebi("indexPk");
    let skEle = gebi("indexSk");

    nameEle.value = "";
    descrEle.value = "";
    Array.from(pkEle.getElementsByTagName("option")).forEach(o => o.remove())
    Array.from(skEle.getElementsByTagName("option")).forEach(o => o.remove())
    if (!selectedIndex) { return; }

    const index = getIndexByName(selectedIndex);
    nameEle.value = selectedIndex;
    descrEle.value = index.description;
    let allFields = APP_STATE.facets
        .map(facet => facet.fields.map(field => `${facet.name}.${field.name}`))
        .flat()
        // .filter((field, index, arr) => index == arr.indexOf(field)) // get unique items
        .sort(sortComparator);
    
    // Empty value
    pkEle.appendChild(dce("option"));
    skEle.appendChild(fieldEle2 = dce("option"));

    allFields.forEach(field => {
        const fieldEle1 = dce("option");
        const fieldEle2 = dce("option");
        fieldEle1.innerText = field;
        fieldEle2.innerText = field;
        fieldEle1.value = field;
        fieldEle2.value = field;
        pkEle.appendChild(fieldEle1);
        skEle.appendChild(fieldEle2);

        if (index.pk === field) { fieldEle1.selected = true; }
        if (index.sk === field) { fieldEle2.selected = true; }
    });
}

function updateFilteredFields() {
    let fieldElements = Array.from(gebi("fieldList").getElementsByTagName("li"));
    fieldElements.forEach(ele => { ele.classList.remove("hidden"); }); // Show all
    
    if (fieldFilterValue.trim().length === 0) { return; }
    let filterInputValue = fieldFilterValue.toLowerCase();
    const { facetName: selectedFacetName, fieldName: selectedFieldName } = getSelectedFacetAndFieldNames() ?? {};

    fieldElements.forEach(ele => {
            const fieldSpan = ele.getElementsByTagName("span")[0];
            const fieldName = fieldSpan.innerText.toLocaleLowerCase();
            const field = getFacetFieldByNames(fieldSpan.dataset.facet, fieldSpan.dataset.name);
            const isCurrentlySelectedField = fieldSpan.dataset.facet === selectedFacetName && fieldSpan.dataset.name === selectedFieldName;
            if ( !isCurrentlySelectedField && isFieldExcludedByFilter(fieldName, filterInputValue, field?.type, field?.format?.type) ) { ele.classList.add("hidden"); }
        });
}

function isFieldExcludedByFilter(fieldName, filterString, fieldType, fieldFormatType) {
    filterString = filterString.trim();
    if (filterString.length === 0) { return false; }

    let filters = filterString.split(" ");

    // Key prefixes: * == required, - == get rid of these, %B %N %S == show only specified type, &- == show fields without a format, &+ == show fields with a format
    let excluded = false;
    
    // Inclusion-based filtering first
    for (filter of filters) {
        const firstChar = filter.slice(0, 1);
        if (["*", "-", "%", "&"].includes(firstChar)) { continue; }
        
        excluded = true; // Exclude if there are actual things to exclude by
        
        if (fieldName.indexOf(filter) !== -1) { excluded = false; break; } // Include on the first one
    }

    if (excluded) { return excluded; }
    
    // Exclusion time
    // const hasOnlyOneFilter = filters.length === 1;
    for (filter of filters) {
        const firstChar = filter.slice(0, 1);
        if (!["*", "-", "%", "&"].includes(firstChar)) { continue; }

        if (firstChar === "*") {
            // excluded = false;
            if (filter.length === 1) { continue; } // Skip just single character asterisk
            if (fieldName.indexOf(filter.slice(1)) === -1) { return true; }
        } else if (firstChar === "-") {
            if (filter.length === 1) { // Skip just single character dash
                // if (hasOnlyOneFilter) { excluded = false; } // Shouldn't make everything invisible if there are no other filter terms
                continue; 
            }
            if (fieldName.indexOf(filter.slice(1)) !== -1) { return true; }
            // if (hasOnlyOneFilter) { excluded = false; }
        } else if (filter === "&-" || filter === "&+") {
            // excluded = false;
            if (filter === "&-") {
                if (fieldFormatType && fieldFormatType !== "") { return true; } // Exclude, it has a format type
            } else {
                if (!fieldFormatType || fieldFormatType === "") { return true; } // Exclude, it has NO format type
            }
        } else if (firstChar === "%") {
            // excluded = false;
            if (filter.length !== 2) { continue; } // Skip if just single percent
            const typeSpecified = filter.slice(1);
            if (fieldType?.toLowerCase() !== typeSpecified) { return true; }
        }
    }

    return excluded;
}

function redrawExamplePage() {
    redrawExampleButtons();
    redrawExampleFacetList();
    redrawExampleAddOrEditFieldsReset();
    redrawExampleAddFields();
    redrawExampleEditFields();
    
    redrawExamplesReadBar();
    redrawExampleDocuments();
}

function redrawExampleButtons() {
    gebi("generateExample").disabled = !selectedExampleFacetToAdd || selectedExampleFacetToAdd?.trim().length === 0;
    gebi("generateExamples").disabled = !selectedExampleFacetToAdd || selectedExampleFacetToAdd?.trim().length === 0;
    gebi("addExample").disabled = !selectedExampleFacetToAdd || selectedExampleFacetToAdd?.trim().length === 0;
    gebi("updateExample").disabled = !selectedExampleDocumentToEdit;
    gebi("cancelExample").disabled = !selectedExampleDocumentToEdit;
    gebi("editExample").disabled = !selectedExampleDocumentIndex;
    gebi("copyExample").disabled = !selectedExampleDocumentIndex;
    gebi("deleteExample").disabled = !selectedExampleDocumentIndex;
}

function redrawExampleFacetList() {
    const exampleFacetList = gebi("exampleFacetList");
    Array.from(exampleFacetList.getElementsByTagName("option")).forEach(element => element.remove());

    let pleaseSelectElement = dce("option");
    pleaseSelectElement.innerText = CONSTS.DROPDOWN_KEY_DEFAULT_LABEL;
    pleaseSelectElement.value = "";
    exampleFacetList.appendChild(pleaseSelectElement);

    APP_STATE.facets.forEach(facet => {
        let option = dce("option");
        option.innerText = facet.name;
        option.value = facet.name;
        exampleFacetList.appendChild(option);
        if (facet.name === selectedExampleFacetToAdd) { option.selected = true; }
    });
}

function redrawExampleAddOrEditFieldsReset() {
    Array.from(gebi("examplesNewBody").getElementsByTagName("tr"))
        .filter(ele => ele.id !== "examplesNewHeaderRow")
        .forEach(ele => ele.remove());
    
    let newTableHeaderRow = gebi("examplesNewHeaderRow");
    Array.from(newTableHeaderRow.getElementsByTagName("th")).forEach(headerCell => headerCell.remove());
}

function redrawExampleAddFields() {    
    if (!selectedExampleFacetToAdd || selectedExampleFacetToAdd.trim().length === 0) { return; }
    redrawExampleAddOrEditFields(selectedExampleFacetToAdd);
}

function redrawExampleEditFields() {    
    if (!selectedExampleDocumentToEdit || selectedExampleDocumentToEdit?.__facetName?.length === 0) { return; }
    redrawExampleAddOrEditFields(selectedExampleDocumentToEdit.__facetName, selectedExampleDocumentToEdit);
}

function redrawExampleAddOrEditFields(facetName, example) {
    const facet = getFacetByName(facetName);
    if (!facet) { return; }
    let newTableBody = gebi("examplesNewBody");
    let newRow = dce("tr");
    newRow.id = "examplesNewDocumentToAdd";
    newTableBody.appendChild(newRow);

    let customizedFacetFields = clone(facet.fields)
    let pk = customizedFacetFields.filter(field => field.name === "pk")[0];
    let sk = customizedFacetFields.filter(field => field.name === "sk")[0];
    customizedFacetFields = customizedFacetFields.filter(field => field.name !== "pk" && field.name !== "sk");
    customizedFacetFields.unshift(sk);
    customizedFacetFields.unshift(pk);

    const compositeKeyFields = facet.fields.map(field => field.keys).flat();
    let newTableHeaderRow = gebi("examplesNewHeaderRow");

    customizedFacetFields.forEach(field => {
        const isPartOfACompositeKeyField = compositeKeyFields.includes(field.name);
        let newTh = dce("th");
        newTh.innerText = field.name;
        if (isPartOfACompositeKeyField) { newTh.classList.add("composite-key-field-colorlabel"); }
        if (isPartOfACompositeKeyField || field.type === CONSTS.FIELD_TYPES.COMPOSITE) { newTh.classList.add("composite-key-field-toggleckfs"); }
        newTableHeaderRow.appendChild(newTh);
        
        // Input field
        let newInput = dce("input");
        newInput.id = `EXAMPLEFIELD#${field.name}`;
        newInput.dataset.fieldname = `${field.name}`;
        if (example) { newInput.value = example[field.name] ?? ""; }
        if (field.type === CONSTS.FIELD_TYPES.COMPOSITE) { newInput.readOnly = true; } // Must fill in other fields to fill these
        
        let newTd = dce("td");
        
        if (isPartOfACompositeKeyField) {
            newInput.onkeyup = updateNewExampleInputs;
            newInput.onchange = updateNewExampleInputs;
        }

        if (isPartOfACompositeKeyField || field.type === CONSTS.FIELD_TYPES.COMPOSITE) {
            newTd.classList.add("composite-key-field-toggleckfs");
        }
        
        if (!isPartOfACompositeKeyField && field.type !== CONSTS.FIELD_TYPES.COMPOSITE && gebi("compositeKeyFieldsOnly").checked) {
            newTh.classList.add("hidden");
            newTd.classList.add("hidden");
        }

        newTd.appendChild(newInput);
        
        newRow.appendChild(newTd);
    });
}

function redrawExampleDocuments() {
    // Clean all other rows out
    Array.from(examplesBody.getElementsByTagName("tr"))
        .filter(ele => !ele.classList.contains("dontDelete"))
        .forEach(ele => ele.remove());

    const examplesFilterPk = gebi("examplesFilterPk");
    const examplesFilterSk = gebi("examplesFilterSk");
    const isGeneralFilter = !examplesFilterPk.readOnly;

    createExamplesLabelRow("Included:");
    let excludedExamples = [];
    
    APP_STATE.examples.forEach((example, index) => {
        let excludedExample = createExampleRow(example, index, examplesFilterPk, examplesFilterSk, isGeneralFilter);
        if (excludedExample) { excludedExamples.push(excludedExample); }
    });
    
    createExamplesLabelRow("Excluded:");
    excludedExamples.forEach(example => {
        let { example: _example, index, examplesFilterPk, examplesFilterSk } = example;
        createExampleRow(_example, index, examplesFilterPk, examplesFilterSk, isGeneralFilter, false);
    });
}

function createExamplesLabelRow(label) {
    let examplesBody = gebi("examplesBody");
    let th = dce("th");
    th.innerText = label;
    let row = dce("tr");
    row.classList.add("examplesRowSpacing");
    row.appendChild(th);
    examplesBody.appendChild(row);
}

function createExampleRow(example, index, examplesFilterPk, examplesFilterSk, isGeneralFilter, filter = true) {
    let examplesBody = gebi("examplesBody");

    // TODO Determine if we show this
    // TODO Create example row

    const hasSk = typeof examplesFilterPk?.dataset.fieldname === "string" && typeof examplesFilterSk?.dataset.fieldname === "string";
    const pkKey = examplesFilterPk?.dataset.fieldname ?? "pk";
    const skKey = examplesFilterSk?.dataset.fieldname ?? "sk";
    const pkValue = example[pkKey]?.trim().length === 0 ? "-" : example[pkKey];
    const skValue = example[skKey]?.trim().length === 0 ? "-" : example[skKey];
    const returnableExcludedRowData = { example, index, examplesFilterPk, examplesFilterSk };
    if (filter && pkValue === undefined) { return returnableExcludedRowData; }
    if (filter && hasSk && skValue === undefined) { return returnableExcludedRowData; }

    // Filtering by queries/top row input fields
    if (filter
            && examplesFilterPk && examplesFilterPk.value.length !== 0
            && ((isGeneralFilter && pkValue.toLowerCase().indexOf(examplesFilterPk.value.toLowerCase()) === -1)
                || (!isGeneralFilter && pkValue !== examplesFilterPk.value))
     ) {
        return returnableExcludedRowData;
    }
    
    if (filter && examplesFilterSk
        && examplesFilterSk.value.length !== 0
        && hasSk
        && ((isGeneralFilter && skValue.toLowerCase().indexOf(examplesFilterSk.value.toLowerCase()) === -1)
            || (!isGeneralFilter && skValue.indexOf(examplesFilterSk.value) !== 0))
        ) {
        return returnableExcludedRowData;
    }

    let exampleRow = dce("tr");
    exampleRow.id = `exampleRow#${index}`;
    exampleRow.dataset.id = index;

    if (index == selectedExampleDocumentIndex) { exampleRow.classList.add("highlightedexample"); }
    
    let exampleTd = dce("td");
    exampleTd.title = `pk (${pkKey})`;
    exampleTd.innerText = pkValue;
    exampleRow.appendChild(exampleTd);
    exampleRow.onclick = selectExampleDocument;
    
    if (hasSk) {
        exampleTd = dce("td");
        exampleTd.title = `sk (${skKey})`;
        exampleTd.innerText = skValue;
        exampleRow.appendChild(exampleTd);
        exampleRow.onclick = selectExampleDocument;
    }

    let fieldIndex = 0;
    for (field in example) {
        if (fieldIndex++ <= 1 // Skip __facetName
            || field === pkKey
            || (hasSk && field === skKey)
            ) { continue; }

        let exampleTd = dce("td");
        exampleTd.title = field;
        exampleTd.innerText = example[field].trim().length === 0 ? "-" : example[field];
        exampleRow.appendChild(exampleTd);
        exampleRow.onclick = selectExampleDocument;
    }

    examplesBody.append(exampleRow);
    return;
}

function redrawExamplesReadBar() {
    redrawExamplesReadQuerySelector();
    redrawExamplesReadQueryInputs();
    redrawExampleQueryInputs();
    redrawExamplesReadTableInputsRowReset();
    redrawExamplesReadTableInputFields();
}

function redrawExamplesReadQuerySelector() {
    let examplesQuerySelectEle = gebi("examplesQuerySelect");
    Array.from(examplesQuerySelectEle.getElementsByTagName("option")).forEach(ele => ele.remove());

    let pleaseSelectEle = dce("option");
    pleaseSelectEle.innerText = " - Query/Index Filter -";
    pleaseSelectEle.value = "";
    examplesQuerySelectEle.appendChild(pleaseSelectEle);

    APP_STATE.indices.forEach(index => {
        let optionEle = dce("option");
        optionEle.innerText = index.name;
        optionEle.value = index.name;
        examplesQuerySelectEle.appendChild(optionEle);

        if (selectedExamplesQuery === index.name) { optionEle.selected = true; }
    });

    APP_STATE.queries.forEach(query => {
        let optionEle = dce("option");
        optionEle.innerText = query.name;
        optionEle.value = query.name;
        examplesQuerySelectEle.appendChild(optionEle);

        if (selectedExamplesQuery === query.name) { optionEle.selected = true; }
    });
}

function redrawExamplesReadQueryInputs() {
    const queryOrIndexName = gebi("examplesQuerySelect").value;
    let examplesQueryPkEle = gebi("examplesQueryPk");
    let examplesQuerySkEle = gebi("examplesQuerySk");
    examplesQueryPkEle.innerText = "";
    examplesQuerySkEle.innerText = "";

    let queryOrIndex = getQueryByName(queryOrIndexName);
    let index = null;
    if (!queryOrIndex) {
        index = getIndexByName(queryOrIndexName);
        if (!index) { return; }
    }

    // Fill inputs that explain index pk/sk next to dropdown
    index = index ?? getIndexByName(queryOrIndex.index);
    if (!index) {
        alert(`No index found for query/index [${queryOrIndexName}], please update query to have one`);
        return;
    }
    
    const underlyingFacetFieldName = getFacetAndFieldByFullName(index.pk);
    const underlyingField = getFacetFieldByNames(underlyingFacetFieldName.facetName, underlyingFacetFieldName.fieldName);
    if (!underlyingField) { return; }
    
    if (underlyingField?.keys) {
        const fieldKeys = `${underlyingField.keys}`.replaceAll(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "").replaceAll(",", CONSTS.DELIM);
        const queryPkFull = `${index.pk} -> ${fieldKeys}`;
        examplesQueryPkEle.innerText = queryPkFull;
    } else {
        // Non-composite key field
        const queryPkFull = `${index.pk} -> ${underlyingField.name}`;
        examplesQueryPkEle.innerText = queryPkFull;
    }

    examplesQuerySkEle.innerText = queryOrIndex?.sk ?? index.sk.split(".")[1];
}

function redrawExamplesReadTableInputsRowReset() {
    const queryOrIndexName = gebi("examplesQuerySelect").value;
    const query = getQueryByName(queryOrIndexName);
    const index = getIndexByName(query?.index ?? queryOrIndexName);
    Array.from(gebi("examplesHeaderRowQueryLabels").getElementsByTagName("th")).forEach(ele => ele.remove());
    Array.from(gebi("examplesHeaderRowQueryInputs").getElementsByTagName("th")).forEach(ele => ele.remove());

    // Add pk and sk
    let headerCellEle = dce("th");
    headerCellEle.innerText = "pk";

    let inputEle = dce("input");
    inputEle.id = "examplesFilterPk";
    inputEle.readOnly = queryOrIndexName.trim().length !== 0;
    inputEle.onkeyup = redrawExampleDocuments;
    inputEle.onchange = redrawExampleDocuments;
    inputEle.dataset.fieldname = "pk";
    if (index) { inputEle.dataset.fieldname = index.pk.split(".")[1]; }
    
    let inputCellEle = dce("th");
    inputCellEle.appendChild(inputEle);
    
    gebi("examplesHeaderRowQueryLabels").appendChild(headerCellEle);
    gebi("examplesHeaderRowQueryInputs").appendChild(inputCellEle);

    headerCellEle = dce("th");
    headerCellEle.innerText = "sk";
    
    inputEle = dce("input");
    inputEle.id = "examplesFilterSk";
    inputEle.dataset.fieldname = "sk";
    inputEle.onkeyup = redrawExampleDocuments;
    inputEle.onchange = redrawExampleDocuments;
    inputEle.readOnly = queryOrIndexName.trim().length !== 0;
    if (index && index.sk !== "") { inputEle.dataset.fieldname = index.sk.split(".")[1]; }
    
    inputCellEle = dce("th");
    inputCellEle.appendChild(inputEle);
    if (index && index.sk === "") {
        inputCellEle.classList.add("hidden");
        headerCellEle.classList.add("hidden");
    }

    gebi("examplesHeaderRowQueryLabels").appendChild(headerCellEle);
    gebi("examplesHeaderRowQueryInputs").appendChild(inputCellEle);
}

function redrawExamplesReadTableInputFields() {
    const queryOrIndexName = gebi("examplesQuerySelect").value;
    if (!getQueryByName(queryOrIndexName) && !getIndexByName(queryOrIndexName)) { return; }

    const fieldKeys = getFieldKeysByQueryName(queryOrIndexName) ?? getFieldKeysByIndexName(queryOrIndexName);
    if (!fieldKeys) { return; }
    let { pkFields , skFields } = fieldKeys;
    
    pkFields.forEach( pkField => {
        if (pkField.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) !== -1) { return; }
        let headerCellEle = dce("th");
        headerCellEle.innerText = pkField;

        let inputEle = dce("input");
        let inputCellEle = dce("th");
        inputCellEle.appendChild(inputEle);
        inputCellEle.onkeyup = updateExampleQueryInputs;
        inputCellEle.onchange = updateExampleQueryInputs;
        inputEle.dataset.fieldname = pkField;
        inputEle.classList.add(`examplesQueryInputField`);
        inputEle.value = examplesFilterValues?.[pkField] ?? "";
        
        gebi("examplesHeaderRowQueryLabels").appendChild(headerCellEle);
        gebi("examplesHeaderRowQueryInputs").appendChild(inputCellEle);
    });
    
    skFields.filter(skField => !pkFields.includes(skField))
        .forEach( skField => {
        if (skField.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) !== -1) { return; }
        let headerCellEle = dce("th");
        headerCellEle.innerText = skField;
        
        let inputEle = dce("input");
        let inputCellEle = dce("th");
        inputCellEle.appendChild(inputEle);
        inputCellEle.onkeyup = updateExampleQueryInputs;
        inputCellEle.onchange = updateExampleQueryInputs;
        inputEle.dataset.fieldname = skField;
        inputEle.classList.add(`examplesQueryInputField`);
        inputEle.value = examplesFilterValues?.[skField] ?? "";

        gebi("examplesHeaderRowQueryLabels").appendChild(headerCellEle);
        gebi("examplesHeaderRowQueryInputs").appendChild(inputCellEle);
    });
}

function redrawExampleQueryInputs() {
    let fieldKeys = getFieldKeysByQueryName(selectedExamplesQuery);

    if (!fieldKeys) {
        fieldKeys = getFieldKeysByIndexName(selectedExamplesQuery);
        if (!fieldKeys) { return; }
    }
    
    if (!Object.values(examplesFilterValues).some(val => val.length != 0)) {
        let pkField = gebi("examplesFilterPk") ?? {};
        let skField = gebi("examplesFilterSk") ?? {};
        pkField.value = "";
        skField.value = "";
    } else {
        let fieldKeyValuesArr = getKVArr(examplesFilterValues);
        // Get input fields and push into an object we can reference below
        let fields = fieldKeyValuesArr.reduce((prevVal, ele) => {
            prevVal[ele.key] = ele.value;
            return prevVal;
        }, {});
    
    
        // Bring together the pk/sk values we need
        const pkValue = fieldKeys.pkFields
            .reduce((prevVal, curVal) => {
                    if (curVal.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) !== -1) {
                        return [prevVal, curVal.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "")].flat();
                    } else {
                        return [prevVal, fields[curVal]].flat();
                    }
                }, []);

        const skValue = fieldKeys.skFields
            .reduce((prevVal, curVal) => {
                    if (curVal.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) !== -1) {
                        return [prevVal, curVal.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "")].flat();
                    } else {
                        return [prevVal, fields[curVal]].flat();
                    }
                }, [])
            .reduce((prevVal, curVal) => {
                if (prevVal.skippedLast) { return prevVal; }
                if (curVal.length === 0) { return { ...prevVal, skippedLast: true }; }
                prevVal.values.push(curVal);
                return prevVal;
            }, { skippedLast: false, values: []})
            .values;
        
        gebi("examplesFilterPk").value = pkValue.join(CONSTS.DELIM);
        gebi("examplesFilterSk").value = skValue.join(CONSTS.DELIM);
    }

    redrawExampleDocuments();
}

function toggleExampleAddCkfsOnly() {
    const showOnlyCkfs = this.checked;

    if (showOnlyCkfs) {
        [Array.from(gebi("examplesNewBody").getElementsByTagName("th")),
            Array.from(gebi("examplesNewBody").getElementsByTagName("td"))]
            .flat()
            .filter(ele => !ele.classList.contains("composite-key-field-toggleckfs"))
            .forEach(ele => {
                ele.classList.add("hidden")
            });
    } else {
        [Array.from(gebi("examplesNewBody").getElementsByTagName("th")),
            Array.from(gebi("examplesNewBody").getElementsByTagName("td"))]
            .flat()
            .filter(ele => !ele.classList.contains("composite-key-field-toggleckfs"))
            .forEach(ele => {
                ele.classList.remove("hidden")
            });
    }
}

function redrawGeneratorOptions() {
    const generatorTypeSelect = gebi("codeType");
    Object.keys(CONSTS.GENERATORFN).forEach(key => {
        let option = dce("option");
        option.innerText = key;
        generatorTypeSelect.appendChild(option);
    })
}

//
// Tabs
//
function showTableStructureEditor() { currentEditor = CONSTS.EDITORS.TABLESTRUCT; saveAppStateCurrentEditor(); }
function showQueryEditor() { currentEditor = CONSTS.EDITORS.QUERIES; saveAppStateCurrentEditor(); }
function showExamplesEditor() { currentEditor = CONSTS.EDITORS.EXAMPLES; saveAppStateCurrentEditor(); }
function showCodegenieEditor() { currentEditor = CONSTS.EDITORS.CODEGENIE; saveAppStateCurrentEditor(); }

function resetFocus() {
    let visibleInputs = Array.from(document.getElementsByTagName("input"))
    .filter(ele => ele.offsetHeight > 0 || ele.offsetWidth > 0);
    visibleInputs[0]?.focus();
    // console.debug("Resetting focus to", document.activeElement);
}

function showCurrentEditor() {
    const buttons = Array.from(document.getElementsByClassName("showEditorButton"));

    buttons.forEach(element => {
        const id = element.id.toLowerCase();
        const buttonToDisable = currentEditor.toLowerCase();
        element.disabled = id.indexOf(buttonToDisable) !== -1;
    });

    Array.from(document.getElementsByClassName("editView")).forEach(editor => {
        if (editor.classList.contains("hidden")) { return; }
        editor.classList.add("hidden");
    });

    const editor = document.getElementsByClassName(currentEditor)[0];

    if (!editor || !editor.classList.contains("editView")) {
        alert(`Couldn't find selected editor ${currentEditor}`);
        console.error(`Couldn't find selected editor ${currentEditor}`);
        return;
    }
    
    editor.classList.remove("hidden");
    resetFocus();
}
