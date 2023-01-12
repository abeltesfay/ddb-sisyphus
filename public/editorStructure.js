//
// Facets
//
function addFacet() {
    const name = prompt("Please provide a new, unique facet name")?.trim();
    if (!name) { return; }

    if (APP_STATE.facets.map(o => o.name).includes(name)) {
        alert("This name already exists, please choose another");
        return;
    }
    
    APP_STATE.facets.push(getNewFacet(name));
    APP_STATE.facets = APP_STATE.facets.sort((a, b) => sortComparator(a.name, b.name));
    redrawPage();

    console.debug("ADDFACET: New facet added:", name);
}

function selectFacet() {
    selectedFacet = this.innerText;
    selectedField = undefined;
    redrawPage();
}

function editFacetName() {
    if (!selectedFacet) { return; }
    console.debug(`EDITFACET: Editing facet name from ${selectedFacet}`);

    const name = prompt("Please provide a new, unique facet name")?.trim();
    if (!name) { return; }

    if (APP_STATE.facets.map(o => o.name).includes(name)) {
        alert("This name already exists, please choose another");
        return;
    }
    
    const oldFacetName = selectedFacet;
    let facet = getFacetByName(oldFacetName);
    facet.name = name;
    selectedFacet = name;
    redrawPage();

    console.debug(`EDITFACET: Facet name updated from ${oldFacetName} to ${name}`);
}

function deleteFacet() {
    if (!selectedFacet) { return; }
    if (!confirm(`Are you SURE you want to delete facet ${selectedFacet}?`)) { return; }

    const name = selectedFacet;
    const oldCount = APP_STATE.facets.length;
    APP_STATE.facets = APP_STATE.facets.filter(facet => facet.name !== selectedFacet);
    const newCount = APP_STATE.facets.length;
    selectedFacet = undefined;
    redrawPage();

    console.warn(`DELETEFACET: Removed a facet: ${name}. Old count=[${oldCount}], new count=[${newCount}]`);
}

//
// Fields
//
function selectField() {
    selectedField = this.innerText;
    redrawPage();
}

function selectFieldType() {
    const facetName = this.dataset.facet, fieldName = this.dataset.field;
    const typeValue = this.value;

    let field = getFacetFieldByNames(facetName, fieldName);
    field.type = typeValue;
    checkSavedState();
}

function addField() {
    if (!selectedFacet) { alert("Please select a facet first"); return; }

    const facet = getFacetByName(selectedFacet);
    const name = prompt("Please provide a new field name")?.trim();
    if (!name) { return; }
    if (facet?.fields?.map(field => field.name).includes?.(name)) { alert("Facet already contains this field"); return; }
    if (!Array.isArray(facet?.fields)) { facet.fields = []; }
    facet.fields.push(getNewField(name));

    facet.fields = facet.fields.sort((a, b) => sortComparator(a.name, b.name));
    
    redrawPage();
}

function addFields() {
    try {
        if (!selectedFacet) { alert("Please select a facet first"); return; }

        const facet = getFacetByName(selectedFacet);
        let fields = prompt("Please provide a comma-separated list of fields you want added, duplicates will be skipped:");
        if (!fields) { return; }

        fields = fields.split(",").filter(field => field.length !== 0).map(field => `"${field}"`).join(",");
        let fieldsAsArrayString = `[${fields}]`;
        const fieldNamesArr = JSON.parse(fieldsAsArrayString).sort((a, b) => sortComparator(a, b));

        if (!confirm(`Add all of these fields?\n\n${fieldNamesArr.join("\n")}`)) { return; }
        
        if (!Array.isArray(facet?.fields)) { facet.fields = []; }

        fieldNamesArr.forEach(fieldName => {
            if (facet?.fields?.map(field => field.name).includes?.(fieldName)) { return; }
            
            facet.fields.push(getNewField(fieldName));
        })

        facet.fields = facet.fields.sort((a, b) => sortComparator(a.name, b.name));
        redrawPage();
    } catch(exception) {
        alert("Error while trying to parse your fields: " + exception);
        console.error("Error while trying to parse your fields:", exception);
    }
}

function editFieldName() {
    if (!selectedFacet || !selectedField) { return; }
    console.debug(`EDITFIELD: Editing facet and field name from ${selectedFacet}.${selectedField}`);

    const name = prompt("Please provide a new field name")?.trim();
    let facet = getFacetByName(selectedFacet);
    if (!name ) { return; }
    if (facet?.fields?.includes?.(name)) { alert("Facet already contains this field"); return; }

    let index  = facet.fields.findIndex(field => field == selectField);
    facet.fields = facet.fields.filter(field => field !== selectedField);
    facet.fields.push(name);

    const oldFieldName = selectedField;
    selectedField = name;
    redrawPage();
    
    console.debug(`EDITFACET: Field name updated from ${selectedFacet}.${oldFieldName} to ${selectedFacet}.${name}`);
}

function deleteField() {
    if (!selectedFacet || !selectField) { return; }
    if (!confirm(`Are you SURE you want to delete field ${selectedFacet}.${selectedField}?`)) { return; }

    let facet = getFacetByName(selectedFacet);
    let name = selectedField;
    const oldCount = facet.fields.length;
    facet.fields = facet.fields.filter(field => field.name !== selectedField);
    const newCount = facet.fields.length;
    redrawPage();

    console.warn(`DELETEFIELD: Removed a field: ${selectedField}.${name}. Old count=[${oldCount}], new count=[${newCount}]`);
}


//
// Keys
//
function selectKey() {
    selectedKey = this.dataset.field;
}

function addKey() {
    let key = gebi("compositeKeyOptions").value;
    if (!key || key.trim().length === 0) { return; }
    
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName) { return; }

    let field = getFacetFieldByNames(facetName, fieldName);
    if (!Array.isArray(field.keys)) { field.keys = []; }

    if (field.keys.includes(key)) {
        alert("This would be a duplicate key");
        return;
    }

    if (key === CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID) {
        let newStaticValue = prompt("Please provide a static value to use:");
        
        if (!newStaticValue) {
            // Flip index to 0
            gebi("compositeKeyOptions").selectedIndex = 0;
            return;
        }

        newStaticValue = `${CONSTS.STATIC_COMPOSITE_KEY.PREFIX}${newStaticValue.toUpperCase()}`;
        field.keys.push(newStaticValue);
    } else {
        field.keys.push(key);
    }

    redrawPage();
}

function addKeyStatic() {
    let key = gebi("compositeKeyOptions").value;
    if (key !== CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID) { return; }
    addKey();
}

function moveKeyUp() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName || !selectedKey) { return; }

    // TODO Warning about moving keys around.. maybe flash the impacted queries?
    let field = getFacetFieldByNames(facetName, fieldName);
    if (field.keys.length <= 1) { return; }

    let index = field.keys.findIndex(o => o === selectedKey);
    if (index == 0) { return; }

    let currentKey = selectedKey;
    let upKey = field.keys[index - 1];
    field.keys[index - 1] = currentKey;
    field.keys[index] = upKey;
    redrawPage();

    selectedKey = currentKey;
    gebi("compositeKeys").selectedIndex = index - 1;
}

function moveKeyDown() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName || !selectedKey) { return; }
    
    // TODO Warning about moving keys around.. maybe flash the impacted queries?
    let field = getFacetFieldByNames(facetName, fieldName);
    if (field.keys.length <= 1) { return; }
    
    let index = field.keys.findIndex(o => o === selectedKey);
    if (index === field.keys.length - 1) { return; }

    let currentKey = selectedKey;
    let downKey = field.keys[index + 1];
    field.keys[index + 1] = currentKey;
    field.keys[index] = downKey;
    redrawPage();
    
    selectedKey = currentKey;
    gebi("compositeKeys").selectedIndex = index + 1;
}

function removeKey() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName || !selectedKey) { return; }

    if (!confirm(`Are you sure you want to remove key ${selectedKey} from ${facetName}.${fieldName}?`)) { return; }
    let field = getFacetFieldByNames(facetName, fieldName);
    if (field.type != CONSTS.FIELD_TYPES.COMPOSITE) {
        alert(`Field type is ${field.type}, but expected "${CONSTS.FIELD_TYPES.COMPOSITE}". Cannot remove field ${fieldName}.`);
        return;
    }

    let index = field.keys.findIndex(o => o === selectedKey);

    if (index === -1) {
        // Not found? Let's just remove the field at the array spot bc it's probably null/undefined/non-string
        let currentSelectedField = gebi("compositeKeys").selectedIndex;
        field.keys = field.keys.filter((key, filterIndex) => currentSelectedField !== filterIndex);
    } else {
        field.keys = field.keys.filter((key, filterIndex) => index !== filterIndex);
    }

    redrawPage();
}

function updateFieldFilterValue() {
    fieldFilterValue = gebi("fieldFilter").value.trim();
    updateFilteredFields();
}
