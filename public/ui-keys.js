function processKeys(event) {
    // Deselect facet
    if (event.key === "Escape") {
        resetEverything();

        redrawPage();
        resetFocusBasedOnEditor();
        return false;
    };

    if (currentEditor === CONSTS.EDITORS.TABLESTRUCT) {
        switch (event.key) {
            case ("ArrowDown"): { selectNextFacetField(); break; }
            case ("ArrowUp"): { selectPreviousFacetField(); break; }
        }
    }
}

function resetEverything() {
    selectedFacet = null;
    selectedField = null;
    selectedFacetAndField = null;
    selectedKey = null;
    selectedQuery = null;
    selectedIndex = null;
    selectedExampleFacetToAdd = null;
    selectedExampleDocumentToEdit = null;
    selectedExampleDocumentIndex = null;
    selectedExamplesQuery = null;
    examplesFilterValues = {};
    
    // currentEditor = CONSTS.EDITORS.TABLESTRUCT;
}

function resetFocusBasedOnEditor() {
    switch (currentEditor) {
        case CONSTS.EDITORS.TABLESTRUCT:
            gebi("fieldFilter").focus();
            break;
        case CONSTS.EDITORS.EXAMPLES:
            gebi("examplesFilterPk").focus();
            break;
    }
}

// Field specific fn
//
function handleFieldFilterKey(event) {
    updateFieldFilterValue();
} 