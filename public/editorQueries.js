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

function selectIndex() {
    selectedIndex = this.innerText;
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

function updateQuery() {
    if (!selectedQuery) { return; }

    let query = getQueryByName(selectedQuery)
    query.description = gebi("queryDescription").value
    query.index = gebi("queryIndex").value
    query.sk = gebi("querySkBeginsWith").value;
    redrawPage();
}

function editQueryName() {
    if (!selectedQuery) { return; }
    const newName = prompt(`Please provide a new, unique query name for "${selectedQuery}":`);
    if (!newName) { return; }

    const oldName = selectedQuery;
    const queryObj = APP_STATE.queries.find(query => query.name === selectedQuery);
    queryObj.name = newName;
    selectedQuery = newName;
    APP_STATE.queries = APP_STATE.queries.sort((a, b) => sortComparator(a.name, b.name));
    redrawPage();

    console.info(`EDITQUERY: Renamed a query: ${oldName} to ${newName}`);
}

//
// Indices
//
function addIndex() {
    const name = prompt("Please provide a new, unique index name")?.trim();
    if (!name) { return; }

    if (APP_STATE.indices.map(o => o.name).includes(name)) {
        alert("This name already exists, please choose another");
        return;
    }
    
    APP_STATE.indices.push(getNewIndex(name));
    APP_STATE.indices = APP_STATE.indices.sort((a, b) => sortComparator(a.name, b.name));
    redrawPage();

    console.debug("ADDINDEX: New index added:", name);
}

function editIndexName() {
    if (!selectedIndex) { return; }
    const newName = prompt(`Please provide a new, unique index name for "${selectedIndex}":`);
    if (!newName) { return; }

    if (APP_STATE.indices.map(o => o.name).includes(newName)) {
        alert("This name already exists, please choose another");
        return;
    }

    const oldName = selectedIndex;
    const indexObj = APP_STATE.indices.find(index => index.name === selectedIndex);
    indexObj.name = newName;
    selectedIndex = newName;
    APP_STATE.indices = APP_STATE.indices.sort((a, b) => sortComparator(a.name, b.name));
    
    // Update queries using this index
    APP_STATE.queries.forEach(
        query => {
            if (query.index !== oldName) { return; }
            query.index = newName;
        }
    );
    
    redrawPage();

    console.info(`EDITINDEX: Renamed an index: ${oldName} to ${newName}`);

}

function deleteIndex() {
    if (!selectedIndex) { return; }
    if (!confirm(`Are you SURE you want to delete index ${selectedIndex}?`)) { return; }

    const name = selectedIndex;
    const oldCount = APP_STATE.indices.length;
    APP_STATE.indices = APP_STATE.indices.filter(index => index.name !== selectedIndex);
    const newCount = APP_STATE.indices.length;
    selectedIndex = undefined;
    redrawPage();

    console.warn(`DELETEQUERY: Removed a index: ${name}. Old count=[${oldCount}], new count=[${newCount}]`);
}

function updateIndex() {
    if (!selectedIndex) { return; }

    let index = getIndexByName(selectedIndex)
    index.description = gebi("indexDescription").value
    index.pk = gebi("indexPk").value
    index.sk = gebi("indexSk").value
    redrawPage();
}