# Notion Architecture

The current Notion architecture exploits the fact that JavaScript is single-threaded.
- When `AutoListener.startListener` is called, a global `AutoListener.currentListener` is set to the current AutoListener.
- Then any time `Store.getState()` is called, the store calls `AutoListener.currentListener.logStoreAccess` which registers a listener on the store.
- Components should subclass the custom Component<Props,Stores> class which uses Stores instead of React local state. A component defines static properties for stores and will construct stores when the component is constructed, or it can accept stores as props.

## Analysis

- The magical reactivity pattern has a nice mental model. You never have to think about reactivity when you're building something. *It just works*. However, this can lead to confusion about how components re-render. There's a pattern that has been widely adopted that has some problems as well. When using a higher-order component, the stores will trigger a re-render in the child component which is awesome, but the props won't trigger a re-render. In the example below, changing `store.state.b` triggers `HigherOrderComponent`, but changing `this.props.a` does not trigger `HigherOrderComponent` to re-render.

		```ts
		class ParentComponent extends Component {
			renderChild = (childProps) => {
				return (
					<ChildComponent
						{...childProps}
						a={this.props.a}
						b={this.stores.store.state.b}
					/>
			}
			return (
				<HigherOrderComponent
					renderItem={this.renderChild}
				>
			)
		}

- Passing stores around and override store state is really nice. Everything up to `ListOf` demonstrate how flexible and easy this pattern is.

- Once we get to the ListOf component, you'll notice that the store abstraction doesn't actually work unless we persist data somewhere globally and use RecordStores. We also have to use this `createChildStore` abstraction to cachet the object references so we can efficiently re-render. Ironically, we've gotten pretty far at Notion using Stores and it appears that the only complex abstractions we have actually persist to the database and therefore use RecordStore. This leads me to a couple thoughts.
	- Perhaps this amount of abstraction isn't necessary to build a complex application?
	- Perhaps we should forego Stores and just use RecordStores for everything.
	- RecordStores have a small type-leak when you assume an id points to a specific type of store.

- The rest of the Counter challenge is simple. Using global stores to hold state. And using RecordStores to initialize values. However, this doesnt' demonstrate the challenges very well.
	- Rendering one component can initialize a store for rendering other components. This is the case for a popup inside a modal. Its super annoying and means that everything needs to be made global for it to be headlessly controlled.
	- Behaviors like fetching data happen inside components like `<Request/>`. Ideally, these requests should be made based on the state so that the request could be fired headless and the component simply catches on and renders what it needs to.

## Improvements

- Eliminate magical reactivity in favor of explicit reactivity.
- Model the entire UI state with RecordStores and create a well-typed interface for accessing joins.
- Create services that react to state changes to make sync requests so everything can be controlled headless.