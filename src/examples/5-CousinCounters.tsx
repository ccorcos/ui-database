import * as React from "react"
import { CounterStore, Counter, TableToRecord, db } from "./0-Counter"
import { Store, randomId } from "../ui2"
import { ListOfStore, ListOfCounters } from "./4-ListOfCounters"
import { getHeapStatistics } from "v8"

export class CousinStore extends Store<TableToRecord, "cousinApp"> {
	constructor(id: string, initialValue?: TableToRecord["cousinApp"]) {
		super("cousinApp", id, db)
		const value = super.get()
		if (value === undefined) {
			if (initialValue === undefined) {
				this.set({ listOfLeft: randomId(), listOfRight: randomId() })
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
}

// Render the second counter of the right list.
// React hooks would make this _wayyy_ easier.
class CousinCounter extends React.PureComponent<{ store: CousinStore }> {
	stops: Array<any> = []

	constructor(props) {
		super(props)
		this.stops.push(this.props.store.listen(() => this.forceUpdate))
		// TODO: weak types here.
		const listOfStore = new ListOfStore<"counter">(
			this.props.store.get().listOfRight
		)
		// TODO: recompute!
		this.stops.push(listOfStore.listen(() => this.forceUpdate))
		const counterId = listOfStore.get().itemIds[1]
		if (counterId) {
			const listOfStore = new ListOfStore<"counter">(
				this.props.store.get().listOfRight
			)
			// TODO: recompute!
			this.stops.push(listOfStore.listen(() => this.forceUpdate))
		}
	}

	render() {
		return <div>cousin:</div>
	}
}

export class CousinCountersApp extends React.PureComponent {
	store = new CousinStore(randomId())

	listOfLeftStore = new ListOfStore<"counter">(this.store.get().listOfLeft, {
		itemIds: [randomId()],
	})

	listOfRightStore = new ListOfStore<"counter">(this.store.get().listOfRight, {
		itemIds: [randomId(), randomId()],
	})

	render() {
		return (
			<div>
				<div style={{ display: "inline-block", verticalAlign: "top" }}>
					<ListOfCounters store={this.listOfLeftStore} />
				</div>
				<div style={{ display: "inline-block", verticalAlign: "top" }}>
					<ListOfCounters store={this.listOfRightStore} />
				</div>
			</div>
		)
	}
}

// // - TwoApps

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

// export class App extends React.PureComponent {
// 	counterStore = new CounterStore("counter")
// 	render() {
// 		return (
// 			<div>
// 				<Counter store={this.counterStore} delta={1} />
// 				<Counter store={this.counterStore} delta={1} />
// 			</div>
// 		)
// 	}
// }

// // class App extends React.PureComponent {
// // 	mainCounterId = randomId()
// // 	deltaCounterId = randomId()

// // 	store = new AppStore(randomId(), {
// // 		mainCounterId: this.mainCounterId,
// // 		deltaCounterId: this.deltaCounterId,
// // 	})

// // 	render() {
// // 		return (
// // 			<div>
// // 				<button onClick={this.decrement}>{"-"}</button>
// // 				<span>{this.store.get().count}</span>
// // 				<button onClick={this.increment}>{"+"}</button>
// // 			</div>
// // 		)
// // 	}
// // }

// // function useCounter(id: string) {
// // 	const ref = useRef()
// // 	const [, forceUpdate] = useState();
// // 	useEffect(() => {
// // 		const counter = Counter(id)
// // 		ref.set(counter)
// // 		return this.counter.listen(forceUpdate)
// // 	}, [id])
// // 	return ref.current
// // }

// // function CounterView(props: {id: string}) {
// // 	const counter = useCounter(props.id)
// // 	return (
// // 		<div>
// // 			<button onClick={this.counter.decrement}>{"-"}</button>
// // 			<span>{this.counter.count.get()}</span>
// // 			<button onClick={this.counter.increment}>{"+"}</button>
// // 		</div>
// // 	)
// // }

// // // NEXT. simple database abstractions. think about how others did it.
// // streams, reduce into indexes, insert or delete operation. everything can
// // always return an array, much like postgres. All other abstractions are
// // just a layer on top of it.
