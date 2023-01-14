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
            "ENUMLIST": { key: "ENUMLIST", label: "Enum", fn: generateSEnumList },
            "STATIC": { key: "STATIC", label: "Static", fn: generateSStatic },
            "VARCHAR": { key: "VARCHAR", label: "Varchar", fn: generateSVarchar },
            "VARNUM": { key: "VARNUM", label: "Varnum", fn: generateSVarnum },
            "VARWORD": { key: "VARWORD", label: "Varword", fn: generateSVarword },
        },
        "B": {
            "STATICBOOL": { key: "STATICBOOL", label: "Static", fn: generateBStatic },
            "VARBOOL": { key: "VARBOOL", label: "Variable", fn: generateBVarbool },
        },
        "N": {
            "STATICNUM": { key: "STATICNUM", label: "Static", fn: generateNStatic },
            "VARNUM": { key: "VARNUM", label: "Variable", fn: generateNVarnum },
        },
    },
    FORMAT_VALUES: {
        VALID_VARCHAR_CHARS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890",
        VALID_VARNUM_CHARS: "01234567890",
        VALID_VARWORD_CHARS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    }
};
