import * as React from "react"
import {
	Component,
	randomId,
	Database,
	DatabaseContext,
	TableToRecord,
	Pointer,
} from "./common"
import { Counter } from "./0-counter"

export class ListOf<Table extends keyof TableToRecord> extends Component<{
	list: Pointer<"listOf">
	itemType: Table
	renderItem: (item: Pointer<Table>) => React.ReactNode
}> {
	handleInsertItem = () => {
		const { items } = this.context.db.get(this.props.list)
		this.context.db.set(this.props.list, {
			items: [...items, { table: this.props.itemType, id: randomId() }],
		})
	}

	handleRemoveItem = (item: Pointer<Table>) => {
		const { items } = this.context.db.get(this.props.list)
		this.context.db.set(this.props.list, {
			items: items.filter(({ id }) => id !== item.id),
		})
		// TODO: cleanup `this.context.db.remove("counter", id)`
	}

	renderComponent() {
		const { items } = this.context.db.get(this.props.list)
		return (
			<div>
				<button onClick={this.handleInsertItem}>insert</button>
				{items.map(item => {
					return (
						<ListOfItem
							key={item.table + item.id}
							item={item}
							renderItem={this.props.renderItem}
							onRemove={this.handleRemoveItem}
						/>
					)
				})}
			</div>
		)
	}
}

class ListOfItem<Table extends keyof TableToRecord> extends Component<{
	item: Pointer<Table>
	renderItem: (item: Pointer<Table>) => React.ReactNode
	onRemove: (item: Pointer<Table>) => void
}> {
	handleRemove = () => {
		this.props.onRemove(this.props.item)
	}

	renderComponent() {
		console.log(
			"render list of item",
			this.props.item.table,
			this.props.item.id
		)
		return (
			<div>
				{this.props.renderItem(this.props.item)}
				<button onClick={this.handleRemove}>remove</button>
			</div>
		)
	}
}

class App extends Component {
	componentWillMount() {
		const { list } = this.context.db.get({
			table: "app4",
			id: "root",
		})
		this.context.db.set(list, { items: [{ table: "counter", id: randomId() }] })
	}

	renderComponent() {
		const { list } = this.context.db.get({
			table: "app4",
			id: "root",
		})
		return (
			<ListOf
				list={list}
				itemType="counter"
				renderItem={counter => {
					return <Counter delta={1} counter={counter} />
				}}
			/>
		)
	}
}

const db = new Database()

export function ListOfCountersApp() {
	return (
		<DatabaseContext db={db}>
			<App />
		</DatabaseContext>
	)
}
