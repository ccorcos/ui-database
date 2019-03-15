# UI Database

This idea involves a global state tree. You can use the path to the component for local state or you can use whatever global state you'd like.

## Benefits

- global state is more transparent
- can easily track and replay state like redux.
- component state is independent of rendering. for example, you can open some crazy nested popup just by modifying the state.

## To Do

- stricter types
- any component can override its path.
- syntax sugar for getting global path vs child path.
