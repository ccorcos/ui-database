// TODO: reactivity doesnt quite work properly...
// when you update the index, the mirror state doesn't update correctly.
//

import * as React from "react"
import { CounterStore, Counter, TableToRecord, db, useDb } from "./0-Counter"
import { Store, randomId } from "../ui2"
import { ListOfCountersApp, ListOf, Counter1 } from "./4-ListOfCounters"

function ListOfCounters(props: { id: string }) {
	return <ListOf id={props.id} child={Counter1} />
}

function ListOfListOfCounters(props: { id: string }) {
	return <ListOf id={props.id} child={ListOfCounters} />
}

// Need to create a sub component so we can useDb again.
// TODO: do we have to do this? Kind of annoying.
function MirrorCounterHelper(props: { counterIndex: number; listId: string }) {
	// TODO: undefined override type
	const [listOf] = useDb("listOf", props.listId, undefined as any)
	if (!listOf) {
		return <div>no listof</div>
	}
	// TODO: would be nice if we could type check this better. I guess listOf is
	// pretty generic and doesn't have a generic type for whats in it...
	const counterId = listOf.itemIds[props.counterIndex]
	if (!counterId) {
		return <div>no {props.counterIndex}th counter</div>
	}

	return <Counter1 id={counterId} />
}

function MirrorCounter(props: {
	listIndex: number
	counterIndex: number
	rootListId: string
}) {
	// TODO: undefined override type
	const [rootListOf] = useDb("listOf", props.rootListId, undefined as any)
	if (!rootListOf) {
		return <div>no root listof</div>
	}
	const listId = rootListOf.itemIds[props.listIndex]
	if (!listId) {
		return <div>no {props.listIndex}th list</div>
	}
	return (
		<MirrorCounterHelper listId={listId} counterIndex={props.counterIndex} />
	)
}

export function CousinCounters() {
	const rootListOfId = React.useMemo(randomId, [])
	const listIndexId = React.useMemo(randomId, [])
	const counterIndexId = React.useMemo(randomId, [])
	const [{ count: listIndex }] = useDb("counter", listIndexId, { count: 0 })
	const [{ count: counterIndex }] = useDb("counter", counterIndexId, {
		count: 0,
	})

	return (
		<div>
			<div>
				Lists
				<ListOfListOfCounters id={rootListOfId} />
			</div>
			<div>
				Mirror: ({listIndex},{counterIndex})
				<MirrorCounter
					listIndex={listIndex}
					counterIndex={counterIndex}
					rootListId={rootListOfId}
				/>
			</div>
			<div>
				List Index: <Counter1 id={listIndexId} />
			</div>
			<div>
				Counter Index: <Counter1 id={counterIndexId} />
			</div>
		</div>
	)
}

// export class CousinCountersApp extends React.PureComponent {
// 	store = new CousinStore(randomId())

// 	listOfLeftStore = new ListOfStore<"counter">(this.store.get().listOfLeft, {
// 		itemIds: [randomId()],
// 	})

// 	listOfRightStore = new ListOfStore<"counter">(this.store.get().listOfRight, {
// 		itemIds: [randomId(), randomId()],
// 	})

// 	render() {
// 		return (
// 			<div>
// 				<div style={{ display: "inline-block", verticalAlign: "top" }}>
// 					<ListOfCounters store={this.listOfLeftStore} />
// 				</div>
// 				<div style={{ display: "inline-block", verticalAlign: "top" }}>
// 					<ListOfCounters store={this.listOfRightStore} />
// 				</div>
// 			</div>
// 		)
// 	}
// }

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
