//EGG PARSER

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

// console.log(parse("+(a,10)"));



//SPECIAL FORMS
//Used to define special syntax. It associates words with functions that evaluate such forms
const specialForms = Object.create(null);
specialForms.if = (args, scope) => {
    if (args.length != 3) {
        throw new SyntaxError("Wrong number of args to if");
    
    //Will evaluate the first and if the value isn't false, it will evaluate the second. Otherwise, the third gets evaluated
    //Differs from JS as it will only treat things like zero or the empty string as false, only the precise value false
    } else if (evaluate(args[0], scope) !== false) {
        return evaluate(args[1], scope);
    } else {
        return evaluate(args[2], scope);
    }
}


//EVALUATOR
const evaluate = (expr, scope) => {

    if (expr.type == "value") {
        return expr.value;

    } else if (expr.type == "word") {

        if(expr.name in scope){
            return scope[expr.name];

        } else {
            throw new ReferenceError(`Undefined binding: ${expr.name}`);
        }
    } else if (expr.type == "apply") {
        
        let {operator, args} = expr;

        if (operator.type == "word" && operator.name in specialForms) {

            return specialForms[operator.name](expr.args, scope);

        } else {

            let op = evaluate(operator, scope);

            if (typeof op == "function") {
                return op(...args.map(arg => evaluate(arg, scope)));
            } else {
                throw new TypeError("Applying a non-function.");
            }
        }
    }

}
