// type TableToRecord = {
// 	app: {
// 		mainCounterId: string
// 		deltaCounterId: string
// 	}
// 	counter: {
// 		count: number
// 	}
// }

// const db = new Database<TableToRecord>()

// // db.Store

// class CounterStore extends Store<"counter"> {
// 	constructor(id: string, initialValue?: TableToRecord["counter"]) {
// 		super("counter", id)
// 		const value = super.get()
// 		if (value === undefined) {
// 			if (initialValue === undefined) {
// 				this.set({ count: 0 })
// 			} else {
// 				this.set(initialValue)
// 			}
// 			db.commit()
// 		}
// 	}

// 	get() {
// 		const value = super.get()
// 		if (value === undefined) {
// 			throw new Error("Uninitialized Store.")
// 		}
// 		return value
// 	}

// 	increment(delta: number) {
// 		const { count } = this.get()
// 		this.set({ count: count + delta })
// 		db.commit()
// 	}

// 	decrement(delta: number) {
// 		const { count } = this.get()
// 		this.set({ count: count - delta })
// 		db.commit()
// 	}
// }

// class Counter extends React.PureComponent<{
// 	store: CounterStore
// 	delta: number
// }> {
// 	stop = this.props.store.listen(() => {
// 		this.forceUpdate()
// 	})

// 	componentWillReceiveProps(nextProps) {
// 		if (nextProps.store.id !== this.props.store.id) {
// 			this.stop()
// 			this.stop = nextProps.store.listen(() => this.forceUpdate())
// 		}
// 	}

// 	componentWillUnmount() {
// 		this.stop()
// 	}

// 	decrement = () => {
// 		this.props.store.decrement(this.props.delta)
// 	}

// 	increment = () => {
// 		this.props.store.increment(this.props.delta)
// 	}

// 	render() {
// 		console.log("render", this.props.store.id)
// 		return (
// 			<div>
// 				<button onClick={this.decrement}>{"-"}</button>
// 				<span>{this.props.store.get().count}</span>
// 				<button onClick={this.increment}>{"+"}</button>
// 			</div>
// 		)
// 	}
// }

// class OneCounter extends React.PureComponent {
// 	counterStore = new CounterStore("counter")
// 	render() {
// 		return (
// 			<div>
// 				<Counter store={this.counterStore} delta={1} />
// 			</div>
// 		)
// 	}
// }

// class TwoIndependentCounters extends React.PureComponent {
// 	counterStore1 = new CounterStore("counter1")
// 	counterStore2 = new CounterStore("counter2")
// 	render() {
// 		return (
// 			<div>
// 				<Counter store={this.counterStore1} delta={1} />
// 				<Counter store={this.counterStore2} delta={1} />
// 			</div>
// 		)
// 	}
// }

// class TwoDependentCounters extends React.PureComponent {
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

// // - Delta
// // - ListOf
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
