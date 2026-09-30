# NULL-001 // Maya Long Count

A minimal, interactive web clock that renders the current date as a
[Maya Long Count](https://en.wikipedia.org/wiki/Maya_calendar#Long_Count)
calendar. The readout updates live and breaks each component of the date down
into the days it contributes, so you can inspect how the number is built.

## How it works

The Long Count is a continuous count of days elapsed since the Maya calendar
epoch (11 August 3114 BCE in the proleptic Gregorian calendar). The app converts
the current date into that count and then decomposes it into the five Long Count
units.

### 1. Gregorian date → Julian Day Number

The current date is first converted into a [Julian Day Number (JDN)](https://en.wikipedia.org/wiki/Julian_day) —
a single integer counting days since 1 January 4713 BCE:

```
JDN = day + ⌊(153m + 2)/5⌋ + 365y + ⌊y/4⌋ − ⌊y/100⌋ + ⌊y/400⌋ − 32045
```

### 2. Days since the Maya epoch

The Long Count epoch corresponds to `JDN 584283`. Subtracting it from the
current JDN gives the total number of days elapsed since the start of the count:

```
days = JDN − 584283
```

### 3. Decomposing into the five units

That total is then split, largest unit first, using successive integer division:

| Step | Result | Remainder |
| --- | --- | --- |
| `b'ak'tun = days ÷ 144000` | days / 144000 | `days % 144000` |
| `k'atun = rem ÷ 7200` | rem / 7200 | `rem % 7200` |
| `tun = rem ÷ 360` | rem / 360 | `rem % 360` |
| `winal = rem ÷ 20` | rem / 20 | `rem % 20` |
| `k'in = rem` | — | — |

The five values are written dot-separated in the traditional notation,
e.g. `13.0.0.0.0`.

## The digits

Each position of the Long Count is read left to right, from the largest unit to
the smallest:

| Unit | Days | Composed of | Roughly |
| --- | ---: | --- | --- |
| **B'ak'tun** | 144,000 | 20 k'atuns | ~394 solar years |
| **K'atun** | 7,200 | 20 tuns | ~19.7 years |
| **Tun** | 360 | 18 winals | ~1 year |
| **Winal** | 20 | 20 k'ins | 20 days |
| **K'in** | 1 | — | 1 day |

So `13.0.0.0.0` means `13 × 144,000 + 0 × 7,200 + 0 × 360 + 0 × 20 + 0 × 1`
= 1,872,000 days since the epoch.

## Interaction

- **Hover / focus a digit** — the app highlights it and shows the unit name and
  the number of days it contributes.
- **Click a digit** — reveals the multiplication behind it
  (e.g. `9 × 144000 = 1296000 DAYS`).
- **Click `TOTAL DAYS`** — cycles through the total day count, the equivalent in
  solar years, and the full decomposition expression.

## Tech

Plain HTML, CSS, and JavaScript. No dependencies, no build step — just open
`index.html` in a browser.

## License

All rights reserved.
