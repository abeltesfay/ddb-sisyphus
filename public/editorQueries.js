//
// Queries
//
function addQuery() {
    const name = prompt("Please provide a new, unique query name")?.trim();
    if (!name) { return; }

    if (APP_STATE.queries.map(o => o.name).includes(name)) {
        alert("This name already exists, please choose another");
        return;
    }
    
    APP_STATE.queries.push(getNewQuery(name));
    APP_STATE.queries = APP_STATE.queries.sort((a, b) => sortComparator(a.name, b.name));
    redrawPage();

    console.debug("ADDQUERY: New query added:", name);
}

function selectQuery() {
    selectedQuery = this.innerText;
    // selectedField = undefined;
    redrawPage();
}

function deleteQuery() {
    if (!selectedQuery) { return; }
    if (!confirm(`Are you SURE you want to delete query ${selectedQuery}?`)) { return; }

    const name = selectedQuery;
    const oldCount = APP_STATE.queries.length;
    APP_STATE.queries = APP_STATE.queries.filter(query => query.name !== selectedQuery);
    const newCount = APP_STATE.queries.length;
    selectedQuery = undefined;
    redrawPage();

    console.warn(`DELETEQUERY: Removed a query: ${name}. Old count=[${oldCount}], new count=[${newCount}]`);
}