---
title: Unit Calculator
tags:
  - utility
date: 2025-02-08T22:47:23.313Z
---

> Translated with the help of ChatGPT and Google Translator

Recently, I had to convert units very frequently, so I created a simple unit converter. After making it, I found it quite convenient in many ways, so I decided to share it in this post.

<iframe src="./calc.html" width="100%" height="300px"></iframe>

You can use it in full-screen mode via the link below.

- [Unit Calculator](./calc.html)

## Design

Since it was necessary to parse expressions with units, I created a simple parser. I used `Peggy.js`, and the syntax is as follows.

```pegjs
start
    = exp_add

exp_add
    = left:exp_mul others:exp_add_op
    / exp_mul

exp_add_op
    = operator:additive right:exp_add

exp_mul
    = left:exp_value others:exp_mul_op
    / exp_value

exp_mul_op
    = operator:multiplicative right:exp_mul

exp_value
    = value:value
    / "(" expression:exp_add ")"

multiplicative
    = "*" / "/"

additive
    = "+" / "-"

value
    = value:number unit:unit
    / value:number
    / unit:unit

number
    = [+-]?digit+ ("." [0-9]+)?
    / [+-]?"." [0-9]+

unit
    = unit:_unit "^" exponent:signed_nonzero_digit
    / unit:_unit

_unit
    = [a-zA-Z]+

signed_nonzero_digit
    = [+-]?[1-9][0-9]*

digit
    = [1-9][0-9]*
    / "0"
```

Additionally, to perform unit conversions, I configured the system to convert all units into MLT dimensions based on SI units. Below is the JavaScript list for the conversion.

```javascript
const unitList = [
  // Length
  { name: "pm", description: "picometer", L: 1, scale: 1e-12 },
  { name: "nm", description: "nanometer", L: 1, scale: 1e-9 },
  { name: "um", description: "micrometer", L: 1, scale: 1e-6 },
  { name: "mm", description: "millimeter", L: 1, scale: 1e-3 },
  { name: "cm", description: "centimeter", L: 1, scale: 1e-2 },
  { name: "dm", description: "decimeter", L: 1, scale: 1e-1 },
  { name: "m", description: "meter", L: 1, scale: 1 },
  { name: "km", description: "kilometer", L: 1, scale: 1e3 },

  // Mass
  { name: "pg", description: "picogram", M: 1, scale: 1e-15 },
  { name: "ng", description: "nanogram", M: 1, scale: 1e-12 },
  { name: "ug", description: "microgram", M: 1, scale: 1e-9 },
  { name: "mg", description: "milligram", M: 1, scale: 1e-6 },
  { name: "g", description: "gram", M: 1, scale: 1e-3 },
  { name: "kg", description: "kilogram", M: 1, scale: 1 },

  // Time
  { name: "ps", description: "picosecond", T: 1, scale: 1e-12 },
  { name: "ns", description: "nanosecond", T: 1, scale: 1e-9 },
  { name: "us", description: "microsecond", T: 1, scale: 1e-6 },
  { name: "ms", description: "millisecond", T: 1, scale: 1e-3 },
  { name: "s", description: "second", T: 1, scale: 1 },
  { name: "min", description: "minute", T: 1, scale: 60 },
  { name: "h", description: "hour", T: 1, scale: 3600 },
  { name: "d", description: "day", T: 1, scale: 86400 },
  { name: "yr", description: "year", T: 1, scale: 31556952 },

  // Velocity
  { name: "m/s", description: "meter per second", L: 1, T: -1 },
  {
    name: "km/h",
    description: "kilometer per hour",
    L: 1,
    T: -1,
    scale: 1 / 3.6,
  },

  // Volume
  { name: "uL", description: "microliter", L: 3, scale: 1e-9 },
  { name: "mL", description: "milliliter", L: 3, scale: 1e-6 },
  { name: "cL", description: "centiliter", L: 3, scale: 1e-5 },
  { name: "dL", description: "deciliter", L: 3, scale: 1e-4 },
  { name: "L", description: "liter", L: 3, scale: 1e-3 },

  // Current
  { name: "pA", description: "picoampere", I: 1, scale: 1e-12 },
  { name: "uA", description: "microampere", I: 1, scale: 1e-6 },
  { name: "mA", description: "milliampere", I: 1, scale: 1e-3 },
  { name: "A", description: "ampere", I: 1, scale: 1 },

  // Voltage
  {
    name: "nV",
    description: "nanovolt",
    L: 2,
    T: -3,
    I: -1,
    scale: 1e-9,
  },
  {
    name: "uV",
    description: "microvolt",
    L: 2,
    T: -3,
    I: -1,
    scale: 1e-6,
  },
  {
    name: "mV",
    description: "millivolt",
    L: 2,
    T: -3,
    I: -1,
    scale: 1e-3,
  },
  { name: "V", description: "volt", L: 2, T: -3, I: -1, scale: 1 },
  { name: "kV", description: "kilovolt", L: 2, T: -3, I: -1, scale: 1e3 },

  // Resistance
  {
    name: "mOhm",
    description: "milliohm",
    M: 1,
    L: 2,
    T: -3,
    I: -2,
    scale: 1e-3,
  },
  {
    name: "Ohm",
    description: "ohm",
    M: 1,
    L: 2,
    T: -3,
    I: -2,
    scale: 1,
  },
  {
    name: "kOhm",
    description: "kiloohm",
    M: 1,
    L: 2,
    T: -3,
    I: -2,
    scale: 1e3,
  },
  {
    name: "MOhm",
    description: "megaohm",
    M: 1,
    L: 2,
    T: -3,
    I: -2,
    scale: 1e6,
  },
  {
    name: "GOhm",
    description: "gigaohm",
    M: 1,
    L: 2,
    T: -3,
    I: -2,
    scale: 1e9,
  },

  // Capacitance
  {
    name: "fF",
    description: "femtofarad",
    M: -1,
    L: -2,
    T: 4,
    I: 2,
    scale: 1e-15,
  },
  {
    name: "pF",
    description: "picofarad",
    M: -1,
    L: -2,
    T: 4,
    I: 2,
    scale: 1e-12,
  },
  {
    name: "nF",
    description: "nanofarad",
    M: -1,
    L: -2,
    T: 4,
    I: 2,
    scale: 1e-9,
  },
  {
    name: "uF",
    description: "microfarad",
    M: -1,
    L: -2,
    T: 4,
    I: 2,
    scale: 1e-6,
  },
  {
    name: "mF",
    description: "millifarad",
    M: -1,
    L: -2,
    T: 4,
    I: 2,
    scale: 1e-3,
  },
  {
    name: "F",
    description: "farad",
    M: -1,
    L: -2,
    T: 4,
    I: 2,
    scale: 1,
  },

  // Inductance
  {
    name: "nH",
    description: "nanohenry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1e-9,
  },
  {
    name: "uH",
    description: "microhenry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1e-6,
  },
  {
    name: "mH",
    description: "millihenry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1e-3,
  },
  {
    name: "H",
    description: "henry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1,
  },
  {
    name: "kH",
    description: "kilohenry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1e3,
  },
  {
    name: "MH",
    description: "megahenry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1e6,
  },
  {
    name: "GH",
    description: "gigahenry",
    M: 1,
    L: 2,
    T: -2,
    I: -2,
    scale: 1e9,
  },

  // Frequency
  { name: "Hz", description: "hertz", T: -1, scale: 1 },
  { name: "kHz", description: "kilohertz", T: -1, scale: 1e3 },
  { name: "MHz", description: "megahertz", T: -1, scale: 1e6 },
  { name: "GHz", description: "gigahertz", T: -1, scale: 1e9 },

  // Energy
  {
    name: "eV",
    description: "electronvolt",
    M: 1,
    L: 2,
    T: -2,
    scale: 1.602176634e-19,
  },
  { name: "J", description: "joule", M: 1, L: 2, T: -2, scale: 1 },
  { name: "kJ", description: "kilojoule", M: 1, L: 2, T: -2, scale: 1e3 },
  { name: "MJ", description: "megajoule", M: 1, L: 2, T: -2, scale: 1e6 },
  { name: "GJ", description: "gigajoule", M: 1, L: 2, T: -2, scale: 1e9 },

  // Power
  { name: "W", description: "watt", M: 1, L: 2, T: -3, scale: 1 },
  { name: "kW", description: "kilowatt", M: 1, L: 2, T: -3, scale: 1e3 },
  { name: "MW", description: "megawatt", M: 1, L: 2, T: -3, scale: 1e6 },
  { name: "GW", description: "gigawatt", M: 1, L: 2, T: -3, scale: 1e9 },

  // Pressure
  { name: "Pa", description: "pascal", M: 1, L: -1, T: -2, scale: 1 },
  {
    name: "kPa",
    description: "kilopascal",
    M: 1,
    L: -1,
    T: -2,
    scale: 1e3,
  },
  {
    name: "MPa",
    description: "megapascal",
    M: 1,
    L: -1,
    T: -2,
    scale: 1e6,
  },
  {
    name: "GPa",
    description: "gigapascal",
    M: 1,
    L: -1,
    T: -2,
    scale: 1e9,
  },
  {
    name: "atm",
    description: "atmosphere",
    M: 1,
    L: -1,
    T: -2,
    scale: 101325,
  },
  { name: "bar", description: "bar", M: 1, L: -1, T: -2, scale: 1e5 },
  {
    name: "mmHg",
    description: "millimeter of mercury",
    M: 1,
    L: -1,
    T: -2,
    scale: 133.322,
  },
  {
    name: "psi",
    description: "pounds per square inch",
    M: 1,
    L: -1,
    T: -2,
    scale: 6894.76,
  },
  {
    name: "torr",
    description: "torr",
    M: 1,
    L: -1,
    T: -2,
    scale: 133.322,
  },

  // Force
  { name: "N", description: "newton", M: 1, L: 1, T: -2 },
  {
    name: "kN",
    description: "kilonewton",
    M: 1,
    L: 1,
    T: -2,
    scale: 1e3,
  },
  {
    name: "MN",
    description: "meganewton",
    M: 1,
    L: 1,
    T: -2,
    scale: 1e6,
  },
  {
    name: "GN",
    description: "giganewton",
    M: 1,
    L: 1,
    T: -2,
    scale: 1e9,
  },
];
```

And I simply used DFS to traverse the AST in order and set it up to either return errors or appropriately display the results.
