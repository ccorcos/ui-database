import * as React from "react"
import * as _ from "lodash"
import { emit } from "cluster"

type Path = Array<string | number>

function objGet(obj, path: Path) {
	if (path.length === 0) {
		return obj
	}
	const [first, ...rest] = path
	if (first in obj) {
		return objGet(obj[first], rest)
	}
}

function objSet(obj, path: Path, value: any) {
	if (path.length === 0) {
		return value
	}
	const [first, ...rest] = path
	return {
		...obj,
		[first]: objSet((obj && obj[first]) || {}, rest, value),
	}
}

type ListenerTree = {
	listeners?: Map<() => void, () => void>
	children?: { [key in string | number]: ListenerTree }
}

class Database {
	state: any = {}
	listeners: ListenerTree = {}

	get(path: Path) {
		return objGet(this.state, path)
	}

	set(path: Path, value: any) {
		this.state = objSet(this.state, path, value)
		this.emit(path)
	}

	emit(path: Path, direction: "up" | "down" | "both" = "both") {
		const nodePath = _.flatten(path.map(item => ["children", item]))
		const node: ListenerTree | undefined = objGet(this.listeners, nodePath)
		if (node && node.listeners) {
			for (const fn of Array.from(node.listeners.keys())) {
				fn()
			}
		}
		if (path.length > 0 && (direction === "up" || direction === "both")) {
			this.emit(_.initial(path))
		}
		if (
			node &&
			node.children &&
			(direction === "down" || direction === "both")
		) {
			for (const key in node.children) {
				this.emit([...path, key], "down")
			}
		}
	}

	listen(path: Path, fn: () => void) {
		const nodePath = _.flatten(path.map(item => ["children", item]))
		const node: ListenerTree = objGet(this.listeners, nodePath) || {}
		if (!node.listeners) {
			node.listeners = new Map()
		}
		this.listeners = objSet(this.listeners, nodePath, node)
		const map = node.listeners
		const stop = () => map.delete(fn)
		map.set(fn, stop)
		return stop
	}
}

// Wrap the object to contain the objects path.
const getPathKey = Symbol("getPathKey")
const getValueKey = Symbol("getValueKey")

type Wrapped<Value> = { [key in keyof Value]: Wrapped<Value[key]> } & {
	[getPathKey]: Array<number | string>
	[getValueKey]: Value
}

function wrap<Obj>(obj: Obj, path: Array<string | number> = []) {
	const wrapped: any = {
		[getPathKey]: path,
		[getValueKey]: obj,
	}
	for (const key in obj) {
		// Lazy getters
		Object.defineProperty(wrapped, key, {
			get() {
				return wrap(obj[key], [...path, key])
			},
		})
	}
	return wrapped as Wrapped<Obj>
}

class WrappedDatabase<Obj> {
	db = new Database()
	get<Value>(path: (obj: Wrapped<Obj>) => Wrapped<Value>) {
		return this.db.get(path(wrap(this.db.state as Obj))[getPathKey]) as Value
	}

	set<Value>(path: (obj: Wrapped<Obj>) => Wrapped<Value>, value: Value) {
		this.db.set(path(wrap(this.db.state as Obj))[getPathKey], value)
	}

	initialize<Value>(path: (obj: Wrapped<Obj>) => Wrapped<Value>, value: Value) {
		if (db.get(path(wrap(this.db.state as Obj))[getPathKey]) === undefined) {
			db.set(path(wrap(this.db.state as Obj))[getPathKey], value)
		}
	}
}

function getReactInstancePath(reactInstance) {
	if (!reactInstance || !reactInstance._reactInternalFiber) {
		return
	}

	// reactInstance._reactInternalFiber.key
	const pathId =
		reactInstance.props.id !== undefined && reactInstance.props.id !== null
			? reactInstance.props.id
			: reactInstance._reactInternalFiber._debugID
	const parent = reactInstance._reactInternalFiber._debugOwner
	if (parent) {
		const parentInstance = parent.stateNode
		const parentPath = getReactInstancePath(parentInstance)
		return [...parentPath, pathId]
	} else {
		return [pathId]
	}
}

const db = new Database()
window["db"] = db

export class Component<Props = {}, State = {}> extends React.Component<
	Props & { id?: number | string }
> {
	constructor(props: Props) {
		super(props)
	}

	get path(): Array<number> {
		return getReactInstancePath(this)
	}

	rerender = () => this.forceUpdate()
	unmount = new Set<() => void>()

	componentWillUnmount() {
		this.unmount.forEach(fn => fn())
	}

	db = new WrappedDatabase<State>()
}
