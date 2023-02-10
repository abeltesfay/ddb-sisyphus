let CONSTS = {
    LSKEY: "SISYPHUS_DATA",
    DELIM: "#",
    FIELD_TYPES: {
        STRING: "S",
        BOOLEAN: "B",
        NUMBER: "N",
        COMPOSITE: "C",
    },
    FIELD_TYPES_NOSQLWBMAP: {
        "S": "S",
        "B": "BOOL",
        "N": "N",
        "C": "S",
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
        "Javascript Query Code Class Fns": generateJavascriptClassFns,
        "Javascript Query Code Standalone": generateJavascript,
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
            "VARSDATE": { key: "VARSDATE", label: "Date", fn: generateSVarsdate, valueKey: "varsdateValue" },
            // "VARSTIME": { key: "VARSTIME", label: "Time", fn: generateSVarstime, valueKey: "vartimeValue" },
            // "VARSDTTM": { key: "VARSDTTM", label: "Datetime", fn: generateSVarsdttm, valueKey: "vardttmValue" },
            "SREF": { key: "SREF", label: "Reference", fn: generateSReference, valueKey: "srefValue" },
        },
        "B": {
            "STATICBOOL": { key: "STATICBOOL", label: "Static", fn: generateBStatic },
            "VARBOOL": { key: "VARBOOL", label: "Variable", fn: generateBVarbool },
        },
        "N": {
            "STATICNUM": { key: "STATICNUM", label: "Static", fn: generateNStatic },
            "VARNUMV2": { key: "VARNUMV2", label: "Variable", fn: generateNVarnum, valueKey: "varNumV2Value" },
        },
    },
    FORMAT_VALUES: {
        VALID_VARCHAR_CHARS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890",
        VALID_VARNUM_CHARS: "01234567890",
        VALID_VARWORD_CHARS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        VALID_REFERENCE_KEYS: ["SREF"],
    },
    FORMAT_FIELDIDS_VARNUMV2_PREFIX: "formatVarNumV2Value_",
    FORMAT_FIELDIDS_VARNUMV2: [
        "formatVarNumV2Value_Min",
        "formatVarNumV2Value_Max",
    ],
    FORMAT_FIELDIDS_VARSDATE_PREFIX: "formatVarsdateValue_",
    FORMAT_FIELDIDS_VARSDATE: [
        "formatVarsdateValue_Start",
        "formatVarsdateValue_End",
        "formatVarsdateValue_Format",
    ],
    FORMAT_FIELDIDS_VARSDATE_DEFAULT: "[y]-[m]-[d] [H]:[M]:[S].[Z] [PAM]",
};
