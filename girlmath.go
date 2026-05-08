package main

import (
	"html/template"
	"net/http"
)

type embedData struct {
	Verdict  string
	Amount   string
	CSSClass string
	Message  string
	Scenario string
	Price    string
}

var embedTmpl = template.Must(template.ParseFiles("static/embed.html"))

func embedHandler(writer http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	scenario := query.Get("s")
	price := query.Get("p")
	benefit := query.Get("r")

	var displayAmount, displayVerdict, cssClass, message string

	switch benefit {
	case "is-free":
		displayAmount = "$0.00"
		displayVerdict = "FREE"
		cssClass = "is-free"
	case "is-profit":
		displayAmount = "+$" + price
		displayVerdict = "PROFIT"
		cssClass = "is-profit"
	case "is-loss":
		displayAmount = "-$" + price
		displayVerdict = "LOSS"
		cssClass = "is-loss"
	default:
		displayAmount = "$" + price
		displayVerdict = "CHECK"
		cssClass = ""
	}

	switch scenario {
	case "treat":
		message = "Treating myself and the math says it's literally free. Girl Math is real math."
	case "sale":
		if benefit == "is-profit" {
			message = "I just made money on a sale. This isn't saving, this is earning. Girl Math certified."
		} else {
			message = "Full price means I'm a trendsetter who shops first and asks later. Girl Math logic."
		}
	case "refund":
		message = "I just got paid by past-me. Refunds are basically a new income stream. Girl Math eternal."
	case "skipped":
		message = "I didn't buy it, so I basically earned $" + price + " today. Girl Math is unbeatable."
	case "cpw":
		switch benefit {
		case "is-free":
			message = "Cost per wear collapsed to zero. I've officially broken the economy. Girl Math forever."
		case "is-profit":
			message = "My cost per wear is so low this is basically a rental now. Girl Math never loses."
		default:
			message = "Need more wears, but the potential is immaculate. Girl Math is a long game."
		}
	case "ppd":
		switch benefit {
		case "is-free":
			message = "Price per day is nothing. This item has already paid for itself in vibes. Girl Math eternal."
		case "is-profit":
			message = "Paying pennies per day for this level of joy? That's a steal. Girl Math approved."
		default:
			message = "Still early in the amortization. Give it time, the numbers will come around. Girl Math patient."
		}
	case "split":
		if benefit == "is-free" {
			message = "Split enough ways that my share rounds to zero. Communal joy is mathematically free. Girl Math."
		} else {
			message = "Shared cost, undivided vibes. Girl Math is a team sport."
		}
	case "alt":
		switch benefit {
		case "is-profit":
			message = "I just saved $" + price + " by using an alternative site. That's literally profit. Girl Math wins again."
		case "is-loss":
			message = "I paid more elsewhere, but the cheaper one was probably fake. Peace of mind has a price. Girl Math."
		default:
			message = "Same price everywhere? That means I got it for free by not paying more. Girl Math airtight."
		}
	default:
		message = "The numbers are in and they're beautiful. Girl Math is real math."
	}

	scenarioLabel := map[string]string{
		"treat":   "Buying a little treat",
		"sale":    "It was on sale",
		"refund":  "Returning an item",
		"skipped": "Walked away",
		"cpw":     "Cost per wear",
		"ppd":     "Price per day",
		"split":   "Splitting with friends",
		"alt":     "Alternative site",
	}[scenario]
	if scenarioLabel == "" {
		scenarioLabel = scenario
	}

	data := embedData{
		Verdict:  displayVerdict,
		Amount:   displayAmount,
		CSSClass: cssClass,
		Message:  message,
		Scenario: scenarioLabel,
		Price:    price,
	}

	writer.Header().Set("Content-Type", "text/html; charset=utf-8")
	embedTmpl.Execute(writer, data)
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("static")))
	http.HandleFunc("/embed", embedHandler)

	println("Listening on http://localhost:8672")
	http.ListenAndServe(":8672", nil)
}
