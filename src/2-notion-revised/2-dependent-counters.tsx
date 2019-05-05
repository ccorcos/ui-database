import * as React from "react"
import { Counter } from "./0-counter"
import { DatabaseContext, Database } from "./common"

const db = new Database()

export function DependentCountersApp() {
	return (
		<DatabaseContext db={db}>
			<div>
				<Counter id="mainCounter" delta={1} />
				<Counter id="mainCounter" delta={10} />
			</div>
		</DatabaseContext>
	)
}
