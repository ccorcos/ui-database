import * as React from "react"
import { Counter } from "./0-counter"
import { DatabaseContext, Database, Component } from "./common"

class App extends Component {
	renderComponent() {
		const { counter } = this.context.db.get({
			table: "app2",
			id: "root",
		})
		return (
			<div>
				<Counter counter={counter} delta={1} />
				<Counter counter={counter} delta={1} />
			</div>
		)
	}
}

const db = new Database()

export function DependentCountersApp() {
	return (
		<DatabaseContext db={db}>
			<App />
		</DatabaseContext>
	)
}
