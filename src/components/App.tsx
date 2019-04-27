// import * as React from "react"
// import * as _ from "lodash"

// type Path = Array<string | number>

// function objGet(obj, path: Path) {
// 	if (path.length === 0) {
// 		return obj
// 	}
// 	const [first, ...rest] = path
// 	if (first in obj) {
// 		return objGet(obj[first], rest)
// 	}
// }

// function objSet(obj, path: Path, value: any) {
// 	if (path.length === 0) {
// 		return value
// 	}
// 	const [first, ...rest] = path
// 	return {
// 		...obj,
// 		[first]: objSet((obj && obj[first]) || {}, rest, value),
// 	}
// }

// type ListenerTree = {
// 	listeners?: Map<() => void, () => void>
// 	children?: { [key in string | number]: ListenerTree }
// }

// class Database {
// 	state: any = {}
// 	listeners: ListenerTree = {}

// 	get(path: Path) {
// 		return objGet(this.state, path)
// 	}

// 	set(path: Path, value: any) {
// 		this.state = objSet(this.state, path, value)
// 		const nodePath = _.flatten(path.map(item => ["children", item]))
// 		const node: ListenerTree | undefined = objGet(this.listeners, nodePath)
// 		if (node && node.listeners) {
// 			for (const fn of Array.from(node.listeners.keys())) {
// 				fn()
// 			}
// 		}
// 	}

// 	listen(path: Path, fn: () => void) {
// 		const nodePath = _.flatten(path.map(item => ["children", item]))
// 		const node: ListenerTree = objGet(this.listeners, nodePath) || {}
// 		if (!node.listeners) {
// 			node.listeners = new Map()
// 		}
// 		this.listeners = objSet(this.listeners, nodePath, node)
// 		const map = node.listeners
// 		const stop = () => map.delete(fn)
// 		map.set(fn, stop)
// 		return stop
// 	}
// }

// function getReactInstancePath(reactInstance) {
// 	if (!reactInstance || !reactInstance._reactInternalFiber) {
// 		return
// 	}

// 	// reactInstance._reactInternalFiber.key
// 	const pathId =
// 		reactInstance.props.id !== undefined && reactInstance.props.id !== null
// 			? reactInstance.props.id
// 			: reactInstance._reactInternalFiber._debugID
// 	const parent = reactInstance._reactInternalFiber._debugOwner
// 	if (parent) {
// 		const parentInstance = parent.stateNode
// 		const parentPath = getReactInstancePath(parentInstance)
// 		return [...parentPath, pathId]
// 	} else {
// 		return [pathId]
// 	}
// }

// const db = new Database()
// window["db"] = db

// class ChetComponent<Props> extends React.Component<
// 	Props & { id?: number | string }
// > {
// 	constructor(props: Props) {
// 		super(props)
// 	}

// 	get path(): Array<number> {
// 		return getReactInstancePath(this)
// 	}

// 	rerender = () => this.forceUpdate()
// 	unmount = new Set<() => void>()

// 	componentWillUnmount() {
// 		this.unmount.forEach(fn => fn())
// 	}

// 	db = {
// 		get: (path: Path) => {
// 			this.unmount.add(db.listen(path, this.rerender))
// 			return db.get(path)
// 		},
// 		initialize: (path: Path, value: any) => {
// 			if (db.get(path) === undefined) {
// 				db.set(path, value)
// 			}
// 		},
// 		set: (path: Path, value: any) => {
// 			return db.set(path, value)
// 		},
// 	}
// }

// class Counter extends ChetComponent<{ delta: number }> {
// 	componentWillMount() {
// 		this.db.initialize([...this.path, "count"], 1)
// 	}

// 	render() {
// 		const count = this.db.get([...this.path, "count"])
// 		return (
// 			<div>
// 				<button
// 					onClick={() =>
// 						this.db.set([...this.path, "count"], count - this.props.delta)
// 					}
// 				>
// 					dec
// 				</button>
// 				<span>{count}</span>
// 				<button
// 					onClick={() =>
// 						this.db.set([...this.path, "count"], count + this.props.delta)
// 					}
// 				>
// 					inc
// 				</button>
// 			</div>
// 		)
// 	}
// }

// export class App extends ChetComponent<{}> {
// 	componentWillMount() {
// 		this.db.initialize([...this.path, "deltaCounter", "count"], 2)
// 	}

// 	render() {
// 		const delta = this.db.get([...this.path, "deltaCounter", "count"])
// 		return (
// 			<div>
// 				<Counter id="deltaCounter" delta={1} />
// 				<Counter delta={delta} />
// 			</div>
// 		)
// 	}
// }
