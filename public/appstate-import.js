function importNoSqlWBJson() {
    console.debug("IMPORT: Starting import");
    if (!confirm("This will blow away the current data and cannot be undone. Continue?")) { return; }

    resetEverything();
    
    let importedData = prompt("Please copy paste your JSON here:");
    // let importedData = TEMP_IMPORTABLE_JSON;
    if (!importedData) { return; }

    const importedObject = validateImport(importedData);
    if (!importedObject) { return; }
    
    importFieldsFacetsIndices(importedObject);
    
    console.debug("IMPORT: Completed import");
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
    const nonKeyAttributes = model["NonKeyAttributes"];
    const facets = convertImportedFacets(model.TableFacets, keys, nonKeyAttributes);
    const indices = convertImportedIndices(model.GlobalSecondaryIndexes, facets);
    const examples = convertImportedExamples(model.TableFacets);
    
    APP_STATE.facets = facets;
    APP_STATE.indices = indices;
    APP_STATE.examples = examples;

    redrawPage();
}

function convertNSWBType(t) {
    const CONVERSION_MAP = {
        "S": "S",
        "N": "N",
        "BOOL": "B",
    };

    return CONVERSION_MAP[t] ?? ""; // Default to empty string type if unconvertable
}

const IMPORT_CONSTS = {
    KEY: "KeyAttributes",
    PK: "PartitionKey",
    SK: "SortKey",
    ATTR_NAME: "AttributeName",
    ATTR_TYPE: "AttributeType",
};

function getImportedTableKeyFieldNames(model) {

    return {
        pk: {
            name: model[IMPORT_CONSTS.KEY][IMPORT_CONSTS.PK][IMPORT_CONSTS.ATTR_NAME],
            type: convertNSWBType(model[IMPORT_CONSTS.KEY][IMPORT_CONSTS.PK][IMPORT_CONSTS.ATTR_TYPE]),
        },
        sk: {
            name: model[IMPORT_CONSTS.KEY][IMPORT_CONSTS.SK][IMPORT_CONSTS.ATTR_NAME],
            type: convertNSWBType(model[IMPORT_CONSTS.KEY][IMPORT_CONSTS.SK][IMPORT_CONSTS.ATTR_TYPE]),
        },
    };
}

function convertImportedFacets(facets, keys, nkas) {
    return facets.map(facet => ({
        name: facet.FacetName,
        fields: getImportedFieldsFromFacet(facet, keys, nkas),
    }));
}

function getImportedFieldsFromFacet(facet, keys, nkas) {
    let pk = keys.pk;
    let sk = keys.sk;

    const nka = "NonKeyAttributes";
    const facetFields = facet[nka]?.map(
        field => ({
            name: field,
            type: getAttributeTypeByFieldName(field, nkas),
        })
    );

    const fieldNames = [pk, sk, facetFields].flat();
    return fieldNames;
}

function getAttributeTypeByFieldName(field, nkas) {
    const fieldType = nkas.filter(attribute => attribute[IMPORT_CONSTS.ATTR_NAME] === field)
        .map(attr => attr[IMPORT_CONSTS.ATTR_TYPE]);

    if (fieldType.length === 0) {
        console.error(`GETATTRTYPE: Error, found NO field ${field} in our data model. Returning empty string type.`);
        return "";
    }

    if (fieldType.length > 1) {
        console.error(`GETATTRTYPE: Error, found too many fields for ${field} in our data model: ${fieldType.length}. Returning the first one ${fieldType[0]}.`);
        return "";
    }

    return convertNSWBType(fieldType[0]);
}

function convertImportedIndices(indices, facets) {
    return indices.map(index => {
        const pkSkFullFacetName = getFirstFacetWithPkSk(facets, index);

        return {
            name: index.IndexName,
            description: "",
            pk: pkSkFullFacetName?.pk ?? "",
            sk: pkSkFullFacetName?.sk ?? "",
        };
    });
}

function getFirstFacetWithPkSk(facets, index) {
    let pk = index[IMPORT_CONSTS.KEY][IMPORT_CONSTS.PK][IMPORT_CONSTS.ATTR_NAME];
    let sk = index[IMPORT_CONSTS.KEY][IMPORT_CONSTS.SK]?.[IMPORT_CONSTS.ATTR_NAME];
    
    let finalFacets = facets.filter(facet => hasFields(facet, pk) && (!sk || hasFields(facet, sk)));
    if (finalFacets?.length === 0) { return undefined; }
    const finalFacet = finalFacets[0];

    return {
        pk: `${finalFacet.name}.${pk}`,
        sk: `${finalFacet.name}.${sk}`,
    };
}

function convertImportedExamples(facets, index) {
    const datetimeStamp = getDatetimeFormatted();

    const examples = facets.map(facet => {
            const facetExamples = facet.TableData.map(document => {
                let example = {
                    __facetName: facet.FacetName,
                    __dttm: datetimeStamp
                };

                for (key of Object.keys(document)) {
                    example[key] = `${getFirstValue(document[key])}`;
                }

                return example;
            })

            return facetExamples;
        })
        .flat();

    return examples;
}

function hasFields(facet, field) { return facet.fields.map(field => field.name).includes(field); }

function getFirstValue(field) {
    for (key of Object.keys(field)) {
        return field[key];
    }

    return "";
}