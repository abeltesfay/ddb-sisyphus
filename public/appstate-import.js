function importNoSqlWBJson() {
    console.log("IMPORT: Starting import");
    // if (!confirm("This will blow away the current data and cannot be undone. Continue?")) { return; }
    
    // let importedData = prompt("Please copy paste your JSON here:");
    let importedData = TEMP_IMPORTABLE_JSON;
    if (!importedData) { return; }

    const importedObject = validateImport(importedData);
    if (!importedObject) { return; }
    
    importFieldsFacetsIndices(importedObject);
    
    console.log("IMPORT: Completed import");
}

function validateImport(json) {
    try {
        return JSON.parse(json);
    } catch(error) {
        alert("Error while validating json: " + error);
        console.error("Error while validating json: ", error);
    }
    return null;
}

function importFieldsFacetsIndices(o) {
    APP_STATE = getDefaultAppState();
    
    const model = o["DataModel"][0];
    const keys = getImportedTableKeyFieldNames(model);
    const facets = convertImportedFacets(model.TableFacets, keys);
    console.log(facets);
    // TODO Indices
    // TODO Examples

    // redrawPage();
}

function convertNSWBType(t) {
    const CONVERSION_MAP = {
        "S": "S",
        "N": "N",
        "BOOL": "B",
    };

    return CONVERSION_MAP[t];
}

function getImportedTableKeyFieldNames(model) {
    const key = "KeyAttributes",
        pk = "PartitionKey", sk = "SortKey",
        attributeName = "AttributeName", attributeType ="AttributeType";

    return {
        pk: {
            name: model[key][pk][attributeName],
            type: convertNSWBType(model[key][pk][attributeType]),
        },
        sk: {
            name: model[key][sk][attributeName],
            type: convertNSWBType(model[key][sk][attributeType]),
        },
    };
}

function convertImportedFacets(facets, keys) {
    return facets.map(facet => ({
        name: facet.FacetName,
        fields: getImportedFieldsFromFacet(facet, keys),
    }));
}

function getImportedFieldsFromFacet(facet, keys) {
    let pk = keys.pk;
    let sk = keys.sk;
    const nka = "NonKeyAttributes";
    const facetFields = facet[nka]?.map(
        field => ({
            name: field,
            type: "TBD",
        })
    );
    const fieldNames = [pk, sk, facetFields].flat();
    return fieldNames;
}