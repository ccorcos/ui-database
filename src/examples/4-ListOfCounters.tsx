import * as React from "react"
import { CounterStore, Counter, TableToRecord, db } from "./0-Counter"
import { Store, randomId } from "../ui2"

export class ListOfStore<ChildTable extends keyof TableToRecord> extends Store<
	TableToRecord,
	"listOf"
> {
	constructor(id: string, initialValue?: TableToRecord["listOf"]) {
		super("listOf", id, db)
		const value = super.get()
		if (value === undefined) {
			if (initialValue === undefined) {
				this.set({ itemIds: [] })
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

	insert(store: Store<TableToRecord, ChildTable>) {
		const { itemIds } = this.get()
		this.set({ itemIds: [...itemIds, store.id] })
		db.commit()
	}

	remove(store: Store<TableToRecord, ChildTable>) {
		const { itemIds } = this.get()
		this.set({ itemIds: itemIds.filter(id => id !== store.id) })
		db.commit()
	}
}

export class ListOfCounters extends React.PureComponent<{
	store: ListOfStore<"counter">
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

	render() {
		return (
			<div>
				<button
					onClick={() => {
						this.props.store.set({
							itemIds: [...this.props.store.get().itemIds, randomId()],
						})
						db.commit()
					}}
				>
					insert
				</button>
				{this.props.store.get().itemIds.map(counterId => {
					// TODO: this referential equality hack is a not explicit enough.
					const store = new CounterStore(counterId)
					return (
						<div key={counterId}>
							<Counter store={store} delta={1} />
							<button
								onClick={() => {
									this.props.store.remove(store)
									db.commit()
								}}
							>
								remove
							</button>
						</div>
					)
				})}
			</div>
		)
	}
}

export class ListOfCountersApp extends React.PureComponent {
	initialCounter = new CounterStore(randomId())

	listOfStore = new ListOfStore<"counter">(randomId(), {
		itemIds: [this.initialCounter.id],
	})

	render() {
		return <ListOfCounters store={this.listOfStore} />
	}
}
