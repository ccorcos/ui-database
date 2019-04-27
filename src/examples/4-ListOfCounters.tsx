import * as React from "react"
import * as _ from "lodash"
import { CounterStore, Counter, TableToRecord, db, useDb } from "./0-Counter"
import { Store, randomId } from "../ui2"

function insert(listOf: TableToRecord["listOf"], id: string) {
	return { itemIds: [...listOf.itemIds, id] }
}

function remove(listOf: TableToRecord["listOf"], id: string) {
	return { itemIds: listOf.itemIds.filter(itemId => itemId !== id) }
}

function ListOfItem(props: {
	id: string
	child: (props: { id: string }) => JSX.Element
	onRemove: (id: string) => void
}) {
	const handleRemove = React.useMemo(() => () => props.onRemove(props.id), [
		props.id,
		props.onRemove,
	])

	console.log("render list of item", props.id)

	return (
		<div>
			<props.child id={props.id} />
			<button onClick={handleRemove}>remove</button>
		</div>
	)
}

function ListOf(props: {
	id: string
	child: (props: { id: string }) => JSX.Element
}) {
	const initialValue = React.useMemo(() => {
		return {
			itemIds: [randomId()],
		}
	}, [props.id])

	const [listOf, setListOf] = useDb("listOf", props.id, initialValue)

	// TODO: when listOf state changes, this is a new function and all
	// children have to rerender. I wonder if we could use a ref to
	// render more performantly.
	const handleInsert = React.useMemo(
		() => () => setListOf(insert(listOf, randomId())),
		[listOf, setListOf]
	)

	const handleRemove = React.useMemo(
		() => (id: string) => setListOf(remove(listOf, id)),
		[listOf, setListOf]
	)

	return (
		<div>
			<button onClick={handleInsert}>insert</button>
			{listOf.itemIds.map(itemId => {
				return (
					<ListOfItem
						key={itemId}
						id={itemId}
						child={props.child}
						onRemove={handleRemove}
					/>
				)
			})}
		</div>
	)
}

function Counter1(props: { id: string }) {
	return <Counter delta={1} id={props.id} />
}

export function ListOfCountersApp() {
	return <ListOf id={"listOf"} child={Counter1} />
}
