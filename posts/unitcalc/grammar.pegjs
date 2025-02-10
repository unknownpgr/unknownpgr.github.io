start
    = exp_add

exp_add
    = left:exp_pow others:exp_add_op { return { left, ...others }; }
    / exp_pow

exp_add_op
    = operator:additive right:exp_add { return { type: "op", operator, right }; }

exp_pow
    = left:exp_mul others:exp_pow_op { return { left, ...others }; }
    / exp_mul

exp_pow_op
    = "^" right:exp_pow { return { type: "op", operator: "^", right }; }
    
exp_mul
    = left:exp_value others:exp_mul_op { return { left, ...others }; }
    / exp_value

exp_mul_op
    = operator:multiplicative right:exp_mul { return { type: "op", operator, right }; }
    / right:exp_mul { return { type: "op", operator: "*", right }; }

exp_value
    = value:value { return value; }
    / "(" expression:exp_add ")" { return expression; }

multiplicative
    = "*" / "/"

additive
    = "+" / "-" 

value
    = value:number { return { type: "value", value, unit: null }; }
    / unit:unit { return { type: "value", value: 1, unit }; }

number
    = [+-]?digit+ ("." [0-9]+)? { return parseFloat(text()); }
    / [+-]?"." [0-9]+ { return parseFloat(text()); }
    / [+-]?("PI" / "pi"/ "Pi") { return Math.PI; }
    / [+-]?("E" / "e") { return Math.E; }

unit
    = unit:_unit { return { type:"unit", unit: unit, exponent: 1 }; }

_unit
    = [a-zA-Z]+ { return text(); }

digit
    = [1-9][0-9]* { return parseInt(text(), 10); }
    / "0" { return parseInt(text(), 10); }
