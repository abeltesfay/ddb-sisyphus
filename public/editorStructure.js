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
    selectedField = this.dataset.name;
    if (this.innerText.indexOf(".") !== -1) { selectedFacetAndField = this.dataset.facetfieldname; }
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
    Array.from(document.getElementsByTagName("span"))
        .filter(ele => ele.dataset.facet === selectedFacet && ele.dataset.name === name)?.[0]
        .parentElement
        .getElementsByClassName("floater")?.[0]
        .focus();
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

function editField() {
    if (!selectedFacet || !selectedField) { return; }
    console.debug(`EDITFIELD: Editing facet and field name from ${selectedFacet}.${selectedField}`);

    const name = prompt("Please provide a new field name")?.trim();
    let facet = getFacetByName(selectedFacet);
    if (!name ) { return; }
    if (facet?.fields?.includes?.(name)) { alert("Facet already contains this field"); return; }

    let index = facet.fields.findIndex(field => field.name === selectedField);
    facet.fields[index].name = name;
    facet.fields = facet.fields.sort((a, b) => sortComparator(a.name, b.name));

    const oldFieldName = selectedField;
    selectedField = name;
    redrawPage();
    
    console.debug(`EDITFACET: Field name updated from ${selectedFacet}.${oldFieldName} to ${selectedFacet}.${name}`);
}

function deleteField() {
    if (!selectedFacet || !selectField) { return; }
    if (!confirm(`Are you SURE you want to delete field ${selectedFacet}.${selectedField}?\nThis will delete the field in examples too!`)) { return; }

    let facet = getFacetByName(selectedFacet);
    let name = selectedField;
    const oldCount = facet.fields.length;
    facet.fields = facet.fields.filter(field => field.name !== selectedField);
    APP_STATE.examples.forEach(example => {
        if (example.__facetName !== facet.name) { return; }
        delete example[name];
    });
    const newCount = facet.fields.length;
    redrawPage();

    console.warn(`DELETEFIELD: Removed a field: ${selectedField}.${name}. Old count=[${oldCount}], new count=[${newCount}]`);
}

function toggleFieldDescriptions() {
    const elements = Array.from(gebc("fieldDescriptionWrapper"));
    let nextmode = elements?.[0]?.dataset.nextmode ?? "display";
    // Skip straight to edit if nothing to display
    if (nextmode === "display" && !(Array.from(gebc("fieldDescription")).some(ele => ele.innerText.length > 0))) { nextmode = "edit"; }
    console.log("Empty all", Array.from(gebc("fieldDescription")).some(ele => ele.innerText.length > 0));

    switch (nextmode) {
        case "edit": {
            elements.forEach(ele => {
                ele.dataset.mode = "edit";
                ele.dataset.nextmode = "hidden"

                ele.classList.remove("display");
                ele.classList.add("edit");
                ele.classList.remove("hidden");
            });
            break;
        };
        case "hidden": {
            elements.forEach(ele => {
                ele.dataset.mode = "hidden";
                ele.dataset.nextmode = "display"

                ele.classList.remove("display");
                ele.classList.remove("edit");
                ele.classList.add("hidden");
            });
            break;
        };
        case "display": {
            elements.forEach(ele => {
                ele.dataset.mode = "display";
                ele.dataset.nextmode = "edit"

                ele.classList.add("display");
                ele.classList.remove("edit");
                ele.classList.remove("hidden");
            });
            break;
        };
        default: {
            elements.forEach(ele => {
                ele.dataset.mode = "display";
                ele.dataset.nextmode = "edit"

                ele.classList.add("display");
                ele.classList.remove("edit");
                ele.classList.remove("hidden");
            });
            break;
        };
    }
}

let fieldDescriptionTimeout = null;

function updateFieldDescription() {
    clearTimeout(fieldDescriptionTimeout);
    fieldDescriptionTimeout = setTimeout(updateFieldDescriptionDelayed.bind(this), 300);
}

function updateFieldDescriptionDelayed() {
    const facetName = this.dataset.facetname;
    const fieldName = this.dataset.fieldname;
    const newDescription = this.value;
    let field = getFacetFieldByNames(facetName, fieldName);
    field.description = newDescription;
    checkSavedState();
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
    gebi("compositeKeyOptions").focus();
}

function addKeyStatic() {
    // let key = gebi("compositeKeyOptions").value;
    // if (key !== CONSTS.STATIC_COMPOSITE_KEY.DROPDOWN_PROMPT_ID) { return; }
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

function updateFieldFormat() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName) { return; }

    let field = getFacetFieldByNames(facetName, fieldName);
    if (!field?.format) { field.format = {}; }
    const fieldFormat = gebi("formatOptions").value;
    field.format.type = fieldFormat;
    redrawPage();
}

function addFormatEnum() {
    let newEnumValue = prompt("Please provide a string to add to list:");
    if (!newEnumValue) { return; }

    let field = getCurrentFacetField();
    if (!field) { alert("Couldn't find the current facet field."); return; }
    if (!Array.isArray(field.format.enumValues)) { field.format.enumValues = []; }
    if (field.format.enumValues.includes(newEnumValue)) { alert("Value already exists in list."); return; }

    field.format.enumValues.push(newEnumValue);
    redrawPage();
}

function removeFormatEnum() {
    let field = getCurrentFacetField();
    if (!field) { alert("Couldn't find the current facet field."); return; }

    const formatEnumValue = gebi("formatEnumList").value;

    field.format.enumValues = field.format.enumValues.filter(enumValue => enumValue !== formatEnumValue);
    redrawPage();
}

let timers = {
    "updateFieldFormatStatic": null, 
    "updateFieldFormatVarchar": null,
    "updateFieldFormatVarnum": null,
    "updateFieldFormatVarword": null,
    "updateFieldFormatStaticBool": null,
    "updateFieldFormatStaticNum": null,
    "updateFieldFormatVarNumV2": null,
    "updateFieldFormatReference": null,
    "updateFieldFormatVarsdate": null,
};

function updateFieldFormatDynamic(event) {
    if ([9, 16].includes(event.which)) { return; } // ignore shift and tab key & autorefocus to correct spot
    
    const { formatType, key, elementId } = this;
    clearTimeout(timers[formatType]);
    timers[formatType] = setTimeout(delayedUpdateFieldFormatDynamic.bind({ key, elementId }), 200);
}

function delayedUpdateFieldFormatDynamic() {
    let field = getCurrentFacetField();
    if (!field) { alert("Couldn't find the current facet field."); return; }

    const value = getFieldFormatDataByElementId(this.elementId);
    field.format[this.key] = autoformatField(this.key, value);
    redrawPage();
}

function getFieldFormatDataByElementId(elementId) {
    if (elementId.indexOf("formatVarNumV2Value") !== -1) {
        return getFieldFormatVarNumV2();
    } else if (elementId.indexOf("formatVarsdateValue") !== -1) {
        return getFieldFormatVarsdate();
    }

    return gebi(elementId).value;
}

function getFieldFormatVarNumV2() {
    const fieldIdsToScrape = CONSTS.FORMAT_FIELDIDS_VARNUMV2;
    const prefix = CONSTS.FORMAT_FIELDIDS_VARNUMV2_PREFIX;

    let values = fieldIdsToScrape.reduce((formatSettings, currentFieldId) => {
        const settingsKey = currentFieldId.replace(prefix, "");
        formatSettings[settingsKey] = gebi(currentFieldId).value;
        return formatSettings;
    }, {});
    
    return values;
}

function getFieldFormatVarsdate() {
    const fieldIdsToScrape = CONSTS.FORMAT_FIELDIDS_VARSDATE;
    const prefix = CONSTS.FORMAT_FIELDIDS_VARSDATE_PREFIX;

    let values = fieldIdsToScrape.reduce((formatSettings, currentFieldId) => {
        const settingsKey = currentFieldId.replace(prefix, "");
        formatSettings[settingsKey] = gebi(currentFieldId).value;
        return formatSettings;
    }, {});
    
    return values;
}

function autoformatVarXValue(value) {
    let safeNumber = parseInt(value, 10) ?? "";
    safeNumber = isNaN(safeNumber) ? "" : safeNumber;
    return safeNumber;
}

function autoformatStaticNumValue(value) {
    const firstCharIsNegative = value.length > 0 && value[0] === "-" ? "-" : "";
    const acceptableChars = "0123456789.,".split("");
    const filtered = value.split("")
        .filter(c => acceptableChars.includes(c))
        .join("");
    const multiplePeriods = filtered.indexOf(".") != filtered.lastIndexOf(".");
 
    if (!multiplePeriods) { return `${firstCharIsNegative}${filtered}`; }

    let filteredOnePeriod = filtered.split(".");
    filteredOnePeriod[0] += ".";
    return `${firstCharIsNegative}${filteredOnePeriod.join("")}`;
}

function autoformatVarNumV2Value(settings) {
    settings.Min = autoformatVarNumV2Value_MinMax(settings.Min)
    settings.Max = autoformatVarNumV2Value_MinMax(settings.Max)
    return JSON.stringify(settings);
}

function autoformatVarNumV2Value_MinMax(value) {
    value = value?.trim?.();
    if (!value || value.length === 0) { return value; }

    const firstCharIsNegative = value.length > 0 && value[0] === "-" ? "-" : "";
    const acceptableChars = "0123456789".split("");
    const filtered = value.split("")
        .filter(c => acceptableChars.includes(c))
        .join("");
 
    return `${firstCharIsNegative}${filtered}`;
}

function autoformatVarsdateValue(settings) {
    return JSON.stringify(settings);
}

function autoformatField(key, value) {
    const FIELD_AUTOFORMATTERS = {
        "varcharValue": autoformatVarXValue,
        "varnumValue": autoformatVarXValue,
        "varwordValue": autoformatVarXValue,
        "staticNumValue": autoformatStaticNumValue,
        "varNumV2Value": autoformatVarNumV2Value,
        "varsdateValue": autoformatVarsdateValue,
    };

    const fn = FIELD_AUTOFORMATTERS[key];
    if (!fn) { return value; }
    return fn(value); // Format if the function exists
}

function copyFormat() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName) {
        alert(`Can't copy if we haven't selected a facet=[${facetName}] and field=[${fieldName}]`);
        return;
    }

    let currentField = getFacetFieldByNames(facetName, fieldName);
    if (!currentField) { return; }

    let fieldsToCopyTo = Array.from(gebi("fieldList")?.getElementsByTagName("li"))
        .filter(ele => !ele.classList.contains("hidden"))
        .map(ele => ele.getElementsByTagName("span")[0])
        .filter(ele => ele.dataset.facet !== facetName || ele.dataset.name !== fieldName)
        .map(ele => getFacetFieldByNames(ele.dataset.facet, ele.dataset.name));
    
    const fieldCount = fieldsToCopyTo.length;

    if (fieldCount === 0) {
        alert("Found no other fields to copy to in the 'Fields' list.");
        return;
    }

    const fieldsWithFormatTypes = fieldsToCopyTo.filter(field => field.format?.type !== "");
    const addendum = fieldsWithFormatTypes.length === 0 ? "" : `\n\nFields with a type already specified: ${fieldsWithFormatTypes.length}`
    if (!confirm(`This will overwrite ${fieldCount} fields. ${addendum}\n\nAre you sure about this?`)) { return; }

    fieldsToCopyTo.forEach(field => {
        copyFormatValue(currentField, field);
    });

    redrawPage();
}

function copyFormatValue(fieldFrom, fieldTo) {
    switch (fieldFrom.format.type) {
        case "ENUMLIST": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.enumValues = fieldFrom.format.enumValues;
            break;
        }
        
        case "STATIC": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.staticValue = fieldFrom.format.staticValue;
            break;
        }
        
        case "VARCHAR": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.varcharValue = fieldFrom.format.varcharValue;
            break;
        }

        case "VARNUM": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.varnumValue = fieldFrom.format.varnumValue;
            break;
        }

        case "VARWORD": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.varwordValue = fieldFrom.format.varwordValue;
            break;
        }

        case "STATICBOOL": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.staticBoolValue = fieldFrom.format.staticBoolValue;
            break;
        }

        case "STATICNUM": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.staticNumValue = fieldFrom.format.staticNumValue;
            break;
        }

        case "VARSDATE": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format.varsdateValue = fieldFrom.format.varsdateValue;
            break;
        }

        case "SREF": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format[CONSTS.FORMAT_TYPES.S.SREF.valueKey] = fieldFrom.format[CONSTS.FORMAT_TYPES.S.SREF.valueKey];
            break;
        }

        case "VARNUMV2": {
            if (typeof fieldTo.format !== "object") { fieldTo.format = {}; }
            fieldTo.format[CONSTS.FORMAT_TYPES.N.VARNUMV2.valueKey] = fieldFrom.format[CONSTS.FORMAT_TYPES.N.VARNUMV2.valueKey];
            break;
        }
        
        default: {
            alert(`Unable to copy format value, type=[${fieldFrom.format.type}] was not found!`);
            return;
        }
    }
    
    fieldTo.format.type = fieldFrom.format.type;
}

function facetFieldFilterHelp() {
    alert(`FACET FIELD FILTER
This textbox can be used to filter visible fields. Useful when copying 1 field's format to 20+ others (for test data). Features:

Mostly inclusive OR filtering
"hello world" => fields with either "hello" or "world"
Case-insensitive

Shortcuts:
 - Hit escape to re-focus to this input textbox
 - "*apple bees" => any field with bees in it, fields MUST have apple in it
 - "-apple bees" => ignore fields with apple in it
 - "&+" => Has a specified format
 - "&-" => Missing a specified format
 - "%b" => Only boolean type
 - "%n" => Only number type
 - "%s" => Only string type
`);
}