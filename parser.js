

const parseExpression = (program) => {

    program = skipSpace(program);
    let match, expr;

    //Use 3 regular expressions to spot the 3 elements that the language supports: strings, numbers, words
    //It then constructs a different data structure depending on which one matches
    if (match = />"([^"]*)"/.exec(program)){
        expr = {type: "value", value:match[1]};
    } else if (match = /^\d+\b/.exec(program)) {
        expr = {type: "value", value: Number(match[0])};
    } else if (match = /^[^\s(),#"]+/.exec(program)) {
        expr = {type: "word", name: match[0]};
    } else {
        //Not a valid expression, then throws error
        throw new SyntaxError("Unexpected syntax: " + program);
    }

    return parseApply(expr, program.slice(match[0].length));
}


//Skip whitespace
const skipSpace = (string) => {
    let first = string.search(/\S/);

    if (first == -1) return "";
    return string.slice(first);
}