# Notion Architecture Revised

- [x] `Cursor<Table>` for relations.
- namespace `App.Schema` for creating new stores.
- ~`db[table].set` and `db[table].get` to avoid raw strings.~

## Analysis

This looks pretty good!

- Still need to figure out if its possible to code split the app state with default values in separate places. I suspect not. And afterall, this may be a meaningless optimization. The state shouldn't grow nearly as fast as components and everything else.

- The database context is really nice. All of our services for things like keyboard behaviors can accept the database as an argument to keep everything *pure*. And we can render components side-by-side with different UI databases, avoiding globals.

- No more need for `db[table].set` and `db[table].get` because we're now just using `Pointer<Table>` which is working great.

- In comparison to Redux, there are a couple interesting differences. Rather than have a huge state object and pass a Path to components, we simply flatten everything out into a database format. Some benefits of this:
	- More performant prop diffing. Only need to compare table and id instead of the ever-deeper path.
	- More performant for lists. Deleting an object from a list changes the index of all items after which changes the path and causes a bunch of annoying re-rendering.
	- Using *magical reactivity* instead of explicit reactivity which becomes really handy once the application state becomes sufficiently complex and you want to reactivtly listen to one thing vs another thing. Basically, `Stream.liftA2` is implicit which is great, but `liftA2` is miserable to use and understand.

- The one thing that we seem to give up is some understanding at a type-level of the current state of the application. For example, perhaps we have some `Pointer<"modal">` which has a state of `{open: false} | {open: true, info: any}`. Some component inside the modal might get a pointer to the modal to render some part of the `info`. Certainly we could pass the info as props, but if we pass the pointer, we have to type guard against the closed state even though it should logically be an invalid state. **How can we type this better?**

	This is effectively the type definition for our `AppState`.

	```ts
	type ModalState = {open: false} | {open: true, info: any}
	type AppState = {
		modal: ModalState
	}
	```

	This is currently how we're doing things at Notion so we aren't any worse off. But in some ways, it would be nice if the type system could do some work for us holding an understanding the app state. Basically we need to make the modal state a generic on the app state.

	```ts
	type OpenState = {open: true, info: any}
	type ClosedState = {open: false}
	type ModalState = OpenState | ClosedState
	type AppState<M extends ModalState> = {
		modal: M
	}
	```

	Now our database / app state can be checked if the modal is open. Suppose we pass the database through to all our components as props instead of context, then we could actually type guard and app state and only pass an open modal database state to the modal component.

	```ts
	class Modal extends Component<{db: db<OpenState>}> {}
	```

	TypeScript is not helping us out with this pattern though. Eventually, you're going to have a bunch of modals and a bunch of other states which is going to involve a crazy amount of generics. Keeping track of which is what would be a nightmare especially if you don't care about most of the other states.

	It would be nice if TypeScript supported something more like a taggest generic. And also, if there was some syntax like `as const` which would plumb all the union types up through the parent type as a generic. Nested union objects like this would require higher-kinded types though I think. As soon as one of the keys is a generic, how do we plumb that generic up to the parent object?

	TODO: let's open up a feature request with TypeScript and see what they think.
