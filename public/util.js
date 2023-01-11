function clone(o) { return JSON.parse(JSON.stringify(o)); }

function sortComparator(a, b) {
    const aLower = a?.toLowerCase(), bLower = b?.toLowerCase();
    return aLower == bLower ? a > b : aLower > bLower;
}

function setClick(id, fn) {
    if (document.getElementById(id)) { document.getElementById(id).onclick = fn; }
}

// Default structure for some fields
function getDefaultAppState() { return { facets: [], queries: [], indices: {} }; };

function getNewFacet(name) { return { name, fields: [] }; }

function getNewField(name) { return { name, type: "", keys: [] } };

function getNewFieldTypeElement(facetName, fieldName) {
    let dropdown = document.createElement("select");
    dropdown.dataset.facet = facetName;
    dropdown.dataset.field = fieldName;
    dropdown.onchange = selectFieldType;

    dropdown.appendChild(document.createElement("option"));
    
    Object.values(CONSTS.FIELD_TYPES).forEach(value => {
        let dropdownEle = document.createElement("option");
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

    if (selectedField) {
        fieldNames = selectedField?.split(".");
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

function gebi(id) { return document.getElementById(id); }
function dce(tag) { return document.createElement(tag); }