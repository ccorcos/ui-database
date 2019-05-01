import * as React from "react"
import { Counter, CounterStore } from "./0-counter"
import { Component } from "./common"

export class DependentCountersApp extends Component<
	{},
	{ store: CounterStore }
> {
	storeTypes = {
		store: CounterStore,
	}

	renderComponent() {
		return (
			<div>
				<Counter delta={1} store={this.stores.store} />
				<Counter delta={10} store={this.stores.store} />
			</div>
		)
	}
}
