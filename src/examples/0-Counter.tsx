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

// export function useDb<Table extends keyof TableToRecord>(
// 	table: Table,
// 	id: string,
// 	initialValue?: TableToRecord[Table]
// ): [
// 	TableToRecord[Table] | undefined,
// 	(value: TableToRecord[Table] | undefined) => void
// ]
export function useDb<Table extends keyof TableToRecord>(
	table: Table,
	id: string,
	initialValue: TableToRecord[Table]
): [TableToRecord[Table], (value: TableToRecord[Table]) => void] {
	const defaultState = React.useMemo(() => {
		const record = db.get(table, id)
		if (record === undefined && initialValue !== undefined) {
			db.set(table, id, initialValue)
		}
		return record || initialValue
	}, [table, id])

	const [value, setState] = React.useState(defaultState)

	React.useEffect(() => {
		db.listen(table, id, value => {
			if (value !== undefined) {
				setState(value)
			}
		})
	}, [table, id])

	const setValue = React.useMemo(() => {
		return (value: TableToRecord[Table]) => {
			db.set(table, id, value)
			db.commit()
		}
	}, [table, id])

	// TODO: `as const`
	return [value, setValue] as [
		TableToRecord[Table],
		(value: TableToRecord[Table]) => void
	]
}

// Actions are just pure functions.
function increment(counter: TableToRecord["counter"], delta: number) {
	return { count: counter.count + delta }
}

function decrement(counter: TableToRecord["counter"], delta: number) {
	return { count: counter.count - delta }
}

export function Counter(props: { id: string; delta: number }) {
	const [counter, setCounter] = useDb("counter", props.id, { count: 0 })

	const handleIncrement = React.useMemo(
		() => () => setCounter(increment(counter, props.delta)),
		[counter, setCounter, props.delta]
	)

	const handleDecrement = React.useMemo(
		() => () => setCounter(decrement(counter, props.delta)),
		[counter, setCounter, props.delta]
	)

	return (
		<div>
			<button onClick={handleDecrement}>{"-"}</button>
			<span>{counter.count}</span>
			<button onClick={handleIncrement}>{"+"}</button>
		</div>
	)
}

export function OneCounterApp() {
	return (
		<div>
			<Counter id={"counter"} delta={1} />
		</div>
	)
}
