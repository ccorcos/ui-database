import * as React from "react"
import { CounterStore, Counter } from "./0-Counter"

export class DeltaCountersApp extends React.PureComponent {
	mainCounterStore = new CounterStore("mainCounter")
	deltaCounterStore = new CounterStore("deltaCounter", { count: 1 })

	stop = this.deltaCounterStore.listen(() => {
		this.forceUpdate()
	})

	componentWillUnmount() {
		this.stop()
	}

	render() {
		return (
			<div>
				<Counter
					store={this.mainCounterStore}
					delta={this.deltaCounterStore.get().count}
				/>
				<Counter store={this.deltaCounterStore} delta={1} />
			</div>
		)
	}
}
