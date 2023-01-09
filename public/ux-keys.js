function processKeys(event) {
    // Deselect facet
    if (event.key === "Escape") {
        selectedFacet = null;
        selectedField = null;
        selectedKey = null;
        selectedQuery = null;
        
        // currentEditor = CONSTS.EDITORS.TABLESTRUCT;

        redrawPage();
    };
}