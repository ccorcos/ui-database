import * as _ from "lodash"
import * as React from "react"
import { render } from "react-dom"

/*
Simplest Synchronous UI Database

db.get(table, id) -> record<table>

Would be cool if the same record could conform to multiple tables

db.get([table1, table2], id) -> record<table1 & table2>

Most applications don't need any indexes. Things can just be caches and sorted/filtered on the fly.

TODO: transactions to batch together sets and emits.
TODO: fine-grained listeners on a path? maybe not. keep the database as simple and general purpose as possible.
*/

function randomId() {
	return Math.round(Math.random() * 1e20).toString()
}

class Database<TableToRecord extends { [key: string]: any }> {
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
		// this.throttledCommit()
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

	// public throttledCommit = _.throttle(this.commit.bind(this), 0, {
	// 	leading: false,
	// 	trailing: true,
	// })
}

type TableToRecord = {
	app: {
		mainCounterId: string
		deltaCounterId: string
	}
	counter: {
		count: number
	}
}

const db = new Database<TableToRecord>()

// db.Store

/**
 * A _Store_ encapsultates state and the behaviors of the component.
 */
class Store<Table extends keyof TableToRecord> {
	constructor(public table: Table, public id: string) {}
	public get() {
		return db.get(this.table, this.id)
	}
	public set(value: TableToRecord[Table] | undefined) {
		db.set(this.table, this.id, value)
	}
	public listen(onChange: (value: TableToRecord[Table] | undefined) => void) {
		return db.listen(this.table, this.id, onChange)
	}
}

class CounterStore extends Store<"counter"> {
	constructor(id: string, initialValue?: TableToRecord["counter"]) {
		super("counter", id)
		const value = super.get()
		if (value === undefined) {
			if (initialValue === undefined) {
				this.set({ count: 0 })
			} else {
				this.set(initialValue)
			}
			db.commit()
		}
	}

	get() {
		const value = super.get()
		if (value === undefined) {
			throw new Error("Uninitialized Store.")
		}
		return value
	}

	increment(delta: number) {
		const { count } = this.get()
		this.set({ count: count + delta })
		db.commit()
	}

	decrement(delta: number) {
		const { count } = this.get()
		this.set({ count: count - delta })
		db.commit()
	}
}

class Counter extends React.PureComponent<{
	store: CounterStore
	delta: number
}> {
	stop = this.props.store.listen(() => {
		this.forceUpdate()
	})

	componentWillReceiveProps(nextProps) {
		if (nextProps.store.id !== this.props.store.id) {
			this.stop()
			this.stop = nextProps.store.listen(() => this.forceUpdate())
		}
	}

	componentWillUnmount() {
		this.stop()
	}

	decrement = () => {
		this.props.store.decrement(this.props.delta)
	}

	increment = () => {
		this.props.store.increment(this.props.delta)
	}

	render() {
		console.log("render")
		return (
			<div>
				<button onClick={this.decrement}>{"-"}</button>
				<span>{this.props.store.get().count}</span>
				<button onClick={this.increment}>{"+"}</button>
			</div>
		)
	}
}

class OneCounter extends React.PureComponent {
	counterStore = new CounterStore("counter")
	render() {
		return (
			<div>
				<Counter store={this.counterStore} delta={1} />
			</div>
		)
	}
}

export class App extends React.PureComponent {
	counterStore1 = new CounterStore("counter1")
	counterStore2 = new CounterStore("counter2")
	render() {
		return (
			<div>
				<Counter store={this.counterStore1} delta={1} />
				<Counter store={this.counterStore2} delta={1} />
			</div>
		)
	}
}

// class AppStore extends Store<"app"> {
// 	constructor(id: string, initialValue: TableToRecord["app"]) {
// 		super("app", id)
// 		const value = this.get()
// 		if (value === undefined) {
// 			this.set(initialValue)
// 		}
// 	}

// 	get() {
// 		const value = super.get()
// 		if (value === undefined) {
// 			throw new Error("Uninitialized Store.")
// 		}
// 		return value
// 	}

// 	// TODO: this returns new references constantly.
// 	// getCounterStores() {
// 	// 	const { counterIds } = this.get()
// 	// 	return counterIds.map(counterId => new CounterStore(counterId))
// 	// }
// }

// class App extends React.PureComponent {
// 	mainCounterId = randomId()
// 	deltaCounterId = randomId()

// 	store = new AppStore(randomId(), {
// 		mainCounterId: this.mainCounterId,
// 		deltaCounterId: this.deltaCounterId,
// 	})

// 	render() {
// 		return (
// 			<div>
// 				<button onClick={this.decrement}>{"-"}</button>
// 				<span>{this.store.get().count}</span>
// 				<button onClick={this.increment}>{"+"}</button>
// 			</div>
// 		)
// 	}
// }

// function useCounter(id: string) {
// 	const ref = useRef()
// 	const [, forceUpdate] = useState();
// 	useEffect(() => {
// 		const counter = Counter(id)
// 		ref.set(counter)
// 		return this.counter.listen(forceUpdate)
// 	}, [id])
// 	return ref.current
// }

// function CounterView(props: {id: string}) {
// 	const counter = useCounter(props.id)
// 	return (
// 		<div>
// 			<button onClick={this.counter.decrement}>{"-"}</button>
// 			<span>{this.counter.count.get()}</span>
// 			<button onClick={this.counter.increment}>{"+"}</button>
// 		</div>
// 	)
// }

// // NEXT. simple database abstractions. think about how others did it.
// streams, reduce into indexes, insert or delete operation. everything can
// always return an array, much like postgres. All other abstractions are
// just a layer on top of it.
