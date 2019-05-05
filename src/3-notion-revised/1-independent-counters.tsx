import * as React from "react"
import { Counter } from "./0-counter"
import { DatabaseContext, Database, Component } from "./common"

class App extends Component {
	renderComponent() {
		const { counter1, counter2 } = this.context.db.get({
			table: "app1",
			id: "root",
		})
		return (
			<div>
				<Counter counter={counter1} delta={1} />
				<Counter counter={counter2} delta={1} />
			</div>
		)
	}
}

const db = new Database()

export function IndependentCountersApp() {
	return (
		<DatabaseContext db={db}>
			<App />
		</DatabaseContext>
	)
}
