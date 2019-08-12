const User = require('./entities/user.js');
const Database = require('./entities/database.js');
const Condition = require('./entities/condition.js');
const Types = require('./entities/types.js');
const Transaction = require('./entities/transaction.js');

module.exports.User = function (name, props) {
  return new User(name, props);
};
module.exports.Database = function (name, props) {
  return new Database(name, props);
};

module.exports.and = function () {
  return new Condition(arguments, {glue: ' AND ', wrapper: '($S)'});
};
module.exports.or = function () {
  return new Condition(arguments, {glue: ' OR ', wrapper: '($S)'});
};
module.exports.xor = function () {
  return new Condition(arguments, {glue: ' XOR ', wrapper: '($S)'});
};
module.exports.count = function (column) {
  return column && 'COUNT(' + column.toString() + ')';
};
module.exports.length = function (column) {
  return column && 'LENGTH(' + column.toString() + ')';
};
module.exports.Types = Types;
module.exports.Transaction = Transaction;
