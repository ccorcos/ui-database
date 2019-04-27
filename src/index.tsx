import * as React from "react"
import * as ReactDOM from "react-dom"
import { css } from "glamor"
import { OneCounterApp } from "./examples/0-Counter"
import { TwoIndependentCountersApp } from "./examples/1-TwoIndependentCounters"
import { TwoDependentCountersApp } from "./examples/2-TwoDependentCounters"
import { DeltaCountersApp } from "./examples/3-DeltaCounters"
import { ListOfCountersApp } from "./examples/4-ListOfCounters"

css.global("a", {
	color: "inherit",
	textDecoration: "none",
})

const root = document.createElement("div")
document.body.appendChild(root)

// ReactDOM.render(<OneCounterApp />, root)
// ReactDOM.render(<TwoIndependentCountersApp />, root)
// ReactDOM.render(<TwoDependentCountersApp />, root)
// ReactDOM.render(<DeltaCounters />, root)
ReactDOM.render(<ListOfCountersApp />, root)
