import * as React from "react"
import { Component, Database, DatabaseContext } from "./common"

export class Counter extends Component<{ id: string; delta: number }> {
	handleDecrement = () => {
		const counter = this.context.db.get("counter", this.props.id)
		this.context.db.set("counter", this.props.id, {
			count: counter.count - this.props.delta,
		})
	}

	handleIncrement = () => {
		const counter = this.context.db.get("counter", this.props.id)
		this.context.db.set("counter", this.props.id, {
			count: counter.count + this.props.delta,
		})
	}

	render() {
		console.log("render counter")
		const { count } = this.useStore("counter", this.props.id)
		return (
			<div>
				<button onClick={this.handleDecrement}>{"-"}</button>
				<span>{count}</span>
				<button onClick={this.handleIncrement}>{"+"}</button>
			</div>
		)
	}
}

const db = new Database()

export function CounterApp() {
	return (
		<DatabaseContext db={db}>
			<Counter id="mainCounter" delta={1} />
		</DatabaseContext>
	)
}
