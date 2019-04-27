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

// export interface Gettable<V> {
// 	get(): V
// }

// export interface Settable<V> extends Gettable<V> {
// 	set(v: V): void
// }

// Basic event emitter to keep track of dependencies
export class Dependency {
	listeners: Set<() => void> = new Set()
	add(listener: () => void) {
		this.listeners.add(listener)
	}
	remove(listener: () => void) {
		this.listeners.delete(listener)
	}
	emit() {
		this.listeners.forEach(listener => listener())
	}
}

// A stack of dependencies that represent every .get() during a computation
export const computations: Array<Set<Dependency>> = []

// Adds its dependency to the currrent computation on .get() and emits on .set()
export class ReactiveValue<V> {
	value: V
	dependency = new Dependency()
	constructor(value: V) {
		this.value = value
	}
	get(): V {
		const computation = computations[0]
		computation && computation.add(this.dependency)
		return this.value
	}
	set(value: V): void {
		this.value = value
		this.dependency.emit()
	}
	update(fn: (v: V) => V): void {
		this.set(fn(this.get()))
	}
}

// A value that is derrived from other values
export class ReactiveFunction<V> {
	value: V
	dependency = new Dependency()
	computation = new Set<Dependency>()
	fn: () => V
	stale = true
	constructor(fn: () => V) {
		this.fn = fn
	}
	run() {
		computations.push(new Set())
		this.value = this.fn()
		const computation = computations.shift()
		if (!computation) {
			throw new Error("this should never happen.")
		}
		this.stop()
		computation.forEach(dep => dep.add(this.onUpdate))
		this.computation = computation
	}
	onUpdate = () => {
		this.stale = true
		this.dependency.emit()
	}
	flush() {
		if (this.stale) {
			this.stale = false
			this.run()
		}
	}
	get(): V {
		this.flush()
		const deps = computations[0]
		deps && deps.add(this.dependency)
		return this.value
	}
	stop() {
		this.computation.forEach(dep => dep.remove(this.onUpdate))
	}
}

/**
 * A _Store_ encapsultates state and the state and behaviors of a component.
 */
export class Store<
	TableToRecord extends { [key: string]: any },
	Table extends keyof TableToRecord
> {
	dependency = new Dependency()

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
		const computation = computations[0]
		computation && computation.add(this.dependency)
		return this.db.get(this.table, this.id)
	}
	public set(value: TableToRecord[Table] | undefined) {
		this.db.set(this.table, this.id, value)
		this.dependency.emit()
	}
	public listen(onChange: (value: TableToRecord[Table] | undefined) => void) {
		return this.db.listen(this.table, this.id, onChange)
	}
}
