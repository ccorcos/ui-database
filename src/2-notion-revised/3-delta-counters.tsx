import * as React from "react"
import { Counter } from "./0-counter"
import { Component, Database, DatabaseContext } from "./common"

const db = new Database()

export class DeltaCounters extends Component<{}> {
	componentWillMount() {
		// TODO: what if I only want to do this once, ever?
		this.context.db.set("counter", "deltaCounter", { count: 1 })
	}
	renderComponent() {
		const { count } = this.context.db.get("counter", "deltaCounter")
		return (
			<div>
				<Counter delta={count} id={"mainCounter"} />
				<Counter delta={1} id={"deltaCounter"} />
			</div>
		)
	}
}

export class DeltaCountersApp extends Component<{}> {
	render() {
		return (
			<DatabaseContext db={db}>
				<DeltaCounters />
			</DatabaseContext>
		)
	}
}
