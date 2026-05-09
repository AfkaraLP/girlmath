/* Scenario toggle */
function onScenarioChange() {
  const scenario = document.getElementById("scenario").value;
  ["treat", "sale", "cpw", "ppd", "split", "alt"].forEach((id) => {
    document.getElementById(id + "-fields").classList.remove("visible");
  });
  const map = {
    treat: "treat",
    sale: "sale",
    cpw: "cpw",
    ppd: "ppd",
    split: "split",
    alt: "alt",
  };
  if (map[scenario])
    document.getElementById(map[scenario] + "-fields").classList.add("visible");
}

/* Randomizer */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function appendAnalytics(scenario, inputs) {
  if (!["treat", "sale", "cpw", "ppd", "split", "alt"].includes(scenario)) {
    return;
  }
  try {
    const analytics = JSON.parse(localStorage.getItem("stats") || "[]");
    analytics.push({
      scenario: scenario,
      timestamp: Date.now(),
      inputs: inputs,
    });

    localStorage.setItem("stats", JSON.stringify(analytics));
  } catch (e) {
    console.error(e);
  }
}

/* Copy embed URL to clipboard */
function copyEmbed(e, url) {
  e.preventDefault();
  navigator.clipboard.writeText(url).then(() => {
    const el = e.target;
    const orig = el.textContent;
    el.textContent = "Copied!";
    setTimeout(() => (el.textContent = orig), 2000);
  });
}

/* Date string for receipt */
function receiptDate() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* Receipt line builder */
function addLine(label, val) {
  return `<div class="receipt-line"><span>${label}</span><span class="val">${val}</span></div>`;
}

/* Typewriter effect */
function typewrite(el, text, speed = 28) {
  el.innerHTML = "";
  const cursor = document.createElement("span");
  cursor.className = "tw-cursor";
  el.appendChild(cursor);
  let i = 0;
  const iv = setInterval(() => {
    if (i >= text.length) {
      clearInterval(iv);
      cursor.remove();
      return;
    }
    el.insertBefore(document.createTextNode(text[i]), cursor);
    i++;
  }, speed);
}

/* Confetti burst */
function confetti() {
  const colors = ["#ff1a78", "#ff6ba8", "#c9a84c", "#ffffff", "#ffb3cf"];
  for (let i = 0; i < 55; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = Math.random() * 8 + 4 + "px";
    el.style.height = Math.random() * 8 + 4 + "px";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.animationDuration = Math.random() * 1.5 + 1.2 + "s";
    el.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

/* Show receipt */
function showReceipt({
  lines,
  amount,
  amountClass,
  verdict,
  justification,
  footerNote,
}) {
  const receipt = document.getElementById("receipt");
  const divider = document.getElementById("receipt-divider");

  // Reset
  receipt.classList.remove("visible");
  receipt.style.display = "none";
  divider.style.display = "none";

  // Build lines HTML
  document.getElementById("receipt-lines").innerHTML = lines.join("");

  // Amount
  const amountEl = document.getElementById("receipt-amount");
  amountEl.textContent = amount;
  amountEl.className = "receipt-amount " + (amountClass || "");

  // Verdict
  const verdictEl = document.getElementById("receipt-verdict");
  verdictEl.textContent = verdict;
  verdictEl.className = "verdict " + (amountClass || "");

  // Footer
  if (footerNote)
    document.getElementById("receipt-footer").innerHTML =
      footerNote + "<br>GIRL MATH IS REAL MATH<br>— ✦ —";

  // Show
  setTimeout(() => {
    divider.style.display = "flex";
    receipt.style.display = "block";
    void receipt.offsetWidth;
    receipt.classList.add("visible");
    // Scroll to receipt
    setTimeout(
      () => receipt.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      100,
    );
    // Typewrite justification
    typewrite(document.getElementById("receipt-just"), justification, 22);
    // Confetti on profit/free
    if (amountClass !== "is-loss") confetti();
  }, 50);
}

/* Main calculation */
function calculate() {
  const scenario = document.getElementById("scenario").value;
  const priceRaw = document.getElementById("price").value;
  const price = parseFloat(priceRaw) || 0;

  const fmt = (n) => "$" + Math.abs(n).toFixed(2);
  let lines = [];
  let amount = "$0.00",
    amountClass = "is-free",
    verdict = "FREE",
    just = "",
    footerNote = "";

  lines.push(addLine("Date", receiptDate()));
  lines.push(
    addLine(
      "Scenario",
      document.getElementById("scenario").options[
        document.getElementById("scenario").selectedIndex
      ].text,
    ),
  );
  lines.push(addLine("Tag Price", fmt(price)));

  //  TREAT
  if (scenario === "treat") {
    const payment = document.getElementById("payment").value;
    const shipping = parseFloat(document.getElementById("shipping").value) || 0;
    const payLabels = {
      card: "Card",
      cash: "Cash (physical)",
      giftcard: "Gift Card",
      venmo: "Venmo/CashApp",
      points: "Reward Points",
      found: "Found Money",
    };
    lines.push(addLine("Payment Method", payLabels[payment]));
    if (shipping > 0) lines.push(addLine("Shipping", fmt(shipping)));

    if (price === 0) {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "COMPLIMENTARY";
      just = pick([
        "It was literally zero dollars. You were simply taking up valuable shelf space in the store.",
        "The item costs nothing. The real cost was the restraint you showed in not buying three.",
        "Free. Gratis. On the house. Stop reading this receipt and go enjoy it.",
      ]);
    } else if (["points", "found", "giftcard"].includes(payment)) {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "FREE MONEY™";
      just = pick(
        {
          points: [
            "Reward points are imaginary money earned from real spending. You have completed the cycle.",
            "Points aren't real dollars. They are vibes that someone assigned a number to. Cost: zero.",
          ],
          found: [
            "Money found is money gifted by the universe. It had a destiny, and that destiny is this.",
            "The sidewalk / couch / old jacket paid for it. You are simply a vessel.",
          ],
          giftcard: [
            "Gift card money is Monopoly money with better vibes. It never existed in your real account.",
            "Someone gave you a gift card because they love you. This purchase honours that love.",
          ],
        }[payment],
      );
    } else if (payment === "cash") {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "CASH = FREE";
      just = pick([
        "Cash doesn't appear on any bank statement, therefore it did not financially happen.",
        "Physical bills exist outside the digital banking system. Off the books. Legally complimentary.",
        "You paid in cash. There is no record of this transaction. It was always free.",
      ]);
    } else if (payment === "venmo") {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "VENMO BALANCE™";
      just = pick([
        "Venmo balance is money that already left your account in the past. This purchase is historical.",
        "Someone owed you money. They paid you on Venmo. You spent that. Net change to your finances: nothing.",
        "The Venmo balance isn't 'real' money until you transfer it. You intercepted it mid-journey. Free.",
      ]);
    } else if (shipping > 0 && shipping >= price) {
      amount = fmt(price + shipping);
      amountClass = "";
      verdict = "RED FLAG";
      just =
        "Shipping costs as much as the item. Cancel this order. Add something to your cart to hit the free shipping threshold. We need to be smarter than this.";
      footerNote = "NOT A CERTIFIED GIRL MATH WIN";
    } else if (shipping > 0 && shipping < 15) {
      const threshold = Math.max(50, price * 1.5);
      const needed = (threshold - price).toFixed(2);
      amount = fmt(price + shipping);
      amountClass = "";
      verdict = "CORRECTABLE";
      just = `Shipping charges are a tax on inaction. Add ${fmt(needed)} more to your cart to unlock free shipping. You would be saving $${shipping.toFixed(2)} while enriching your life.`;
    } else if (price < 5) {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "NECESSITY";
      just = pick([
        "Items under $5 fall below the financial visibility threshold. This rounds to a human right.",
        "Under $5 is entry-level spending. The coffee you bought before calculating this cost more.",
        "$" +
          price.toFixed(2) +
          " is not a purchase. It's a rounding error on your tax return. Irrelevant.",
      ]);
    } else {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "JUSTIFIED";
      just = pick([
        "The emotional dividend alone covers the cost. Your nervous system will thank you.",
        "You've earned this. The happiness-adjusted cost is zero. The math is flawless.",
        "This is an investment in the version of yourself who deserves nice things. That version is you.",
        "Future you will look back and call this a bargain. Trust her. She has the receipts.",
      ]);
    }
    appendAnalytics("treat", {
      price: price,
      shipping: shipping,
      payment: payment,
    });

    //  SALE
  } else if (scenario === "sale") {
    const orig =
      parseFloat(document.getElementById("original-price").value) || 0;
    if (orig > 0) lines.push(addLine("Original Price", fmt(orig)));
    lines.push(addLine("You Paid", fmt(price)));

    if (orig <= price && price > 0) {
      amount = fmt(price);
      amountClass = "";
      verdict = "FULL PRICE PIONEER";
      just = pick([
        "No sale? You got it before it sold out. Exclusivity pricing. A collector's premium.",
        "You paid full price, which means you are the tastemaker who moved first. That's worth something.",
      ]);
    } else {
      const saved = orig - price;
      lines.push(addLine("You Saved", "+" + fmt(saved)));
      amount = "+" + fmt(saved);
      amountClass = "is-profit";
      verdict = "PROFIT";
      just = pick([
        `You generated ${fmt(saved)} from nothing. That is income. Please go spend your earnings on something else.`,
        `A saving of ${fmt(saved)} is a revenue event. Deposit it immediately into a new purchase.`,
        `The discount is essentially a cheque written to you. Cash it. On a new item. Today.`,
      ]);
    }

    appendAnalytics("sale", {
      price: price,
      orig: orig,
    });
    //  REFUND
  } else if (scenario === "refund") {
    amount = "+" + fmt(price);
    amountClass = "is-profit";
    verdict = "NEW INCOME";
    lines.push(addLine("Refund Received", "+" + fmt(price)));
    just = pick([
      `Your account gained ${fmt(price)}. This is functionally identical to earning ${fmt(price)}. You just got paid.`,
      `A refund is a gift from past-you to present-you. She bought it, you sold it back. The profit is yours.`,
      `${fmt(price)} returned to your account. The original purchase has been erased from history. The money, however, is real and new.`,
    ]);
    appendAnalytics("refund", { price: price });

    //  SKIPPED
  } else if (scenario === "skipped") {
    lines.push(addLine("Cost Avoided", "+" + fmt(price)));
    amount = "+" + fmt(price);
    amountClass = "is-profit";
    verdict = "SAVINGS = INCOME";
    just = pick([
      `You did not spend ${fmt(price)}, which is mathematically equivalent to earning ${fmt(price)}. Deposit it immediately.`,
      `The money that stays in your account due to your restraint is a return on investment. You are an investor.`,
      `By walking away, you effectively paid yourself ${fmt(price)}. Use this as justification for the next purchase.`,
    ]);

    appendAnalytics("skipped", { price: price });
    //  COST PER WEAR
  } else if (scenario === "cpw") {
    const wears = parseInt(document.getElementById("wears").value) || 0;
    if (wears > 0) lines.push(addLine("Estimated Wears", wears));
    const cpw = wears > 0 ? price / wears : price;
    if (wears > 0) lines.push(addLine("Cost Per Wear", fmt(cpw)));

    if (!wears) {
      amount = fmt(price);
      amountClass = "";
      verdict = "ARCHIVE PIECE";
      just = pick([
        "Zero wears means it's a display item. Reclassify as home décor and stop feeling guilty.",
        "You're not going to wear it. It's a collectible now. Some things are art.",
      ]);
    } else if (cpw < 1) {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "PENNIES PER WEAR";
      just = pick([
        "The cost per wear is under one dollar. At this price-per-use you are actively losing money by NOT wearing it more.",
        "Fractions of a cent per use means this item has negative cost. You broke economics.",
        "Under a dollar per wear is a utility rate that rivals your electricity bill. Better value, cuter outfit.",
      ]);
    } else if (cpw < 5) {
      amount = fmt(cpw) + " / wear";
      amountClass = "is-profit";
      verdict = "EXCEPTIONAL ROI";
      just = pick([
        `${fmt(cpw)} per wear is cheaper than a single use of most disposable products. Immaculate value.`,
        `At ${fmt(cpw)} per occasion, this is statistically the best financial decision in your wardrobe.`,
      ]);
    } else {
      amount = fmt(cpw) + " / wear";
      amountClass = "";
      verdict = "WEAR IT MORE";
      just = `Currently ${fmt(cpw)} per wear. Get the cost down by increasing wears. You know what to do — start planning outfits tonight.`;
    }
    appendAnalytics("cpw", {
      price: price,
      wears: wears,
    });

    //  PRICE PER DAY
  } else if (scenario === "ppd") {
    const days = parseInt(document.getElementById("days-owned").value) || 0;
    if (days > 0) lines.push(addLine("Days Owned", days));
    const ppd = days > 0 ? price / days : price;
    if (days > 0) lines.push(addLine("Cost Per Day", fmt(ppd)));

    if (!days) {
      amount = fmt(price);
      amountClass = "";
      verdict = "NEW ACQUISITION";
      just =
        "Enter days owned to unlock the full justification. The number will be very small. That's the point.";
    } else if (ppd < 0.1) {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "HERITAGE PIECE";
      just = pick([
        `${fmt(ppd)} per day. This is cheaper than breathing in a major city. Certified free.`,
        `At ${fmt(ppd)}/day, the item has already paid for itself in vibes approximately ${Math.round(days / 30)} months ago.`,
        `The daily rate has collapsed to nothing. You own a classic now. It's priceless.`,
      ]);
    } else if (ppd < 1) {
      amount = fmt(ppd) + " / day";
      amountClass = "is-profit";
      verdict = "DEEPLY REASONABLE";
      just = `At ${fmt(ppd)} per day, you're paying less than a gumball machine for the privilege of owning this. A triumph of the long game.`;
    } else {
      amount = fmt(ppd) + " / day";
      amountClass = "";
      verdict = "KEEP USING IT";
      just = `Still ${fmt(ppd)}/day. Keep using it daily and check back in ${Math.round(days / 2)} more days — the numbers will look much better.`;
    }

    appendAnalytics("ppd", {
      price: price,
      days: days,
    });

    //  SPLIT
  } else if (scenario === "split") {
    const people = parseInt(document.getElementById("friends").value) || 1;
    const each = price / Math.max(people, 1);
    lines.push(addLine("People Splitting", people));
    lines.push(addLine("Your Share", fmt(each)));

    if (people < 2) {
      amount = fmt(price);
      amountClass = "";
      verdict = "SOLO";
      just =
        "You're splitting with yourself? That's called paying full price. Add friends. This is a group activity.";
    } else if (each < 5) {
      amount = "$0.00";
      amountClass = "is-free";
      verdict = "BELOW THRESHOLD";
      just = pick([
        `${fmt(each)} each is not a real number. It doesn\'t even register as a purchase. This is communal joy, and communal joy is free.`,
        `When you divide ${fmt(price)} among ${people} beautiful people, the result is ${fmt(each)}. Which rounds to nothing.`,
      ]);
    } else {
      amount = fmt(each) + " / person";
      amountClass = "is-profit";
      verdict = "COLLABORATION WIN";
      just = pick([
        `Your individual exposure is only ${fmt(each)}. The thrill, however, is shared equally at 100% each. Exceptional economics.`,
        `${fmt(each)} per person is the girl math sweet spot. Shared costs, undivided vibes.`,
      ]);
    }
    appendAnalytics("split", {
      price: price,
      people: people,
    });
    //  ALTERNATIVE SITE
  } else if (scenario === "alt") {
    const newPrice =
      parseFloat(document.getElementById("new-price").value) || 0.0;

    const difference = price - newPrice;

    if (difference > 0) {
      amount = "+" + fmt(difference);
      amountClass = "is-profit";
      verdict = "SAVINGS = INCOME";

      just = `You showed those greedy people from the other site who’s boss. You not only got that favorite purse you’ve been eyeing for so long, but you also saved ${fmt(difference)} in the process.`;
    } else if (difference < 0) {
      amount = "-" + fmt(Math.abs(difference));
      amountClass = "is-loss";
      verdict = "EVEN QUEENS AREN’T PERFECT";

      just = `You may have spent ${fmt(Math.abs(difference))} more, but the cheaper one was probably fake anyway.`;
    } else {
      amount = fmt(0);
      amountClass = "is-free";
      verdict = "BALANCED LIKE A BUDGET QUEEN";

      just = `Same price? That basically means you got it for free, because you didn’t pay more than the other girls did.`;
    }

    appendAnalytics("alt", {
      price: price,
      newPrice: newPrice,
    });
  }

  // Build embed URL for this result
  const embedParams = new URLSearchParams({
    s: scenario,
    p: priceRaw,
    r: amountClass,
  });
  const embedUrl = location.origin + "/embed?" + embedParams;

  if (footerNote) footerNote += "<br><br>";
  footerNote +=
    '<span class="embed-link">&#10022; <a href="#" onclick="copyEmbed(event, \'' +
    embedUrl +
    "')\">Share this result</a></span>";

  showReceipt({
    lines,
    amount,
    amountClass,
    verdict,
    justification: just,
    footerNote,
  });
}
