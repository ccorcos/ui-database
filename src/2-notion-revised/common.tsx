import * as _ from "lodash"
import * as React from "react"
import * as PropTypes from "prop-types"

export function randomId() {
	return Math.round(Math.random() * 1e20).toString()
}

// This is where you define store types.
export interface TableToRecord {
	counter: { count: number }
	listOf: { itemIds: Array<string> }
}

export const defaultValues: {
	[Table in keyof TableToRecord]: TableToRecord[Table]
} = {
	counter: { count: 0 },
	listOf: { itemIds: [] },
}

export class Database {
	public recordMap: {
		[Table in keyof TableToRecord]?: {
			[id: string]: undefined | TableToRecord[Table]
		}
	} = {}

	public listeners: {
		[Table in keyof TableToRecord]?: {
			[id: string]:
				| undefined
				// Use a Map so that we can return the same unlistener each time.
				| Map<(record?: TableToRecord[Table] | undefined) => void, () => void>
		}
	} = {}

	public get<Table extends keyof TableToRecord>(
		table: Table,
		id: string
	): TableToRecord[Table] {
		if (!this.recordMap[table]) {
			this.recordMap[table] = {}
		}
		if (this.recordMap[table][id] === undefined) {
			this.recordMap[table][id] = _.cloneDeep(defaultValues[table])
			return this.recordMap[table][id]
		} else {
			return this.recordMap[table][id]
		}
	}

	public listen<Table extends keyof TableToRecord>(
		table: Table,
		id: string,
		onChange: (record?: TableToRecord[Table] | undefined) => void
	): () => void {
		if (!this.listeners[table]) {
			this.listeners[table] = {}
		}
		if (!this.listeners[table][id]) {
			this.listeners[table][id] = new Map()
		}
		if (this.listeners[table][id].has(onChange)) {
			return this.listeners[table][id].get(onChange)
		}
		const onStop = () => {
			if (this.listeners[table]) {
				if (this.listeners[table][id]) {
					this.listeners[table][id].delete(onChange)
					if (this.listeners[table][id].size === 0) {
						delete this.listeners[table][id]
					}
				}
			}
		}
		this.listeners[table][id].set(onChange, onStop)
		return onStop
	}

	public autolisten(fn: () => void, onChange: () => void) {}

	public pendingEmit: {
		[Table in keyof TableToRecord]?: {
			[id: string]: undefined | true
		}
	} = {}

	public set<Table extends keyof TableToRecord>(
		table: Table,
		id: string,
		value: TableToRecord[Table]
	) {
		if (!this.recordMap[table]) {
			this.recordMap[table] = {}
		}
		this.recordMap[table][id] = value

		// Set pendingEmit so we can flush all emits at once without emitting
		// more than once in one synchronous transaction.
		if (!this.pendingEmit[table]) {
			this.pendingEmit[table] = {}
		}
		this.pendingEmit[table][id] = true

		// Emit all changes on the next tick.
		setTimeout(() => {
			for (const table in this.pendingEmit) {
				for (const id in this.pendingEmit[table]) {
					this.emit(table as keyof TableToRecord, id)
				}
			}
			this.pendingEmit = {}
		})
	}

	public emit(table: keyof TableToRecord, id: string) {
		const tableMap = this.listeners[table]
		if (tableMap) {
			const idMap = tableMap[id]
			if (idMap) {
				for (const onChange of Array.from<any>(idMap.keys())) {
					onChange(this.get(table, id))
				}
			}
		}
	}

	// TODO: cleanup listeners? emit?
	public remove(table: keyof TableToRecord, id: string) {
		const tableMap = this.recordMap[table]
		if (tableMap) {
			delete tableMap[id]
		}
	}
}

export class DatabaseContext extends React.PureComponent<{ db: Database }> {
	static childContextTypes = {
		db: PropTypes.any,
	}

	getChildContext() {
		return {
			db: this.props.db,
		}
	}

	render() {
		return this.props.children
	}
}

export class Component<P> extends React.PureComponent<P> {
	static contextTypes = {
		db: PropTypes.any,
	}
	context: { db: Database }

	listeners = new Set<() => void>()

	rerender = () => this.forceUpdate()

	useStore<T extends keyof TableToRecord>(table: T, id: string) {
		// TODO: what happens when the id changes?
		const value = this.context.db.get(table, id)
		this.listeners.add(this.context.db.listen(table, id, this.rerender))
		return value
	}

	componentWillUnmount() {
		for (const stop of Array.from(this.listeners)) {
			stop()
		}
	}
}

/*
Improvement Ideas.
- `db[table].set` and `db[table].get` to avoid raw strings.
- better default values
- use namespaces to extend schema in a reusable way.
- `Cursor<Table>` type for relations to a specific type of store for safer types.
*/
