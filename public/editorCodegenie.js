//
// Code genie
//
function generateCode() {
    const generatorType = gebi("codeType").value;
    const generatorFunction = CONSTS.GENERATORFN[generatorType];

    if (typeof generatorFunction !== "function") {
        alert(`Expect function type for option, function type was actually [${generatorFunction}]`);
        return;
    }

    generatorFunction();
}

//
// Class-only functions + indexes
//
function generateJavascriptClassFns() {
    const dynamicCode = generateDynamicJsClassFns();

    const code = `${dynamicCode}`;
    const textarea = gebi("codegenieWishArea");
    textarea.value = code.trim();
}

function generateDynamicJsClassFns() {
    let queriesString = [];
    let indexConstsStrings = generateIndices(APP_STATE.indices, true);

    for (query of APP_STATE.queries) {
        const code = generateQuery(query, true);
        queriesString.push(code);
    }

    return [indexConstsStrings, queriesString].flat().join("\n");
}

function generateQueryClassFns() {

}

//
// Full, standalone module that allows you to query with 1 npm i call + 1 generated database function call
//
function generateJavascript() {   
    const dynamicCode = generateDynamicJs();

    const code = `${JS_BASELINE}\n\n${dynamicCode}`;
    const textarea = gebi("codegenieWishArea");
    textarea.value = code.trim();
}

function generateDynamicJs() {
    let queriesString = [];
    let indexConstsStrings = generateIndices(APP_STATE.indices);

    for (query of APP_STATE.queries) {
        const code = generateQuery(query);
        queriesString.push(code);
    }

    return [indexConstsStrings, queriesString].flat().join("\n");
}

// function replaceFunctionName(code, str) { return code.replace("<<FUNC_NAME>>", str); }

function generateIndices(indices, isClassFns = false) {
    const uniquePkSkCombos = getUniquePkSkFieldNameCombos(indices);
    let constants = [];

    for (pkSkCombo of uniquePkSkCombos) {
        const code = generateIndexConstant(pkSkCombo);
        constants.push(code);
    }

    let indexes = constants.join("\n\t");
    let indexConstDefnObject = JS_INDEX_CONST_DEFN.replace("<<INDEXES>>", indexes);
    if (isClassFns) { indexConstDefnObject = indexConstDefnObject.substring("const ".length); }
    return indexConstDefnObject;
}

function getUniquePkSkFieldNameCombos(indices) {
    let uniqueKeys = [];
    let uniquePkSkCombos = indices.map(index => ({ pk: index.pk.split(".")[1], sk: index.sk.split(".")[1] }))
        .filter(combo => {
            if (combo.pk === "pk" && typeof combo.sk === "undefined") { return false; }
            const key = `${combo.pk}___$#$___${combo.sk}`;
            if (uniqueKeys.includes(key)) { return false; }
            uniqueKeys.push(key);
            return true;
        });

    return uniquePkSkCombos;
}

function generateIndexConstant(pkSkCombo) {
    const indexConstName = generateIndexConstNameFromPkSk(pkSkCombo.pk, pkSkCombo.sk);
    const indexAwsName = generateIndexAwsNameFromPkSk(pkSkCombo.pk, pkSkCombo.sk);

    const code = JS_INDEX_TEMPLATE.replace("<<INDEX_CONST_NAME>>", indexConstName)
        .replace("<<INDEX_AWS_NAME>>", indexAwsName)
        .replace("<<PK_NAME>>", pkSkCombo.pk)
        .replace("<<SK_NAME>>", pkSkCombo.sk);

    return code;
}

function generateIndexConstNameFromPkSk(pk, sk) {
    if (!sk || sk === "") {
        if (pk === "pk") {
            return "PK_SK_INDEX";
        }
        return `${pk}_INDEX`.toUpperCase();
    }
    return `${pk}_${sk}_INDEX`.toUpperCase();
}

function generateIndexAwsNameFromPkSk(pk, sk) {
    if (!sk || sk === "") { return `${pk}-index`.toLowerCase(); }
    return `${pkSkCombo.pk}-${pkSkCombo.sk}-index`.toLowerCase()
}

function generateQuery(query, isClassFns = false) {
    const functionParams = getParametersCsvFromQuery(query);
    const pkCompositeKeyFields = getPkCompositeKeyFieldsCsvFromQuery(query);
    const skCompositeKeyFields = getSkCompositeKeyFieldsCsvFromQuery(query);
    const indexToUse = generateIndexConstName(query.index);
    const isPkSkIndex = indexToUse === "TABLE_INDEXES.PK_SK_INDEX";
    let template = isPkSkIndex ? JS_FN_PKSKINDEX_TEMPLATE : JS_FN_ALTINDEX_TEMPLATE;
    // if (isClassFns) { template = isPkSkIndex ? JS_CLS_FN_PKSKINDEX_TEMPLATE : JS_CLS_FN_ALTINDEX_TEMPLATE; }

    let code = template
        .replaceAll("<<FUNC_NAME>>", query.name)
        .replaceAll("<<PARAM_FIELDS>>", functionParams)
        .replaceAll("<<PK_FIELDS>>", pkCompositeKeyFields)
        .replaceAll("<<SK_FIELDS>>", skCompositeKeyFields)
        .replaceAll("<<INDEX_CONST>>", indexToUse)
        .replaceAll("<<SK_BEGINS_WITH>>", query.skBeginsWith ?? true)
        .replaceAll("<<ENTITY_TYPE_CONST>>", query.entityTypeFilter ?? undefined)
        ;

    if (isClassFns) {
        // Remove first function in line
        code = "\nasync" + code.substring("\nasync function".length);

        // Add this to internal calls
        code = code.replace("getItemsByCommand", "this.getItemsByCommand");
        code = code.replace("getQueryCommandByPkOptionalSk", "this.getQueryCommandByPkOptionalSk");
        code = code.replace("getQueryCommandByIndexAndByPkOptionalSk(", "this.getQueryCommandByIndexAndByPkOptionalSk(this."); // Also replaces index reference
    }

    return code;
}

function getParametersCsvFromQuery(query) {
    const fieldKeys = getFieldKeysByQueryName(query.name);
    const pkParameters = fieldKeys.pkFields.filter(field => field.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) === -1);
    const skParameters = fieldKeys.skFields.filter(field => field.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) === -1);
    
    const parameters = [pkParameters, skParameters]
        .flat()
        .filter((field, index, arr) => index == arr.indexOf(field)) // get unique fields only

    return parameters.join(", ");
}

function getPkCompositeKeyFieldsCsvFromQuery(query) {
    const fieldKeys = getFieldKeysByQueryName(query.name);
    const pkParameters = fieldKeys.pkFields.map(field => {
        // Wrap static string values in double quotes
        if (field.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) !== -1) {
            return `"${field.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "")}"`;
        }

        return field; // Return parameter name
    });

    return pkParameters.join(", ");
}

function getSkCompositeKeyFieldsCsvFromQuery(query) {
    const fieldKeys = getFieldKeysByQueryName(query.name);
    const skParameters = fieldKeys.skFields.map(field => {
        // Wrap static string values in double quotes
        if (field.indexOf(CONSTS.STATIC_COMPOSITE_KEY.PREFIX) !== -1) {
            return [`"${field.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "")}"`, field.replace(CONSTS.STATIC_COMPOSITE_KEY.PREFIX, "")];
        }

        return [field, field]; // Return parameter name
    });
    
    let finalString = "";
    let skParametersFiltered = [];

    for (skParam of skParameters) {
        finalString += `${skParam[1]}${CONSTS.DELIM}`;
        const usableSearchPattern = finalString.slice(0, -1);
        if (usableSearchPattern.length > query.sk.length) { break; }
        
        skParametersFiltered.push(skParam[0]);
    }

    return skParametersFiltered.join(", ");
}

function generateIndexConstName(indexName) {
    const index = getIndexByName(indexName);
    const pk = index.pk.split(".")[1];
    const sk = index.sk.split(".")[1];     // TODO Handle case where sk doesn't exist/is empty
    const indexConstName = generateIndexConstNameFromPkSk(pk, sk);
    const indexReference = `TABLE_INDEXES.${indexConstName}`;
    return indexReference;
}

function generateObjectList() {
    alert("This is not yet implemented");
}

function generateNSQLWBI() {
    alert("This is not yet implemented");
}

function generateCFT() {
    alert("This is not yet implemented");
}


//
// Static code
//
// let JS_INDEX_TEMPLATE = `
// <<INDEX_CONST_NAME>>: {                 \t\t// e.g.: PK_SK_INDEX, SK_DATA_INDEX
//     name: '<<INDEX_AWS_NAME>>',         \t\t// e.g.: 'pk-sk-index', 'sk-data-index'
//     pk: { name: '<<PK_NAME>>' },        \t\t// e.g.: 'pk', 'sk'
//     sk: { name: '<<SK_NAME>>' },        \t\t// e.g.: 'sk', 'data'
// },`;

let JS_INDEX_TEMPLATE = `<<INDEX_CONST_NAME>>: { name: '<<INDEX_AWS_NAME>>', pk: { name: '<<PK_NAME>>' }, sk: { name: '<<SK_NAME>>' }, },`;
let JS_INDEX_CONST_DEFN = `const TABLE_INDEXES = {
\t<<INDEXES>>
};`

let JS_FN_PKSKINDEX_TEMPLATE = `
async function <<FUNC_NAME>>(<<PARAM_FIELDS>>) {
    const pk = keyCombiner(<<PK_FIELDS>>); // Example PK: EMPLOYEE#01234567
    const sk = keyCombiner(<<SK_FIELDS>>);
    const queryInput = getQueryCommandByPkOptionalSk(pk, sk, <<SK_BEGINS_WITH>>, <<ENTITY_TYPE_CONST>>);
    const results = await getItemsByCommand(queryInput);
    return results?.items;
}`;

let JS_FN_ALTINDEX_TEMPLATE = `
async function <<FUNC_NAME>>(<<PARAM_FIELDS>>) {
    const pk = keyCombiner(<<PK_FIELDS>>); // Example PK: EMPLOYEE#01234567
    const sk = keyCombiner(<<SK_FIELDS>>);
    const queryInput = getQueryCommandByIndexAndByPkOptionalSk(<<INDEX_CONST>>, pk, sk, <<SK_BEGINS_WITH>>, <<ENTITY_TYPE_CONST>>);
    const results = await getItemsByCommand(queryInput);
    return results?.items;
}`;

    // Example JS_FN_TEMPLATE output
    // async function getApplicationByApplicantEmployeeId(applicantEmployeeId, committeeId, term) {
    //     const pk = keyCombiner("APPLICANT", applicantEmployeeId); // Example PK: EMPLOYEE#01234567
    //     const sk = keyCombiner("COMMITTEE", committeeId, "TERM", term);
    //     const queryInput = getQueryCommandByIndexAndByPkOptionalSk(TABLE_INDEXES.PK_SK_INDEX, pk, sk, true, undefined);
    //     const results = await getItemsByCommand(queryInput);
    //     return results?.items;
    // }

let JS_BASELINE = `// npm i @aws-sdk/lib-dynamodb @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

//
// Constants
//
const CONSTS = {
    DATABASE: {
        DELIMITER_DEFAULT: "#",                 // Default delimiter between keys
        ENTITYTYPE: "EntityType",               // Consistent field name on all documents to do type filtering
        TABLE_NAME: process.env.DDB_TABLE_NAME, // Table name pulled from env vars
    },
};

//
// Util Fns
// 
function keyCombiner(...args) { return keyCombinerWithDelimiter(CONSTS.DATABASE.DELIMITER_DEFAULT, ...args); }
function keyCombinerWithDelimiter(delimiter, ...args) { return args.length === 0 ? undefined : args.join(delimiter); }

//
// DynamoDB Client
//
function getDocumentClient(client = new DynamoDBClient()) {
    const marshallOptions = {
        convertEmptyValues: false,
        removeUndefinedValues: false,
        convertClassInstanceToMap: false,
    };
    
    const unmarshallOptions = { wrapNumbers: false, };
    const translateConfig = { marshallOptions, unmarshallOptions };

    return DynamoDBDocumentClient.from(client, translateConfig);
}

const client = getDocumentClient();

//
// Query Help Fns
//
function getQueryCommandByPkOptionalSk(pk, sk, isBeginsWith, entityType, limitOptions) {
    const pkVariable = ":pkval", skVariable = ":skval", entityTypeVariable = ":entval";
    let KeyConditionExpression = \`pk = \${pkVariable}\`;

    let ExpressionAttributeValues = { [pkVariable]: pk };

    // Conditionally add sk
    if (sk) {
        ExpressionAttributeValues[skVariable] = sk;
        if (isBeginsWith) {
            // Case-sensitive search of sk
            KeyConditionExpression += \` AND begins_with ( sk , \${skVariable} )\`;
        } else {
            // Exact match on sk
            KeyConditionExpression += \` AND sk = \${skVariable}\`;
        }
    }
    
    let queryInput = {
        TableName: CONSTS.DATABASE.TABLE_NAME,
        KeyConditionExpression,
        ExpressionAttributeValues,
    };

    if (entityType) {
        // console.debug("Found entity type, adding Filter Expression to match");
        queryInput.FilterExpression = \`\${CONSTS.DATABASE.ENTITYTYPE} = \${entityTypeVariable}\`;
        ExpressionAttributeValues[entityTypeVariable] = entityType;
    }

    if (limitOptions) {
        queryInput.Limit = limitOptions.limit;
        queryInput.ExclusiveStartKey = limitOptions.lastEvaluatedKey;
    }

    return new QueryCommand(queryInput);
}


function getQueryCommandByIndexAndByPkOptionalSk(index, pkValue, skValue, isBeginsWith, entityType, limitOptions) {
    const pkVariable = ":pkval", skVariable = ":skval", entityTypeVariable = ":entval";
    const IndexName = index.name;
    
    let ExpressionAttributeNames = { "#PK": index.pk.name };
    let ExpressionAttributeValues = { [pkVariable]: pkValue };
    let KeyConditionExpression = \`#PK = \${pkVariable}\`;

    // Conditionally add sk
    if (skValue) {
        ExpressionAttributeNames["#SK"] = index.sk.name;
        ExpressionAttributeValues[skVariable] = skValue;
        if (isBeginsWith) {
            // Case-sensitive search of sk
            KeyConditionExpression += \` AND begins_with ( #SK , \${skVariable} )\`;
        } else {
            // Exact match on sk
            KeyConditionExpression += \` AND #SK = \${skVariable}\`;
        }
    }
    
    let queryInput = {
        TableName: CONSTS.DATABASE.TABLE_NAME,
        IndexName,
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };

    if (entityType) {
        // console.debug("Found entity type, adding Filter Expression to match");
        queryInput.FilterExpression = \`\${CONSTS.DATABASE.ENTITYTYPE} = \${entityTypeVariable}\`;
        ExpressionAttributeValues[entityTypeVariable] = entityType;
    }

    if (limitOptions) {
        queryInput.Limit = limitOptions.limit;
        queryInput.ExclusiveStartKey = limitOptions.lastEvaluatedKey;
    }

    return new QueryCommand(queryInput);
}

async function getItemsByCommand(command) {
    let results = { };

    try {
        results = await client.send(command);
    } catch(error) {
        console.error("Error when sending to client", error);
        results.error = error;
    }

    return results = { error: results.error, items: results?.Items, lastEvaluatedKey: results?.LastEvaluatedKey };
}

`;