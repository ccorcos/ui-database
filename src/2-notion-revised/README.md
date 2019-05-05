# Notion Architecture Revised

- Database default records.
- AutoListener around database.
- `Cursor<Table>` for relations.
- namespace `App.Schema` for creating new stores.
- `db[table].set` and `db[table].get` to avoid raw strings.
