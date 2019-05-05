import * as _ from "lodash"
import * as React from "react"
import * as PropTypes from "prop-types"

export function randomId() {
	return Math.round(Math.random() * 1e20).toString()
}

export type Pointer<Table extends keyof TableToRecord = keyof TableToRecord> = {
	table: Table
	id: string
}

// This is where you define store types.
export interface TableToRecord {
	counter: { count: number }
	listOf: { items: Array<Pointer> }
	app0: { counter: Pointer<"counter"> }
	app1: { counter1: Pointer<"counter">; counter2: Pointer<"counter"> }
	app2: { counter: Pointer<"counter"> }
	app3: {
		mainCounter: Pointer<"counter">
		deltaCounter: Pointer<"counter">
	}
	app4: { list: Pointer<"listOf"> }
}

export const defaultValues: {
	[Table in keyof TableToRecord]: TableToRecord[Table]
} = {
	counter: { count: 0 },
	listOf: { items: [] },
	app0: { counter: { table: "counter", id: randomId() } },
	app1: {
		counter1: { table: "counter", id: randomId() },
		counter2: { table: "counter", id: randomId() },
	},
	app2: { counter: { table: "counter", id: randomId() } },
	app3: {
		mainCounter: { table: "counter", id: randomId() },
		deltaCounter: { table: "counter", id: randomId() },
	},
	app4: {
		list: { table: "listOf", id: randomId() },
	},
}

class AutoListener {
	constructor(private db: Database, private onChange: () => void) {}

	public recordMap: {
		[Table in keyof TableToRecord]?: {
			[id: string]: undefined | true
		}
	} = {}

	register<Table extends keyof TableToRecord>({ table, id }: Pointer<Table>) {
		if (!this.recordMap[table]) {
			this.recordMap[table] = {}
		}
		this.recordMap[table][id] = true
	}

	private listeners = new Set<() => void>()

	listen(onChange: () => void) {
		for (const table in this.recordMap) {
			for (const id in this.recordMap[table]) {
				this.listeners.add(this.db.listen({ table, id } as any, onChange))
			}
		}
		return this.stop
	}

	stop = () => {
		for (const stop of Array.from(this.listeners)) {
			stop()
		}
		this.listeners = new Set()
	}

	reset = () => {
		this.stop()
		this.recordMap = {}
	}

	private previousAutoListener: AutoListener | undefined

	startListener() {
		this.reset()
		this.previousAutoListener = this.db.currentAutoListener
		this.db.currentAutoListener = this
	}

	stopListener() {
		this.db.currentAutoListener = this.previousAutoListener
		this.listen(this.onChange)
	}
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

	public get<Table extends keyof TableToRecord>({
		table,
		id,
	}: Pointer<Table>): TableToRecord[Table] {
		if (this.currentAutoListener) {
			this.currentAutoListener.register({ table, id })
		}

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
		{ table, id }: Pointer<Table>,
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

	public currentAutoListener: AutoListener | undefined

	public pendingEmit: {
		[Table in keyof TableToRecord]?: {
			[id: string]: undefined | true
		}
	} = {}

	public set<Table extends keyof TableToRecord>(
		{ table, id }: Pointer<Table>,
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
					this.emit({ table, id } as any)
				}
			}
			this.pendingEmit = {}
		})
	}

	public emit<Table extends keyof TableToRecord>({
		table,
		id,
	}: Pointer<Table>) {
		const tableMap = this.listeners[table]
		if (tableMap) {
			const idMap = tableMap[id]
			if (idMap) {
				for (const onChange of Array.from<any>(idMap.keys())) {
					onChange(this.get({ table, id }))
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

// NOTE: reactivity in componentWillMount like we have in 0-notion-architecture seems
// like a really bad pattern...
export class Component<P = {}> extends React.Component<P> {
	static contextTypes = {
		db: PropTypes.any,
	}
	context: { db: Database }

	autoListener = new AutoListener(this.context.db, () => this.forceUpdate())

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		if (!shallowEqual(this.props, nextProps)) {
			return true
		}
		if (!shallowEqual(this.context, nextContext)) {
			return true
		}
		return false
	}

	componentWillUnmount() {
		this.autoListener.reset()
	}

	// Override in subclass.
	renderComponent(): React.ReactNode {
		return null
	}

	render() {
		this.autoListener.startListener()
		const jsx = this.renderComponent()
		this.autoListener.stopListener()
		return jsx
	}
}

export function shallowEqual(objA, objB) {
	if (equalOrEmpty(objA, objB)) {
		return true
	}

	if (_.isPlainObject(objA) && _.isPlainObject(objB)) {
		// Check if they're pointers.
		if (
			objA.table &&
			objA.id &&
			objB.table &&
			objB.id &&
			Object.keys(objA).length === 2 &&
			Object.keys(objB).length === 2
		) {
			return objA.table === objB.table && objA.id === objB.id
		}

		for (const key in objA) {
			if (objA.hasOwnProperty(key)) {
				if (!objB.hasOwnProperty(key)) {
					return false
				}
				// If a "style" or "props" prop, do an extra layer of shallowEqual.
				if (
					key.toLowerCase().endsWith("style") ||
					key.toLowerCase().endsWith("props")
				) {
					if (!shallowEqual(objA[key], objB[key])) {
						return false
					}
				} else {
					if (!equalOrEmpty(objA[key], objB[key])) {
						return false
					}
				}
			}
		}

		for (const key in objB) {
			if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
				return false
			}
		}

		return true
	}

	if (_.isArray(objA) && _.isArray(objB)) {
		if (objA.length !== objB.length) {
			return false
		}

		for (let i = 0; i < objA.length; i++) {
			if (!equalOrEmpty(objA[i], objB[i])) {
				return false
			}
		}

		return true
	}

	return false
}

function isEmptyObject(value) {
	return _.isPlainObject(value) && _.isEmpty(value)
}

function isEmptyArray(value) {
	return _.isArray(value) && _.isEmpty(value)
}

function equalOrEmpty(objA, objB) {
	if (objA === objB) {
		return true
	}

	if (isEmptyArray(objA) && isEmptyArray(objB)) {
		return true
	}

	if (isEmptyObject(objA) && isEmptyObject(objB)) {
		return true
	}

	return false
}
