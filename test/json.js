var assert = require('assert')
var json = require('../examples/json')
var getError = require('../').getError
// --------------------

var pass = [
  {okay: [0,-1,-1.1,1e5], emptyObj: {}}//, emptyArr: [], str: 'a"bc'}
]

for(var i = 0; i < pass.length; i++) {
  var str = JSON.stringify(pass[i])
  console.log(
    json(str, 0).groups[0]  
  )
}

console.log(
  'bad e', json('1e1.1',0).groups[0]
)

var fs = require('fs')
var path = require('path')
var pkg = JSON.stringify(require('../package.json'))//fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
var pkg = fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
//console.log(pkg)
var start = Date.now()
var N = 1000, custom, builtin
for(var i = 0; i < N; i++)
  var parsed = json(pkg, 0).groups[0]

console.log('json.parse', custom = (Date.now() - start)/N)

var start = Date.now()
for(var i = 0; i < N; i++)
  var parsed = JSON.parse(pkg)
console.log('JSON.parse', builtin = (Date.now() - start)/N)

console.log('ratio:', custom/builtin)

console.log(
  JSON.stringify(parsed, null, 2)
)

assert.deepEqual(parsed, require('../package.json'))

for(var i = 0; i < 10; i++) {
  //insert 'X"{]' should break any json object...
  var r = ~~(Math.random()*pkg.length)
  var r2 = r + ~~(Math.random()*(pkg.length-r))
  var partial = pkg.substring(0, r) + 'X"{]' + pkg.substring(r2)
  try {
    var v = json(partial, 0)
  } catch (err) {
//    console.log(err)
//    console.log(partial)
//    console.log('------')
    assert.equal(v, null)
  }
}
