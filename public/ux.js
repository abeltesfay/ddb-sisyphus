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
    setClick("editFacetName", editFacetName);
    setClick("editFieldName", editFieldName);
    setClick("deleteFacet", deleteFacet);
    setClick("deleteField", deleteField);
    setClick("addKey", addKey);
    gebi("compositeKeyOptions").onchange = addKeyStatic;
    setClick("removeKey", removeKey);
    setClick("moveKeyUp", moveKeyUp);
    setClick("moveKeyDown", moveKeyDown);
    setClick("showTableStructureEditor", showTableStructureEditor);
    setClick("showQueryEditor", showQueryEditor);
    setClick("addQuery", addQuery);
    setClick("addIndex", addIndex);
    setClick("deleteQuery", deleteQuery);
    setClick("deleteIndex", deleteIndex);
    setClick("updateIndex", updateIndex);
    setClick("updateQuery", updateQuery);
    gebi("fieldFilter").onkeyup = updateFieldFilterValue;
    gebi("queryIndex").onchange = redrawQueryEditIndexArea;
    
    console.debug("PREP: Finished prep");
}

function getInputsOnPageRefresh() {
    checkSavedState();
    updateFieldFilterValue();
}

function redrawPage() {
    try {
        checkSavedState();
        redrawFacets();
        redrawFields();
        redrawCompositeEditor();
        showCurrentEditor();

        redrawQueries();
        redrawQueryEditArea();
        redrawIndices();
        redrawIndexEditArea();
        
        updateFilteredFields();
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
    const savedBanner = document.getElementById("unsaved");
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
    const facetListEle = document.getElementById("facetList");
    Array.from(facetListEle.getElementsByTagName("li")).forEach(o => o.remove())
    document.getElementById("editFacetName").disabled = !selectedFacet;
    document.getElementById("deleteFacet").disabled = !selectedFacet;
    
    let facetNames = APP_STATE?.facets?.map(facet => facet.name);
    
    facetNames?.forEach(facet => {
        let facetEle = document.createElement("li");
        facetEle.innerText = facet;
        facetEle.dataset.name = facet;
        facetEle.onclick = selectFacet.bind(facetEle);
        facetListEle.appendChild(facetEle);

        if (selectedFacet == facet) {
            facetEle.classList.add("highlightedfacet");
        }
    });

    document.getElementById("editFacetName").disabled = !selectedFacet;
    document.getElementById("deleteFacet").disabled = !selectedFacet;
}

function redrawFields() {
    const fieldListEle = document.getElementById("fieldList");
    Array.from(fieldListEle.getElementsByTagName("li")).forEach(o => o.remove())
    document.getElementById("editFieldName").disabled = !selectedField;
    document.getElementById("deleteField").disabled = !selectedField;

    if (!selectedFacet) { redrawAllFields(); return; }
    
    let fields = getFacetByName(selectedFacet).fields ?? [];
    
    fields?.forEach(field => {
        let fieldEle = document.createElement("li");
        let fieldLabelEle = document.createElement("span");
        // fieldText = `${field}`;
        // fieldLabelEle.innerText = fieldText;
        fieldLabelEle.innerText = field.name;
        fieldLabelEle.dataset.name = field.name;
        fieldLabelEle.dataset.facet = selectedFacet;
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
    const fieldListEle = document.getElementById("fieldList");
    
    APP_STATE.facets.forEach(facet => {
        facet.fields.forEach(field => {
            let fieldEle = document.createElement("li");
            let fieldLabelEle = document.createElement("span");
            fieldText = `${facet.name}.${field.name}`;
            fieldLabelEle.innerText = fieldText;
            fieldLabelEle.dataset.name = field.name;
            fieldLabelEle.dataset.facet = facet.name;
            fieldLabelEle.onclick = selectField.bind(fieldLabelEle);
            fieldEle.appendChild(fieldLabelEle);
            fieldListEle.appendChild(fieldEle);

            let fieldTypeDropdownEle = getNewFieldTypeElement(facet.name, field.name);
            let fieldTypeDropdownEleFiller = fieldTypeDropdownEle.cloneNode(true);
            fieldTypeDropdownEle.classList.add("floater");
            fieldEle.appendChild(fieldTypeDropdownEle);

            fieldTypeDropdownEleFiller.classList.add("spacefiller");
            fieldEle.appendChild(fieldTypeDropdownEleFiller);

            if (selectedField == fieldText) {
                fieldEle.classList.add("highlightedfield");
            }
        });
    });
}

function redrawCompositeEditor() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    let field = getFacetFieldByNames(facetName, fieldName);
    
    // Flip visibility
    const editorVisible = field?.type === "C";
    setCompositeEditorVisible(editorVisible);
    if (!editorVisible) { return; }

    fillCompositeDropdown();
}

function setCompositeEditorVisible(visible) {
    const editor = document.getElementById("compositeEditor");
    const isVisible = !editor.classList.contains("hidden");

    if (visible && !isVisible) {
        editor.classList.remove("hidden");
    } else if (!visible && isVisible) {
        editor.classList.add("hidden");
    }
}

function fillCompositeDropdown() {
    selectedKey = undefined;
    const compositeDropdown = document.getElementById("compositeKeyOptions");
    const compositeKeyList = document.getElementById("compositeKeys");
    Array.from(compositeDropdown.getElementsByTagName("option")).forEach(o => o.innerText != "" && o.remove());
    Array.from(compositeKeyList.getElementsByTagName("option")).forEach(o => o.remove());
    
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();

    const compositeKey = document.getElementById("compositeKeys");
    let field = getFacetFieldByNames(facetName, fieldName);
    field.keys.forEach(key => {
        let selectableKeyEle = document.createElement("option");
        selectableKeyEle.innerText = key;
        selectableKeyEle.dataset.field = key;
        selectableKeyEle.onclick = selectKey.bind(selectableKeyEle);
        compositeKey.appendChild(selectableKeyEle);
    });

    // Create our empty option
    const selectableKeyEmptyValueEle = document.createElement("option");
    let selectableKeyStaticValueEle = document.createElement("option");
    selectableKeyEmptyValueEle.innerText = CONSTS.DROPDOWN_KEY_DEFAULT_LABEL;
    selectableKeyStaticValueEle.value = CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID;
    selectableKeyStaticValueEle.innerText = CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID;

    compositeDropdown.appendChild(selectableKeyEmptyValueEle);
    compositeDropdown.appendChild(selectableKeyStaticValueEle);

    let fieldNames = getFacetByName(facetName).fields
        .filter(fieldToAdd => fieldToAdd.type !== "C" && !field.keys.includes(fieldToAdd.name))
        .map(field => field.name);

    // Create an element for each non-composite type field name
    fieldNames.forEach(fieldName => {
        let selectableKeyEle = document.createElement("option");
        selectableKeyEle.innerText = fieldName;
        compositeDropdown.appendChild(selectableKeyEle);
    });
}

function redrawQueries() {
    const queryListEle = document.getElementById("queryList");
    Array.from(queryListEle.getElementsByTagName("li")).forEach(o => o.remove())
    document.getElementById("editQueryName").disabled = !selectedQuery;
    document.getElementById("deleteQuery").disabled = !selectedQuery;
    document.getElementById("updateQuery").disabled = !selectedQuery;
    
    let queryNames = APP_STATE?.queries?.map(query => query.name);
    
    queryNames?.forEach(query => {
        let queryEle = document.createElement("li");
        queryEle.innerText = query;
        queryEle.dataset.name = query;
        queryEle.onclick = selectQuery.bind(queryEle);
        queryListEle.appendChild(queryEle);

        if (selectedQuery == query) {
            queryEle.classList.add("highlightedquery");
        }
    });

    document.getElementById("editQueryName").disabled = !selectedQuery;
    document.getElementById("deleteQuery").disabled = !selectedQuery;
}

function redrawQueryEditArea() {
    let nameEle = document.getElementById("queryName");
    let descrEle = document.getElementById("queryDescription");
    let indexEle = document.getElementById("queryIndex");

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
    let queryPkEle = document.getElementById("queryPk");
    let querySkBeginsWithEle = gebi("querySkBeginsWith");
    
    queryPkEle.value = "";
    Array.from(querySkBeginsWithEle.getElementsByTagName("option")).forEach(o => o.remove())
    
    const query = getQueryByName(selectedQuery);
    if (!queryIndexName) { return; }
    const index = getIndexByName(queryIndexName);
    
    if (index) {
        const underlyingFacetFieldName = getFacetAndFieldByFullName(index.pk);
        const underlyingField = getFacetFieldByNames(underlyingFacetFieldName.facetName, underlyingFacetFieldName.fieldName);
        const fieldKeys = `${underlyingField.keys}`.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "");
        const queryPkFull = `${index.pk} -> ${fieldKeys}`;
        queryPkEle.value = queryPkFull;
    }

    redrawQuerySkDropdown(query.sk, index.name);
}

function redrawQueryIndicesDropdown(indexToSelect) {
    const queryIndexEle = document.getElementById("queryIndex");
    Array.from(queryIndexEle.getElementsByTagName("option")).forEach(o => o.remove());

    queryIndexEle.appendChild(document.createElement("option"));

    APP_STATE.indices?.forEach(index => {
        const option = document.createElement("option");
        option.value = index.name;
        option.innerText = index.name;
        if (index.name === indexToSelect) { option.selected = true; }
        queryIndexEle.appendChild(option);
    });
}

function redrawQuerySkDropdown(selectedSkValue, indexName) {
    const querySkBeginsWithEle = document.getElementById("querySkBeginsWith");
    Array.from(querySkBeginsWithEle.getElementsByTagName("option")).forEach(o => o.remove());
    if (!indexName) { return; }

    const index = getIndexByName(indexName);
    const underlyingFacetFieldName = getFacetAndFieldByFullName(index.sk);
    const underlyingField = getFacetFieldByNames(underlyingFacetFieldName.facetName, underlyingFacetFieldName.fieldName);

    let potentialSearch = "";
    querySkBeginsWithEle.appendChild(document.createElement("option"));
    for (field of underlyingField.keys) {
        let cleanedUpField = field.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "");
        potentialSearch += `${cleanedUpField}${CONSTS.DELIM}`;
        const usableSearchPattern = potentialSearch.slice(0, -1);

        const option = document.createElement("option");
        option.value = usableSearchPattern;
        option.innerText = usableSearchPattern;
        querySkBeginsWithEle.appendChild(option);

        if (selectedSkValue === usableSearchPattern) { option.selected = true; }
    }
}

function redrawIndices() {
    const indexListEle = document.getElementById("indexList");
    Array.from(indexListEle.getElementsByTagName("li")).forEach(o => o.remove())
    document.getElementById("editIndexName").disabled = !selectedIndex;
    document.getElementById("deleteIndex").disabled = !selectedIndex;
    document.getElementById("updateIndex").disabled = !selectedIndex;
    
    let indexNames = APP_STATE?.indices?.map(index => index.name);
    
    indexNames?.forEach(index => {
        let indexEle = document.createElement("li");
        indexEle.innerText = index;
        indexEle.dataset.name = index;
        indexEle.onclick = selectIndex.bind(indexEle);
        indexListEle.appendChild(indexEle);

        if (selectedIndex == index) {
            indexEle.classList.add("highlightedindex");
        }
    });

    document.getElementById("editIndexName").disabled = !selectedIndex;
    document.getElementById("deleteIndex").disabled = !selectedIndex;
}

function redrawIndexEditArea() {
    let nameEle = document.getElementById("indexName");
    let descrEle = document.getElementById("indexDescription");
    let pkEle = document.getElementById("indexPk");
    let skEle = document.getElementById("indexSk");

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
    pkEle.appendChild(document.createElement("option"));
    skEle.appendChild(fieldEle2 = document.createElement("option"));

    allFields.forEach(field => {
        const fieldEle1 = document.createElement("option");
        const fieldEle2 = document.createElement("option");
        fieldEle1.value = field;
        fieldEle1.innerText = field;
        fieldEle2.value = field;
        fieldEle2.innerText = field;
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

    console.log("Filtering elements");
    fieldElements.forEach(ele => {
            const fieldName = ele.getElementsByTagName("span")[0].innerText;
            if (fieldName.indexOf(fieldFilterValue) === -1) { ele.classList.add("hidden"); }
        });
}

//
// Tabs
//
function showTableStructureEditor() { currentEditor = CONSTS.EDITORS.TABLESTRUCT; redrawPage(); }

function showQueryEditor() { currentEditor = CONSTS.EDITORS.QUERIES; redrawPage(); }

function showCurrentEditor() {
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
}
