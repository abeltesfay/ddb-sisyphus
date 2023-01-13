Simple webapp to design dynamodb tables

# Features

- Create facets and their fields

- Update your fields with types (String, Boolean, Number, Composite) and formats

  - Structure your composite type fields (pks/sks/gsi fields) to be based off of other fields within the same object

- Use facets to create indexes

- Use indexes to make queries (read only)

- Use facets to create example documents

- Use fields' formats to generate example documents

- Use indexes and queries to filter those documents by pk/sk

- Import NoSQL Workbench exported JSON to get started

- Generate database read code for your queries in javascript

- Import and export your application state to share with teammates

- Re-order your queryable composite key fields, tweak your indexes and queries, and regenerate all of your test data quickly

# Run the webapp

Just open [index.html](./public/index.html) to get started

# Run it as a server

`npm i && npm start`