let CONSTS = {
    LSKEY: "SISYPHUS_DATA",
    DELIM: "#",
    FIELD_TYPES: {
        STRING: "S",
        BOOLEAN: "B",
        NUMBER: "N",
        COMPOSITE: "C",
    },
    DROPDOWN_KEY_DEFAULT_LABEL: " - Please Select a Value - ",
    STATIC_COMPOSITE_KEY: {
        DROPDOWN_PROMPT_ID: "<STATIC_VALUE>",
        PREFIX: "STATIC: ",
    },
    EDITORS: {
        TABLESTRUCT: "tableStructureEditor",
        QUERIES: "queryEditor",
        EXAMPLES: "examplesEditor",
        CODEGENIE: "codegenieEditor",
    },
    GENERATORFN: {
        "Javascript Query Code": generateJavascript,
        "Object List": generateObjectList,
        "NoSQL Workbench Import": generateNSQLWBI,
        "Cloud Formation Table": generateCFT,
    },
    FORMAT_TYPES: {
        "S": {
            "ENUMLIST": { key: "ENUMLIST", label: "Enum" },
            "STATIC": { key: "STATIC", label: "Static" },
            "VARCHAR": { key: "VARCHAR", label: "Varchar" },
            "VARNUM": { key: "VARNUM", label: "Varnum" },
            "VARWORD": { key: "VARWORD", label: "Varword" },
        },
        "B": [
            
        ]
    }
};
