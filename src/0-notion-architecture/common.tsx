import * as React from "react"

// ===========================================================================
// AutoListener.
// ===========================================================================

export class AutoListener {
	constructor(private onChange: (store: Store) => void) {}

	// Global variable indicating the current context.
	static currentListener: AutoListener | null = null

	// Keep track of the last listener context so you can replace it.
	private lastListener: AutoListener | null = null

	// Every time we start the listener, we increment the listenCycle so
	// we can determine which stores we accessed on the latest cycle and
	// which stores to stop listening from.
	public listenCycle = 0
	private listenerVersionMap = new Map<Store, number>()

	// Start listening for calls to Store.getState()
	public startListener() {
		this.lastListener = AutoListener.currentListener
		AutoListener.currentListener = this
		this.listenCycle++
	}

	// Store.getState() calls this function which listens to the store.
	public logStoreAccess(store: Store) {
		if (!this.listenerVersionMap.has(store)) {
			store.addListener(this.onChange)
		}
		this.listenerVersionMap.set(store, this.listenCycle)
	}

	// Stop listening for calls to Store.getState()
	public stopListener() {
		// Replace the previous listener.
		AutoListener.currentListener = this.lastListener

		// Unsubscribe to stores not requested this cycle.
		this.listenerVersionMap.forEach((storeCycle, store) => {
			if (storeCycle < this.listenCycle) {
				if (this.listenerVersionMap.has(store)) {
					store.removeListener(this.onChange)
					this.listenerVersionMap.delete(store)
				}
			}
		})
	}

	// Destory the autolistener and cleanup.
	public destroy() {
		this.listenerVersionMap.forEach((renderCount, store) => {
			if (this.listenerVersionMap.has(store)) {
				store.removeListener(this.onChange)
				this.listenerVersionMap.delete(store)
			}
		})
	}
}

// ===========================================================================
// Store.
// ===========================================================================

export class Store<State = any> {
	instanceState = this.getInitialState()

	// Subclass must override this function!
	getInitialState(): State {
		return {} as State
	}

	public getState(): State {
		const listener = AutoListener.currentListener
		if (listener) {
			listener.logStoreAccess(this)
		}
		return this.instanceState
	}

	public setState(state: State) {
		this.instanceState = state
		this.emit()
	}

	private listeners: Set<(store: Store<State>) => void> = new Set()

	public addListener(callback: (store: Store<State>) => void) {
		this.listeners.add(callback)
	}

	public removeListener(callback: (store: Store<State>) => void) {
		this.listeners.delete(callback)
	}

	public emit() {
		this.listeners.forEach(callback => {
			callback(this)
		})
	}
}

// ===========================================================================
// Component.
// ===========================================================================

type StoresMap = { [key: string]: Store<unknown> }
type StoreTypes<I extends StoresMap> = { [K in keyof I]: new () => I[K] }

// A component can accept stores as props which will override the component
// store so you can inspect and control a child component's state.
type ComponentProps<Props, Stores> = Props & Partial<Stores>

export class Component<
	Props = {},
	Stores extends StoresMap = {}
> extends React.PureComponent<ComponentProps<Props, Stores>, {}> {
	props: Readonly<
		{ children?: React.ReactNode } & ComponentProps<Props, Stores>
	>

	// Define the store constructors so we can create new stores if they aren't
	// passed as props.
	storeTypes: StoreTypes<Stores>
	stores = {} as Stores

	// Create `this.stores` by either grabbing the store from props or creating a
	// new one from this.storeTypes.
	componentWillMount() {
		for (const key in this.storeTypes) {
			if (this.props[key]) {
				this.stores[key] = this.props[key] as any
			} else if (this.storeTypes[key]) {
				const storeClass = this.storeTypes[key]
				this.stores[key] = new storeClass()
			}
		}
	}

	// Create an AutoListener for this component.
	handleForceUpdate = () => this.forceUpdate()
	autoListener = new AutoListener(this.handleForceUpdate)

	// Cleanup the AutoListener when the component unmounts.
	componentWillUnmount() {
		this.autoListener.destroy()
	}

	// Subclass must override this function to reactively render
	// based on `Store.getState()`
	renderComponent(): React.ReactNode {
		return null
	}

	// Wrap renderComponent with startListener / stopListener.
	render() {
		this.autoListener.startListener()
		const result = this.renderComponent()
		this.autoListener.stopListener()
		return result
	}
}

// ===========================================================================
// RecordStore.
// ===========================================================================

export function randomId() {
	return Math.round(Math.random() * 1e20).toString()
}

const recordMap: { [id: string]: any } = {}

// Similar to a Store except the state is persisted.
export class RecordStore<State = any> extends Store<State> {
	constructor(public id: string) {
		super()
		const value = recordMap[id]
		if (value === undefined) {
			recordMap[id] = this.getInitialState()
		}
	}

	setState(value: State) {
		recordMap[this.id] = value
		super.setState(value)
	}

	getState(): State {
		super.getState()
		return recordMap[this.id]
	}

	// Need to cache child stores so we don't create new references every
	// time which kills rendering performance and garbage collection thrashing.
	// We're still relying on garbage collection to clean all of this up when
	// it's no longer referenced anywhere.
	childStores: { [id: string]: RecordStore } = {}
	createChildStore<T extends RecordStore>(
		id: string,
		NewStore: { new (id: string): T }
	) {
		if (this.childStores[id]) {
			return this.childStores[id]
		} else {
			this.childStores[id] = new NewStore(id)
			return this.childStores[id]
		}
	}
}
