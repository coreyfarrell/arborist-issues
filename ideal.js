// pulled from https://github.com/npm/arborist/blob/626d54743c4435bfd77bf17139a76bd34dd8a0bc/scripts/ideal.js#L1
const Arborist = require('@npmcli/arborist')
const path = process.argv[2] || '.'

const {format} = require('tcompare')
const print = tree => console.log(format(printTree(tree), { style: 'js' }))
const printEdge = require('./arborist-lib/print-edge.js')
const printTree = require('./arborist-lib/print-tree.js')

const options = {path}
const npa = require('npm-package-arg')
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (/^--add=/.test(arg)) {
    options.add = options.add || []
    options.add.push(arg.substr('--add='.length))
  } else if (/^--rm=/.test(arg)) {
    options.rm = options.rm || []
    options.rm.push(arg.substr('--rm='.length))
  } else if (arg === '--prefer-dedupe')
    options.preferDedupe = true
  else if (arg === '--save')
    options.save = true
  else if (arg === '--quiet')
    options.quiet = true
  else if (arg === '--update-all') {
    options.update = options.update || {}
    options.update.all = true
  } else if (/^--update-depth=/.test(arg)) {
    options.update = options.update || {}
    options.update.depth = +(arg.substr('--update-depth='.length))
  } else if (/^--update=/.test(arg)) {
    options.update = options.update || {}
    options.update.names = options.update.names || []
    options.update.names.push(arg.substr('--update='.length))
  }
}

console.error(options)

const start = process.hrtime()
new Arborist(options).buildIdealTree(options).then(tree => {
  const end = process.hrtime(start)
  if (!options.quiet)
    print(tree)
  console.error(`resolved ${tree.inventory.size} deps in ${end[0] + end[1] / 10e9}s`)
  if (tree.meta && options.save)
    tree.meta.save()
}).catch(er => console.error(er))
