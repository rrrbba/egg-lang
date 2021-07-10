

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

const parseApply = (expr, program) => {
    program = skipSpace(program);

    //if next character in program not an (, it's not an application
    if (program[0] != "(") {
        return {expr: expr, rest: program};
    }
    //Creating syntax tree 
    program = skipSpace(program.slice(1));
    expr = {type: "apply", operator: expr, args: []};

    while(program[0] != ")") {
        let arg = parseExpression(program);

        expr.args.push(arg.expr);
        
        program = skipSpace(arg.rest);

        if(program[0] == ",") {
            program = skipSpace(program.slice(1));
        } else if (program[0] != ")"){
            throw new SyntaxError("Expected ',' or ')'");
        }
    }

    return parseApply(expr, program.slice(1));

}

//Function to verify it has reached the end of the input string after parsing the expression
const parse = (program) => {
    let {expr, rest} = parseExpression(program);

    if (skipSpace(rest).length > 0) {
        throw new SyntaxError("Unexpected text after program");
    }
    return expr;
}

console.log(parse("+(a,10)"));