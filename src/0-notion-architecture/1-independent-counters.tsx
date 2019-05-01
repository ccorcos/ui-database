import * as React from "react"
import { Counter } from "./0-counter"

export function IndependentCountersApp() {
	return (
		<div>
			<Counter delta={1} />
			<Counter delta={1} />
		</div>
	)
}
