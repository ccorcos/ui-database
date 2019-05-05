import * as React from "react"
import { Counter } from "./0-counter"
import { Component, Database, DatabaseContext } from "./common"

class App extends Component {
	componentWillMount() {
		const { deltaCounter } = this.context.db.get({
			table: "app3",
			id: "root",
		})
		this.context.db.set(deltaCounter, { count: 1 })
	}

	renderComponent() {
		const { mainCounter, deltaCounter } = this.context.db.get({
			table: "app3",
			id: "root",
		})
		const { count } = this.context.db.get(deltaCounter)
		return (
			<div>
				<Counter counter={mainCounter} delta={count} />
				<Counter counter={deltaCounter} delta={1} />
			</div>
		)
	}
}

const db = new Database()

export function DeltaCountersApp() {
	return (
		<DatabaseContext db={db}>
			<App />
		</DatabaseContext>
	)
}
