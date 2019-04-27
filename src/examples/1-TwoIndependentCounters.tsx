import * as React from "react"
import { CounterStore, Counter } from "./0-Counter"

export class TwoIndependentCountersApp extends React.PureComponent {
	counterStore1 = new CounterStore("counter1")
	counterStore2 = new CounterStore("counter2")
	render() {
		return (
			<div>
				<Counter store={this.counterStore1} delta={1} />
				<Counter store={this.counterStore2} delta={1} />
			</div>
		)
	}
}
