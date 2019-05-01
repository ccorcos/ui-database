# UI Framework

The goal of this document is to explore ways of improving the frontend architecture at Notion.

## The Counter Challenge

This is a series of contrived examples that tries to highlight various pain points with UI architectures. All UI architectures should have some way of completing this challenge, but the real challenge is more nuanced -- it's the elegance, simplicity, and ease of use.

1. Build a counter.

	This counter should be configurable to set the initial count, as well as configure the amount the counter increments and decrements.

2. Build two independent counters.

    How easy it is to reuse code?

3. Build two dependent counters that reflect the same number.

    How easy is it to separate the state, control, and presentation of the counter?

4. Make one counter control the amount the other counter increments and decrements.

    How flexible are these separate abstractions?

5. Make a higher-order `ListOf` component that creates an arbitrary list of components.

    Do these abstractions compose together?

6. Make two dependent counters that are distant components of each other.

    How do we handle global state? Do we give up purity altogether? Can we maintain purity without a massive amount of plumbing?

7. Create keyboard shortcuts for controlling the list of counters, shifting focus between counters.

    Is it hard to introspect into the state of the application entirely outside of the instantaited components and rendered state?

8. Click a button which creates a new counter initialized with count 10 and the keyboard focused on the new counter.

    Do we have full headless control of the application? Do we have to use the state of the DOM, component instances, or wait for re-renders in order to put the UI in an arbitrary state?
