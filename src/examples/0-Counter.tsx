import * as React from "react"
import { Database, Store } from "../ui2"

export type TableToRecord = {
	counter: {
		count: number
	}
	listOf: {
		itemIds: Array<string>
	}
	cousinApp: {
		listOfLeft: string
		listOfRight: string
	}
}

export const db = new Database<TableToRecord>()
window["db"] = db

export class CounterStore extends Store<TableToRecord, "counter"> {
	constructor(id: string, initialValue?: TableToRecord["counter"]) {
		super("counter", id, db)
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

export class Counter extends React.PureComponent<{
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
		console.log("render", this.props.store.id)
		return (
			<div>
				<button onClick={this.decrement}>{"-"}</button>
				<span>{this.props.store.get().count}</span>
				<button onClick={this.increment}>{"+"}</button>
			</div>
		)
	}
}

export class OneCounterApp extends React.PureComponent {
	counterStore = new CounterStore("counter")
	render() {
		return (
			<div>
				<Counter store={this.counterStore} delta={1} />
			</div>
		)
	}
}
