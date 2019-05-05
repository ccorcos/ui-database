import * as React from "react"
import { Component, randomId, Database, DatabaseContext } from "./common"
import { Counter } from "./0-counter"

class ListOfItem extends Component<{
	id: string
	renderItem: (id: string) => JSX.Element
	onRemove: (id: string) => void
}> {
	handleRemove = () => {
		this.props.onRemove(this.props.id)
	}

	render() {
		console.log("render list of item", this.props.id)
		return (
			<div>
				{this.props.renderItem(this.props.id)}
				<button onClick={this.handleRemove}>remove</button>
			</div>
		)
	}
}

export class ListOf extends Component<{
	id: string
	renderItem: (id: string) => JSX.Element
}> {
	handleInsertItem = () => {
		const { itemIds } = this.context.db.get("listOf", this.props.id) || {
			itemIds: [],
		}
		this.context.db.set("listOf", this.props.id, {
			itemIds: [...itemIds, randomId()],
		})
	}

	handleRemoveItem = (id: string) => {
		const { itemIds } = this.context.db.get("listOf", this.props.id) || {
			itemIds: [],
		}
		this.context.db.set("listOf", this.props.id, {
			itemIds: itemIds.filter(itemId => itemId !== id),
		})
		// TODO: cleanup `this.context.db.remove("counter", id)`
	}

	render() {
		const { itemIds } = this.useStore("listOf", this.props.id)
		return (
			<div>
				<button onClick={this.handleInsertItem}>insert</button>
				{itemIds.map(itemId => {
					return (
						<ListOfItem
							key={itemId}
							id={itemId}
							renderItem={this.props.renderItem}
							onRemove={this.handleRemoveItem}
						/>
					)
				})}
			</div>
		)
	}
}

const db = new Database()
export function ListOfCountersApp() {
	return (
		<DatabaseContext db={db}>
			<ListOf
				id={"listOf"}
				renderItem={id => {
					return <Counter delta={1} id={id} />
				}}
			/>
		</DatabaseContext>
	)
}
