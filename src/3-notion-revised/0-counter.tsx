import * as React from "react"
import { Component, Database, DatabaseContext, Pointer } from "./common"

export class Counter extends Component<{
	counter: Pointer<"counter">
	delta: number
}> {
	handleDecrement = () => {
		const counter = this.context.db.get(this.props.counter)
		this.context.db.set(this.props.counter, {
			count: counter.count - this.props.delta,
		})
	}

	handleIncrement = () => {
		const counter = this.context.db.get(this.props.counter)
		this.context.db.set(this.props.counter, {
			count: counter.count + this.props.delta,
		})
	}

	renderComponent() {
		console.log("render counter")
		const { count } = this.context.db.get(this.props.counter)
		return (
			<div>
				<button onClick={this.handleDecrement}>{"-"}</button>
				<span>{count}</span>
				<button onClick={this.handleIncrement}>{"+"}</button>
			</div>
		)
	}
}

class App extends Component {
	renderComponent() {
		const { counter } = this.context.db.get({ table: "app0", id: "root" })
		return <Counter counter={counter} delta={1} />
	}
}

const db = new Database()

export function CounterApp() {
	return (
		<DatabaseContext db={db}>
			<App />
		</DatabaseContext>
	)
}
