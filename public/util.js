function clone(o) { return JSON.parse(JSON.stringify(o)); }

function sortComparator(a, b) {
    const aLower = a?.toLowerCase(), bLower = b?.toLowerCase();
    return aLower == bLower ? a > b : aLower > bLower;
}

function setClick(id, fn) {
    if (gebi(id)) { gebi(id).onclick = fn; }
}

function getDatetimeFormatted() {
    const dt = new Date();
    const month = new Intl.DateTimeFormat('en-US', {month: 'short'}).format(dt),
        day = dt.getDate(),
        year = dt.getFullYear(),
        hour = (dt.getHours() % 12) == 0 ? 12 : ('0' + (dt.getHours() % 12)).slice(-2),
        min = ('0' + dt.getMinutes()).slice(-2),
        ampm = dt.getHours() > 11 ? "PM" : "AM";
    return `${month} ${day}, ${year} ${hour}:${min} ${ampm}`;
}

function getCurrentDatetimestampEasternTimeSlimAsString(dt = new Date()) {
    const month = ('0' + (dt.getMonth() + 1)).slice(-2),
        day = ('0' + dt.getDate()).slice(-2),
        year = dt.getFullYear(),
        hour = ('0' + (dt.getHours() % 12)).slice(-2),
        min = ('0' + dt.getMinutes()).slice(-2),
        sec = ('0' + dt.getSeconds()).slice(-2),
        millis = ('0000' + dt.getMilliseconds()).slice(-4);
    return `${year}${month}${day}${hour}${min}${sec}${millis}`;
}

function getDateFormatted(dt = new Date()) {
    if (!isValidDate(dt)) { return undefined; }

    const month = ('0' + (dt.getMonth() + 1)).slice(-2)
        day = ('0' + dt.getDate()).slice(-2),
        year = dt.getFullYear();
    return `${year}-${month}-${day}`;
}

function getUniqueStringArrayValues(arr) {
    return arr.filter((field, index, arr) => index == arr.indexOf(field)) // get unique items
}

function gebi(id) { return document.getElementById(id); }
function dce(tag) { return document.createElement(tag); }
function addClassTo(clasz, elements) { elements.forEach(eleId => gebi(eleId)?.classList?.add(clasz)); }
function removeClassFrom(clasz, elements) { elements.forEach(eleId => gebi(eleId)?.classList?.remove(clasz)); }
function clearOptionElements(selectEle) { Array.from(selectEle?.getElementsByTagName("option"))?.forEach(ele => ele?.remove()); }


// Default structure for some fields
function getDefaultAppState() { return { currentEditor: CONSTS.EDITORS.TABLESTRUCT, facets: [], queries: [], indices: [], examples: [] }; };

function getNewFacet(name) { return { name, fields: [] }; }

function getNewField(name) { return { name, type: "", keys: [] } };

function getNewFieldTypeElement(facetName, fieldName) {
    let dropdown = dce("select");
    dropdown.dataset.facet = facetName;
    dropdown.dataset.field = fieldName;
    dropdown.onchange = selectFieldType;

    dropdown.appendChild(dce("option"));
    
    Object.values(CONSTS.FIELD_TYPES).forEach(value => {
        let dropdownEle = dce("option");
        dropdownEle.innerText = value;
        dropdown.appendChild(dropdownEle);
        if (value === getFacetFieldByNames(facetName, fieldName).type) { dropdownEle.selected = true; }
    });

    return dropdown;
}

function getNewQuery(name) {
    return {
        name,
        description: "",
        index: "",
        pk: [],
        sk: [],
    };
}

function getNewIndex(name) {
    return {
        name,
        description: "",
        pk: "",
        sk: "",
    };
}

// Simple element finders
function getFacetByName(name) {
    return APP_STATE.facets[APP_STATE.facets.findIndex(facet => facet.name == name)];
}

function getFacetFieldByNames(facetName, fieldName) {
    // console.debug(`GETFACET: ${facetName}.${fieldName}`);
    let facet = getFacetByName(facetName);
    let field = facet?.fields[facet.fields.findIndex(field => field.name == fieldName)];
    return field;
}

function getSelectedFacetAndFieldNames() {
    if (selectedFacet) {
        return { facetName: selectedFacet, fieldName: selectedField };
    }

    if (selectedFacetAndField) {
        fieldNames = selectedFacetAndField?.split(".");
        const facetName = fieldNames?.[0], fieldName = fieldNames?.[1];
        return { facetName, fieldName };
    }

    return { facetName: undefined, fieldName: undefined };
}

function getFacetAndFieldByFullName(fullname) {
    if (fullname) {
        fieldNames = fullname?.split(".");
        const facetName = fieldNames?.[0], fieldName = fieldNames?.[1];
        return { facetName, fieldName };
    }

    return { facetName: undefined, fieldName: undefined };
}

function getQueryByName(name) {
    return APP_STATE.queries[APP_STATE.queries.findIndex(query => query.name === name)];
}

function getIndexByName(name) {
    return APP_STATE.indices[APP_STATE.indices.findIndex(index => index.name === name)];
}

function getFieldKeysByQueryName(queryName) {
    const query = getQueryByName(queryName);
    if (!query) { return; }

    return getFieldKeysByIndexName(query.index);
}

function getFieldKeysByIndexName(indexName) {
    const index = getIndexByName(indexName);
    if (!index) { return; }
    
    let pkFields = [], skFields = [];

    const underlyingFacetFieldNamePk = getFacetAndFieldByFullName(index.pk);
    const underlyingFieldPk = getFacetFieldByNames(underlyingFacetFieldNamePk.facetName, underlyingFacetFieldNamePk.fieldName);
    if (!underlyingFieldPk) { return; }

    if (underlyingFieldPk.keys) {
        pkFields = [pkFields, clone(underlyingFieldPk.keys)].flat();
        // const fieldKeys = `${underlyingField.keys}`.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "").replace(",", CONSTS.DELIM);
        // const queryPkFull = `${index.pk} -> ${fieldKeys}`;
        // examplesQueryPkEle.value = queryPkFull;
    } else {
        // Non-composite key field
        pkFields.push(underlyingFieldPk.name);
    }

    const underlyingFacetFieldNameSk = getFacetAndFieldByFullName(index.sk);
    const underlyingFieldSk = getFacetFieldByNames(underlyingFacetFieldNameSk.facetName, underlyingFacetFieldNameSk.fieldName);

    if (underlyingFieldSk) {
        if (underlyingFieldSk.keys) {
            skFields = [skFields, clone(underlyingFieldSk.keys)].flat();
        } else {
            // Non-composite key field
            skFields.push(underlyingFieldSk.name);
        }
    }

    return { pkFields, skFields };
}

function getKVArr(o) { return Object.keys(o).map(key => ({ key, value: o[key] })); }

function getCurrentExampleFacetName() {
    if (selectedExampleDocumentToEdit) {
        return selectedExampleDocumentToEdit.__facetName;
    } else if (selectedExampleFacetToAdd) {
        return selectedExampleFacetToAdd;
    }

    return;
}

function getCurrentFieldFormatType() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName) { return; }
    
    return getFacetFieldByNames(facetName, fieldName)?.format?.type;
}

function getCurrentFacetField() {
    let { facetName, fieldName } = getSelectedFacetAndFieldNames();
    if (!facetName || !fieldName) { return; }

    let field = getFacetFieldByNames(facetName, fieldName);
    return field;
}

function getFacetNamesWithoutReferenceFormats() {
    return clone(APP_STATE.facets).filter(facet => facet.fields.every(field => {
        return field?.format?.type !== CONSTS.FORMAT_TYPES.S.SREF.key;
    }))
        .map(facet => facet.name);
}

function getFacetNamesWithReferenceFormats() {
    return clone(APP_STATE.facets).filter(facet => facet.fields.some(field => {
        return field?.format?.type === CONSTS.FORMAT_TYPES.S.SREF.key;
    }))
        .map(facet => facet.name);
}

function getCEGSelectedFacetNames(elementId) { return Array.from(gebi(elementId).getElementsByTagName("option")).map(option => option.value); }

//
// Validation
//
function isGoodExampleDocument(doc, duplicatesAreOkay = false) {
    if (!isObject(doc)) { alert(`Expected object, got type ${doc}`); return false; }
    if (isEmpty(doc.pk)) { alert(`Expected non-empty pk, got: "${doc.pk}"`); return false; }
    if (isEmpty(doc.sk)) { alert(`Expected non-empty sk, got: "${doc.sk}"`); return false; }

    // Check for duplicates
    let duplicateExamples = APP_STATE.examples.filter(example => example.pk === doc.pk && example.sk == doc.sk);
    if (!duplicatesAreOkay && duplicateExamples.length > 0) {
        alert(`This document is a duplicate for pk=[${doc.pk}], sk=[${doc.sk}]`);
        return false;
    }

    return true;
}

function isEmpty(o) { return isUndefinedNull(o) || !isString(o) || o.trim().length === 0;}
function isObject(o) { return !isUndefinedNull(o); }

function isUndefinedNull(o) { return typeof o === "undefined" || o === null; }
function isString(o) { return typeof o === "string"; }
function isNumbersOnly(o) { return isString(o) && o.length > 0 && o === getNumbersOnly(o); }
function isValidDate(o) { return o instanceof Date && !isNaN(o); }

function getNumbersOnly(o) {
    const acceptableChars = "0123456789".split("");
    return o?.split("")
        .filter(c => acceptableChars.includes(c))
        .join("");
}

//
// Generator functions
//
function generateSEnumList(field) {
    let possibleValues = field.format.enumValues;
    return possibleValues[Math.floor(Math.random() * possibleValues.length)];
}

function generateSStatic(field) { return field.format.staticValue; }

function generateVarStr(strLength, validChars) {
    const varcharLength = parseInt(strLength, 10) ?? 10;
    const validCharCount = validChars.length;
    let strArr = [];

    for(let i = 0; i < varcharLength; i++) {
        strArr.push(validChars[Math.floor(validCharCount * Math.random())]);
    }

    return strArr.join("");
}

function generateSVarchar(field) {
    return generateVarStr(field.format.varcharValue, CONSTS.FORMAT_VALUES.VALID_VARCHAR_CHARS);
}

function generateSVarnum(field) {
    return generateVarStr(field.format.varnumValue, CONSTS.FORMAT_VALUES.VALID_VARNUM_CHARS);
}

function generateSVarword(field) { return generateVarStr(field.format.varwordValue, CONSTS.FORMAT_VALUES.VALID_VARWORD_CHARS); }

function generateBStatic(field) { return field.format.staticBoolValue === "true" ? "true" : "false"; }

function generateBVarbool(field) { return Math.floor(Math.random() * 2) ? "true" : "false"; }

function generateNStatic(field) { return field.format.staticNumValue; }

function generateNVarnum(field) {
    try {
        const settings = JSON.parse(field.format.varNumV2Value);
        const min = parseInt(settings.Min, 10);
        const max = parseInt(settings.Max, 10);

        const number = Math.floor(Math.random() * ((max + 1) - min)) + min;

        return `${number}`;
    } catch (exception) {
        console.error(`Error in generateNVarnum for value=[${field.format.varNumV2Value}]`, exception);
    }

    return "";
}

function generateSReference(field, references) {
    const fieldFacetNameToReference = field.format[CONSTS.FORMAT_TYPES[field.type][field.format.type].valueKey].split(".");
    const example = references[fieldFacetNameToReference[0]];
    return example[fieldFacetNameToReference[1]];
}

function generateSVarsdate(field) {
    try {
        if (!field.format[CONSTS.FORMAT_TYPES.S.VARSDATE.valueKey]) { return; }
        
        const settings = JSON.parse(field.format[CONSTS.FORMAT_TYPES.S.VARSDATE.valueKey]);
        if (!isObject(settings)) { return; }

        const startDate = new Date(`${settings.Start}T00:00`);
        let endDate = new Date(`${settings.End}T00:00`);
        endDate.setDate(endDate.getDate() + 1);
        const startDateMs = startDate.getTime();
        const range = endDate.getTime() - startDateMs;
        const randomMilliseconds = Math.floor(Math.random() * range);
        const randomDate = new Date(randomMilliseconds + startDateMs);

        const randomDateFormatted = getDateFormatted(randomDate);
        // console.log(randomMilliseconds + startDateMs, randomDate, randomDateFormatted);
        if (!randomDate || randomDateFormatted?.split?.("-").length !== 3) { return ""; }

        return randomDateFormatted;
    } catch (exception) {
        console.error(`Error in generateSVarsdate for value=[${field.format.varNumV2Value}]`, exception);
    }
    return "";
}

// 
// Time functions
// 
function getTimeSinceMSM(startMillis) {
    let totalTimeMillis = getTimeSinceMs(startMillis);
    return convertTotalMillisToMSM(totalTimeMillis);
}

function convertTotalMillisToMSM(totalTimeMillis) {
    let millis = totalTimeMillis;
    let seconds = Math.floor(millis / 1000);
    let minutes = Math.floor(seconds / 60);

    millis = millis - (seconds * 1000);
    seconds = seconds - (minutes * 60);

    return { minutes, seconds, millis, totalTimeMillis };
}

function getTimeSinceMs(startMillis) { return new Date().getTime() - startMillis; }