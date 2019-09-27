var {AND,OR,MAYBE,MANY,MORE,JOIN,RECURSE,GROUP,TEXT,FAIL}  = require('../')

//white space
var _ = /^\s*/

//basic primitives
var boolean = TEXT(/^true|false/, Boolean)
var nul = TEXT(/^null/, () => null)

//numbers, fairly complex
var int = /^-?(?:0|[1-9][0-9]*)/
var fraction = /^\.[0-9]+/
var decimal = AND(int, MAYBE(fraction))
var number = TEXT(AND(decimal, MAYBE(AND('e', decimal))), Number)

//strings, including escaped literals
function join (ary) { return ary.join('') }
var escape = AND('\\', TEXT(/^./)), unescaped = TEXT(/^[^"\n]+/)
var string = AND('"', GROUP(MANY(OR(escape, unescaped)), join), OR('"', FAIL('expected "')))

//note, matching unescaped string using "repeated non quote" because
//it makes it much much faster than matching each individual character
//then passing it to join.

function toObject (ary) {
  var o = {}
  for(var i = 0; i < ary.length; i++)
    o[ary[i][0]] = ary[i][1]
  return o
}

var value = {}, array = {}, keyValue = {}, object = {}

//objects and arrays.
value.fn = OR(object, array, string, number, nul, boolean, FAIL('expected json value'))

array.fn = AND('[', _, GROUP(MAYBE(JOIN(AND(_, value, _), ','))),  _, OR(']', FAIL('expected ]')))

//parse each key value pair into a two element array, [key, value]
//then this is passed to toObject in the map for object.
keyValue.fn = GROUP(AND( _, string, _, OR(":", FAIL("expected :")), _, value, _ ))

object.fn = AND('{', _, GROUP(MAYBE(JOIN(keyValue, ',' )), toObject), _, OR('}', FAIL('expected }')))

//accept any valid json type at the top level.

module.exports = value.fn

//these might be useful in other parsers
module.exports.string = string
module.exports.number = number
