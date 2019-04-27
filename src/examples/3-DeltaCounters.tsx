import * as React from "react"
import { CounterStore, Counter, useDb } from "./0-Counter"

export function DeltaCountersApp() {
	const deltaCounterId = "deltaCounter"
	const [deltaCounter, setDeltaCounter] = useDb("counter", deltaCounterId, {
		count: 1,
	})
	return (
		<div>
			<Counter id={deltaCounterId} delta={1} />
			<Counter id={"mainCounter"} delta={deltaCounter.count} />
		</div>
	)
}
