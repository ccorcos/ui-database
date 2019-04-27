# UI Database

This idea involves a global state tree. You can use the path to the component for local state or you can use whatever global state you'd like.

## Benefits

- global state is more transparent
- can easily track and replay state like redux.
- component state is independent of rendering. for example, you can open some crazy nested popup just by modifying the state.

## To Do

- [x] todomvc
- [] stricter types
	- [] Use Proxy to create an easy to use, well typed database...
	- [] Most state can be global. Its up to the dev to make abtractions.
	- [] Local state like button hovers can use just a random id.
	- [] Controlling local subtree state means passing an entity id down to the child.
- [] any component can override its path.
- [] syntax sugar for getting global path vs child path.
