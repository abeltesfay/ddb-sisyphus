function saveAppState() {
    console.debug("SAVEAPP: Saving application state");
    const validatedState = getValidatedState(APP_STATE);
    const dataAsString = JSON.stringify(validatedState);
    window.localStorage.setItem(CONSTS.LSKEY, dataAsString);
    APP_STATE = clone(validatedState);
    APP_STATE_SAVED = clone(APP_STATE);
    redrawPage();
    console.log(`SAVEAPP: Data saved to localStorage key=[${CONSTS.LSKEY}]`);
}

function saveAppStateCurrentEditor() {
    console.debug("SAVEAPP: Saving current editor to app state");
    APP_STATE.currentEditor = currentEditor;
    APP_STATE_SAVED.currentEditor = currentEditor;
    const dataAsString = JSON.stringify(APP_STATE_SAVED);
    window.localStorage.setItem(CONSTS.LSKEY, dataAsString);
    redrawPage();
    console.log(`SAVEAPP: Data saved to localStorage key=[${CONSTS.LSKEY}]`);
}

// Do some data shuffling/validating on object structure
function getValidatedState(state) {
    let newState = clone(state);
    
    newState.facets = newState.facets ?? [];
    newState.queries = newState.queries ?? [];
    newState.indices = newState.indices ?? [];
    newState.examples = newState.examples ?? [];
    
    newState.facets.forEach(facet => {
        facet.fields = facet.fields
            .map(field => {
                if (typeof field === "object" && !Array.isArray(field)) {
                    if (field.type === CONSTS.FIELD_TYPES.COMPOSITE) {
                        if (!Object.keys(field).includes("keys")) { field.keys = []; }
                    } else {
                        delete field.keys;
                    }
                    
                    return field;
                }
                
                console.error("Error for some reason this is not an array:", JSON.stringify(field));
                let finalField = {
                    name: field + "",
                    type: "",
                };

                return finalField;
            })
            .sort((a, b) => sortComparator(a.name, b.name));
    });

    newState.facets = newState.facets.sort((a, b) => sortComparator(a.name, b.name));

    return newState;
}

function loadFromOrbit() {
    console.warn("LOADROMORBIT: Confirming user is crazy");
    if (!confirm("Are you sure you want to load all of app state?")) { return; }
    let newAppStateStr;
    if (!(newAppStateStr = prompt("Please specify the entire app state").trim())) { return; }
    
    console.warn("LOADROMORBIT: Loading from orbit, hold on to something");

    try {
        let newAppState = JSON.parse(newAppStateStr);
        newAppState.facets.length;
    } catch (exception) {
        alert("LOADROMORBIT: Failed to parse JSON, please check data");
        console.error("LOADROMORBIT: Failed to parse JSON, please check load", exception);
        return;
    }

    window.localStorage.setItem(CONSTS.LSKEY, newAppStateStr);
    console.warn("LOADROMORBIT: Target is loaded");
    location.reload();
}

function nukeFromOrbit() {
    console.warn("NUKEFROMORBIT: Confirming user is crazy");
    if (!confirm("Are you sure you want to delete all of app state?")) { return; }
    
    console.warn("NUKEFROMORBIT: Nuking from orbit, hold on to your butts");
    window.localStorage.removeItem(CONSTS.LSKEY);
    console.warn("NUKEFROMORBIT: Target is cleared");
    location.reload();
}

function logState() {
    console.log("Saved state:", JSON.stringify(APP_STATE_SAVED));
    console.log("Current state:", JSON.stringify(APP_STATE));
}

function loadAppState() {
    console.debug("LOADAPP: Loading application from local storage")
    try {
        const data = window.localStorage.getItem(CONSTS.LSKEY);
        APP_STATE = JSON.parse(data) ?? getDefaultAppState();
        APP_STATE_SAVED = clone(APP_STATE);
        currentEditor = APP_STATE.currentEditor;
        console.debug(`LOADAPP: Application loaded from state, facets loaded: ${APP_STATE?.facets?.length ?? 0}`)
    } catch (error) {
        APP_STATE_SAVED = APP_STATE = { facets: [] };
        alert("LOADAPP: Error while loading app state. Highly recommend you log state and save to a text file: " + error);
        console.error("LOADAPP: Error while loading app state. Highly recommend you log state and save to a text file!", error);
    }
}

function downloadState() {
    const downloadState = gebi("downloadState");
    const contents = JSON.stringify(APP_STATE);
    const typeOption = { type: "text/javascript" };
    const blob = new Blob([contents], typeOption);
    const href = window.URL.createObjectURL(blob);
    downloadState.href = href;
    downloadState.download = generateDownloadFilename();
}

function generateDownloadFilename() {
    const FILEEXTENSION = "js";
    const FILENAME = "DynamoDBTableModel";
    const datetimeStamp = getCurrentDatetimestampEasternTimeSlimAsString();

    return `${datetimeStamp}-${FILENAME}.${FILEEXTENSION}`;
}