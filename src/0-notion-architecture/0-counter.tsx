import * as React from "react"
import { Component, Store } from "./common"

export class CounterStore extends Store<{ count: number }> {
	getInitialState() {
		return { count: 0 }
	}
}

export class Counter extends Component<
	{ delta: number },
	{ store: CounterStore }
> {
	storeTypes = {
		store: CounterStore,
	}

	handleDecrement = () => {
		const { count } = this.stores.store.getState()
		this.stores.store.setState({ count: count - this.props.delta })
	}

	handleIncrement = () => {
		const { count } = this.stores.store.getState()
		this.stores.store.setState({ count: count + this.props.delta })
	}

	renderComponent() {
		return (
			<div>
				<button onClick={this.handleDecrement}>{"-"}</button>
				<span>{this.stores.store.getState().count}</span>
				<button onClick={this.handleIncrement}>{"+"}</button>
			</div>
		)
	}
}

export function CounterApp() {
	return <Counter delta={1} />
}
