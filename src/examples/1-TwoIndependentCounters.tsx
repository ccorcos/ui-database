import * as React from "react"
import { CounterStore, Counter } from "./0-Counter"

export function TwoIndependentCountersApp() {
	return (
		<div>
			<Counter id={"counter1"} delta={1} />
			<Counter id={"counter2"} delta={1} />
		</div>
	)
}
