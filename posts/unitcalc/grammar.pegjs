start
    = exp_add

exp_add
    = left:exp_mul others:exp_add_op { return { left, ...others }; }
    / exp_mul

exp_add_op
    = operator:additive right:exp_add { return { type: "op", operator, right }; }

exp_mul
    = left:exp_value others:exp_mul_op { return { left, ...others }; }
    / exp_value

exp_mul_op
    = operator:multiplicative right:exp_mul { return { type: "op", operator, right }; }

exp_value
    = value:value { return value; }
    / "(" expression:exp_add ")" { return expression; }

multiplicative
    = "*" / "/"

additive
    = "+" / "-" 

value
    = value:number unit:unit { return { type: "value", value, unit }; }
    / value:number { return { type: "value", value, unit: null }; }
    / unit:unit { return { type: "value", value: 1, unit }; }

number
    = [+-]?digit+ ("." [0-9]+)? { return parseFloat(text()); }
    / [+-]?"." [0-9]+ { return parseFloat(text()); }

unit
    = unit:_unit "^" exponent:signed_nonzero_digit { return { type:"unit", unit: unit, exponent }; }
    / unit:_unit { return { type:"unit", unit: unit, exponent: 1 }; }

_unit
    = [a-zA-Z]+ { return text(); }

signed_nonzero_digit
    = [+-]?[1-9][0-9]* { return parseInt(text(), 10); }

digit
    = [1-9][0-9]* { return parseInt(text(), 10); }
    / "0" { return parseInt(text(), 10); }
