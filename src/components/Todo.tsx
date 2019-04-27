import * as React from "react"
import { Component } from "../ui"

// Global app state.
interface TodoAppState {
	filter: "all" | "active" | "completed"
	todos: Array<string>
	input: string
	todo?: {
		[key: number]:
			| {
					id: number
					text: string
					completed: boolean
			  }
			| undefined
	}
}

export class TodoApp extends Component<{}, TodoAppState> {
	componentWillMount() {
		this.db.initialize(state => state.filter, "sall")
		this.db.initialize(["todos"], [])
		this.db.initialize(["input"], "")
	}

	handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const input = this.db.get(s => s.input)
			const todo = {
				id: Math.round(Math.random() * 1e10),
				text: input,
				completed: false,
			}
			this.db.set(s => s.todo[todo.id][("todo", todo.id)], todo)
			this.db.set(["input"], "")
			this.db.set(["todos"], [todo.id].concat(this.db.get(["todos"])))
		}
	}

	handleInputChange = e => {
		this.db.set(["input"], e.target.value)
	}

	render() {
		const input = this.db.get(["input"])
		const todos = this.db.get(["todos"])
		return (
			<div>
				<input
					value={input}
					onChange={this.handleInputChange}
					onKeyPress={this.handleKeyPress}
				/>
				{todos.map(id => (
					<Todo key={id} id={id} />
				))}
			</div>
		)
	}
}

class Todo extends Component<{ id: string }> {
	handleCompleted = e => {
		this.db.set(["todo", this.props.id, "completed"], e.target.checked)
	}

	handleDelete = () => {
		// TODO: delete command
		this.db.set(["todo", this.props.id], undefined)
		// TODO: update command.
		this.db.set(
			["todos"],
			this.db.get(["todos"]).filter(id => id !== this.props.id)
		)
	}

	render() {
		const todo = this.db.get(["todo", this.props.id])
		return (
			<div>
				<input
					type="checkbox"
					checked={todo.completed}
					onChange={this.handleCompleted}
				/>
				<span>{todo.text}</span>
				<button onClick={this.handleDelete}>delete</button>
			</div>
		)
	}
}
