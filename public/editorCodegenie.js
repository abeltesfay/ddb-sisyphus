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

function generateJavascript() {
    // TODO Display static query code
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
let JS_BASELINE = `
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

//
// Constants
//
CONSTS = {
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
function keyCombinerWithDelimiter(delimiter, ...args) { return args.join(delimiter); }

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