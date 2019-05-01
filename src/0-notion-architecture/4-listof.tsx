import * as React from "react"
import { Component, RecordStore, randomId } from "./common"

export class CounterStore extends RecordStore<{ count: number }> {
	getInitialState() {
		return { count: 0 }
	}
}

export class Counter extends Component<
	{ delta: number; store: CounterStore },
	{}
> {
	handleDecrement = () => {
		const { count } = this.props.store.getState()
		this.props.store.setState({ count: count - this.props.delta })
	}

	handleIncrement = () => {
		const { count } = this.props.store.getState()
		this.props.store.setState({ count: count + this.props.delta })
	}

	renderComponent() {
		return (
			<div>
				<button onClick={this.handleDecrement}>{"-"}</button>
				<span>{this.props.store.getState().count}</span>
				<button onClick={this.handleIncrement}>{"+"}</button>
			</div>
		)
	}
}

class ListOfStore extends RecordStore<{ itemIds: Array<string> }> {
	getInitialState() {
		return { itemIds: [] }
	}
}

class ListOfItem extends Component<{
	id: string
	parentStore: RecordStore
	renderItem: (id: string, parentStore: RecordStore) => JSX.Element
	onRemove: (id: string) => void
}> {
	handleRemove = () => {
		this.props.onRemove(this.props.id)
	}

	render() {
		console.log("render list of item", this.props.id)
		return (
			<div>
				{this.props.renderItem(this.props.id, this.props.parentStore)}
				<button onClick={this.handleRemove}>remove</button>
			</div>
		)
	}
}

export class ListOf extends Component<
	{
		store: ListOfStore
		renderItem: (id: string, parentStore: RecordStore) => JSX.Element
	},
	{}
> {
	handleInsertItem = () => {
		const { itemIds } = this.props.store.getState()
		this.props.store.setState({ itemIds: [...itemIds, randomId()] })
	}

	handleRemoveItem = (id: string) => {
		const { itemIds } = this.props.store.getState()
		this.props.store.setState({
			itemIds: itemIds.filter(itemId => itemId !== id),
		})
	}

	renderComponent() {
		return (
			<div>
				<button onClick={this.handleInsertItem}>insert</button>
				{this.props.store.getState().itemIds.map(itemId => {
					return (
						<ListOfItem
							key={itemId}
							id={itemId}
							parentStore={this.props.store}
							renderItem={this.props.renderItem}
							onRemove={this.handleRemoveItem}
						/>
					)
				})}
			</div>
		)
	}
}

const store = new ListOfStore(randomId())

export function ListOfCountersApp() {
	return (
		<div>
			<ListOf
				store={store}
				renderItem={(id, parentStore) => {
					return (
						<Counter
							delta={1}
							store={parentStore.createChildStore(id, CounterStore)}
						/>
					)
				}}
			/>
		</div>
	)
}
