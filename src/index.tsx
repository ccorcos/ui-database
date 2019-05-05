import * as React from "react"
import * as ReactDOM from "react-dom"
import { css } from "glamor"

css.global("a", {
	color: "inherit",
	textDecoration: "none",
})

const root = document.createElement("div")
document.body.appendChild(root)

// import { CounterApp } from "./0-notion-architecture/0-counter"
// ReactDOM.render(<CounterApp />, root)

// import { IndependentCountersApp } from "./0-notion-architecture/1-independent-counters"
// ReactDOM.render(<IndependentCountersApp />, root)

// import { DependentCountersApp } from "./0-notion-architecture/2-dependent-counters"
// ReactDOM.render(<DependentCountersApp />, root)

// import { DeltaCountersApp } from "./0-notion-architecture/3-delta-counters"
// ReactDOM.render(<DeltaCountersApp />, root)

// import { ListOfCountersApp } from "./0-notion-architecture/4-listof"
// ReactDOM.render(<ListOfCountersApp />, root)

// import { CounterApp } from "./1-notion-revised/0-counter"
// ReactDOM.render(<CounterApp />, root)

// import { IndependentCountersApp } from "./1-notion-revised/1-independent-counters"
// ReactDOM.render(<IndependentCountersApp />, root)

// import { DependentCountersApp } from "./1-notion-revised/2-dependent-counters"
// ReactDOM.render(<DependentCountersApp />, root)

// import { DeltaCountersApp } from "./1-notion-revised/3-delta-counters"
// ReactDOM.render(<DeltaCountersApp />, root)

// import { ListOfCountersApp } from "./1-notion-revised/4-listof"
// ReactDOM.render(<ListOfCountersApp />, root)

// import { CounterApp } from "./2-notion-revised/0-counter"
// ReactDOM.render(<CounterApp />, root)

// import { IndependentCountersApp } from "./2-notion-revised/1-independent-counters"
// ReactDOM.render(<IndependentCountersApp />, root)

// import { DependentCountersApp } from "./2-notion-revised/2-dependent-counters"
// ReactDOM.render(<DependentCountersApp />, root)

// import { DeltaCountersApp } from "./2-notion-revised/3-delta-counters"
// ReactDOM.render(<DeltaCountersApp />, root)

import { ListOfCountersApp } from "./2-notion-revised/4-listof"
ReactDOM.render(<ListOfCountersApp />, root)
