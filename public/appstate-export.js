function exportNoSqlWBJson() {
    console.debug("EXPORT: Starting export");
    
    const TableName = prompt("Please provide a table name:");
    if (!TableName) { return; }

    let convertedAppState = convertAppState(APP_STATE, TableName);
    
    const nosqlWbJson = JSON.stringify(convertedAppState, null, 2);
    // const nosqlWbJson = JSON.stringify(convertedAppState);
    
    downloadStateAsWBJson(nosqlWbJson);
    console.log(nosqlWbJson);
    
    console.debug("EXPORT: Completed export");
}

function downloadStateAsWBJson(contents) {
    // const contents = !formatted ? JSON.stringify(APP_STATE) : JSON.stringify(APP_STATE, null, 2);
    const typeOption = { type: "text/javascript" };
    const blob = new Blob([contents], typeOption);
    const href = window.URL.createObjectURL(blob);

    // const formattedId = formatted ? "Formatted" : ""
    const downloadState = gebi(`exportNoSqlWBJson`);
    downloadState.download = generateExportFilename();
    downloadState.href = href;
}

function generateExportFilename() {
    const FILEEXTENSION = "json";
    const FILENAME = "NoSQLWBTableModel";
    const datetimeStamp = getCurrentDatetimestampEasternTimeSlimAsString();

    return `${datetimeStamp}-${FILENAME}.${FILEEXTENSION}`;
}

function convertAppState(state, TableName) {
    let object = getPrefilledTopPortion();
    object["DataModel"] = [ getDataModel(state, TableName) ];

    return object;
}

function getPrefilledTopPortion() {
    return {
        "ModelName": "CONVERTED_DDBS",
        "ModelMetadata": {
          "Author": "",
          "DateCreated": "Nov 28, 2022, 11:43 AM",
          "DateLastModified": "Jan 05, 2023, 04:45 PM",
          "Description": "",
          "AWSService": "Amazon DynamoDB",
          "Version": "3.0"
        },
    };
}

function getDataModel(state, TableName) {
    const KeyAttributes = getKeyAttributes(),
        NonKeyAttributes = getNonKeyAttributes(state),
        TableFacets = getTableFacets(state),
        GlobalSecondaryIndexes = getGSIs(state),
        DataAccess = { "MySql": {} },
        BillingMode = "PROVISIONED";

    return {
        TableName,
        KeyAttributes,
        NonKeyAttributes,
        TableFacets,
        GlobalSecondaryIndexes,
        DataAccess,
        BillingMode,
        ProvisionedCapacitySettings: getProvisionedCapacitySettings(),
    }
}

function getKeyAttributes() {
    return {
        "PartitionKey": {
            "AttributeName": "pk",
            "AttributeType": "S"
          },
          "SortKey": {
            "AttributeName": "sk",
            "AttributeType": "S"
          }
    };
}

function getNonKeyAttributes(state) {
    let uniqueFieldNames = [];

    let allFacets = state.facets
        .map(facet => {
            return facet.fields.map(field => {
                return {
                    AttributeName: field.name,
                    AttributeType: CONSTS.FIELD_TYPES_NOSQLWBMAP[field.type],
                }
            });
        })
        .flat();

    let filteredFacets = [];
    
    const KNOWN_KEY_ATTRIBUTE_NAMES = ["pk", "sk"];

    allFacets.forEach(facet => {
        if (uniqueFieldNames.includes(facet.AttributeName) || KNOWN_KEY_ATTRIBUTE_NAMES.includes(facet.AttributeName)) { return; }
        uniqueFieldNames.push(facet.AttributeName);
        filteredFacets.push(facet);
    });

    return filteredFacets
}

function getTableFacets(state) {
    return state.facets
        .map(facet => ({
            FacetName: facet.name,
            KeyAttributeAlias: getTableFacetDefaultPartitionKeyAlias(),
            TableData: getTableDataFromExamples(state, facet.name),
            NonKeyAttributes: getTableFacetNonKeyAttributes(facet),
            DataAccess: getTableFacetDefaultDataAccess(),
        }));
}

function getTableFacetDefaultPartitionKeyAlias() {
    return { PartitionKeyAlias: "pk", SortKeyAlias: "sk" };
}

function getTableDataFromExamples(state, facetName) {
    const IGNOREABLE_KEYS = ["__facetName", "__dttm"];
    const facetFieldsLookup = state.facets
        .find(facet => facet.name === facetName)
        .fields
        .reduce((lookupMapByFieldName, field) => {
            lookupMapByFieldName[field.name] = field.type;
            return lookupMapByFieldName;
        }, {});

    const examplesForFacet = state.examples.filter(example => example.__facetName === facetName);
    return examplesForFacet.map(example => {
        const keys = Object.keys(example).filter(key => !IGNOREABLE_KEYS.includes(key));
        const convertedExample = {};

        for (let key of keys) {
            const fieldType = CONSTS.FIELD_TYPES_NOSQLWBMAP[facetFieldsLookup[key]];
            const fieldValue = getSafeFieldValue(fieldType, example[key]);
            if (fieldValue === "") { continue; } // Skip empty values
            convertedExample[key] = { [fieldType]: fieldValue };
        }

        return convertedExample;
    });
}

function getSafeFieldValue(type, value) {
    if (value === "") { return value; }

    switch (type) {
        case CONSTS.FIELD_TYPES_NOSQLWBMAP.S:
        case CONSTS.FIELD_TYPES_NOSQLWBMAP.C: { return value; }

        case CONSTS.FIELD_TYPES_NOSQLWBMAP.B: {
            return value === "true" ? true : false;
        }
        
        case CONSTS.FIELD_TYPES_NOSQLWBMAP.N: {
            return parseFloat(value);
        }
    }

    return "";
}

function getTableFacetNonKeyAttributes(facet) {
    const KNOWN_KEY_ATTRIBUTE_NAMES = ["pk", "sk"];

    return facet.fields
        .map(field => field.name)
        .filter(fieldName => !KNOWN_KEY_ATTRIBUTE_NAMES.includes(fieldName));
}

function getTableFacetDefaultDataAccess() {
    return { MySql: {} };
}

function getGSIs(state) {
    // return [ ...getGSIsFromIndexes(state) ];
    let allIndices = state.indices
        .map(index => ({ pk: index.pk?.split(".")?.[1], sk: index.sk?.split(".")?.[1] }))
        .map(index => {
            if (!index.pk) { return undefined; }
            let IndexName = index.pk + "-";
            IndexName += (index.sk ? index.sk + "-" : "") + "index";

            let gsi = {
                IndexName,
                KeyAttributes: {
                    PartitionKey: {
                        AttributeName: index.pk,
                        AttributeType: "S",
                    }
                },
                Projection: { ProjectionType: "ALL" }
            };

            if (index.sk) {
                gsi.KeyAttributes.SortKey = {
                    AttributeName: index.sk,
                    AttributeType: "S",
                }
            }

            return gsi;
        });

    let allIndicesFiltered = [], uniqueIndexNames = [];

    allIndices.forEach(index => {
        console.log(uniqueIndexNames);
        if (uniqueIndexNames.includes(index.IndexName)) { return; }
        uniqueIndexNames.push(index.IndexName);
        allIndicesFiltered.push(index);
    });

    return allIndicesFiltered;
}

// function getGSIsFromIndexes(state) {
//     return state
// }

function getProvisionedCapacitySettings() {
    return {
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        },
        "AutoScalingRead": {
          "ScalableTargetRequest": {
            "MinCapacity": 1,
            "MaxCapacity": 10,
            "ServiceRole": "AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"
          },
          "ScalingPolicyConfiguration": {
            "TargetValue": 70
          }
        },
        "AutoScalingWrite": {
          "ScalableTargetRequest": {
            "MinCapacity": 1,
            "MaxCapacity": 10,
            "ServiceRole": "AWSServiceRoleForApplicationAutoScaling_DynamoDBTable"
          },
          "ScalingPolicyConfiguration": {
            "TargetValue": 70
          }
        }
      };
}