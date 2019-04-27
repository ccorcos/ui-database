import * as _ from "lodash"
import * as React from "react"
import { render } from "react-dom"

export function randomId() {
	return Math.round(Math.random() * 1e20).toString()
}

export class Database<TableToRecord extends { [key: string]: any }> {
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
	): TableToRecord[Table] | undefined {
		if (this.recordMap[table]) {
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

	public pendingEmit: {
		[Table in keyof TableToRecord]?: {
			[id: string]: undefined | true
		}
	} = {}

	/**
	 * Set with value `undefined` to delete.
	 */
	public set<Table extends keyof TableToRecord>(
		table: Table,
		id: string,
		value: TableToRecord[Table] | undefined
	) {
		if (!this.recordMap[table]) {
			this.recordMap[table] = {}
		}
		if (value === undefined) {
			delete this.recordMap[table][id]
		} else {
			this.recordMap[table][id] = value
		}

		// Set pendingEmit so we can flush all emits at once without emitting
		// more than once in one synchronous transaction.
		if (!this.pendingEmit[table]) {
			this.pendingEmit[table] = {}
		}
		this.pendingEmit[table][id] = true
	}

	public emit(table: keyof TableToRecord, id: string) {
		if (this.listeners[table]) {
			if (this.listeners[table][id]) {
				for (const onChange of Array.from<any>(
					this.listeners[table][id].keys()
				)) {
					onChange(this.get(table, id))
				}
			}
		}
	}

	public commit() {
		for (const table in this.pendingEmit) {
			for (const id in this.pendingEmit[table]) {
				this.emit(table, id)
			}
		}
		this.pendingEmit = {}
	}

	stores: {
		[Table in keyof TableToRecord]?: {
			[id: string]: undefined | Store<TableToRecord, Table>
		}
	} = {}
}

export class Store<
	TableToRecord extends { [key: string]: any },
	Table extends keyof TableToRecord
> {
	constructor(
		public table: Table,
		public id: string,
		public db: Database<TableToRecord>
	) {
		// TODO: memory leak? How to destroy stores?
		const existingStore = db.stores[table] && db.stores[table][id]
		if (existingStore) {
			return existingStore
		}
		if (!db.stores[table]) {
			db.stores[table] = {}
		}
		db.stores[table][id] = this
	}
	public get() {
		return this.db.get(this.table, this.id)
	}
	public set(value: TableToRecord[Table] | undefined) {
		this.db.set(this.table, this.id, value)
	}
	public listen(onChange: (value: TableToRecord[Table] | undefined) => void) {
		return this.db.listen(this.table, this.id, onChange)
	}
}
