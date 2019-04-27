import * as React from "react"
import { CounterStore, Counter } from "./0-Counter"

export class TwoDependentCountersApp extends React.PureComponent {
	counterStore = new CounterStore("counter")
	render() {
		return (
			<div>
				<Counter store={this.counterStore} delta={1} />
				<Counter store={this.counterStore} delta={1} />
			</div>
		)
	}
}
