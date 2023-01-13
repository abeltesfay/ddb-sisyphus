function processKeys(event) {
    // Deselect facet
    if (event.key === "Escape") {
        resetEverything();

        gebi("fieldFilter").focus();
        redrawPage();
    };
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