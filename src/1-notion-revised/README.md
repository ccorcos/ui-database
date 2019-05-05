# Notion Architecture Revised

- Drop the vanilla Stores and make everything a RecordStore.
- Rather than keep track of listeners on each RecordStore class, keep track of listeners at the database level.
- Drop the RecordStore entirely and just use `db.get` and `db.set`.

## Analysis

- Seems to work pretty well in concept. However, `this.useStore` has some issues. (1) if the id changes, then we're leaking listeners to the old id. (2) If we have highly conditional logic for records that need to be listened to, then its going to be really painful to make this work properly.
	- We could try using some higher order components to create these listeners and fix issue (1) but that doesn't solve (2).
	- Perhaps we could be more explicit about the auto listening context, but this is actually really convenient for writing reactive logic.
- Ideally we would have tighter types.
	- `db[table].set` and `db[table].get` to avoid raw strings.
	- default values for record types.
	- Use some kind of `Cursor<Table>` type for relations to a specific type of store for safer types.
	- use namespaces to extend schema in a reusable way.

