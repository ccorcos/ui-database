import * as React from "react"
import { Counter, CounterStore } from "./0-counter"
import { Component } from "./common"

export class DeltaCountersApp extends Component<
	{},
	{ mainCounter: CounterStore; deltaCounter: CounterStore }
> {
	storeTypes = {
		mainCounter: CounterStore,
		deltaCounter: CounterStore,
	}

	componentWillMount() {
		super.componentWillMount()
		// Initialize delta counter to 1.
		if (this.stores.deltaCounter.getState().count === 0) {
			this.stores.deltaCounter.setState({ count: 1 })
		}
	}

	renderComponent() {
		return (
			<div>
				<Counter
					delta={this.stores.deltaCounter.getState().count}
					store={this.stores.mainCounter}
				/>
				<Counter delta={1} store={this.stores.deltaCounter} />
			</div>
		)
	}
}
