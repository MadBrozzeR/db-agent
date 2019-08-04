const EMPTY = require('../constants.js').EMPTY;
const Condition = require('./condition.js');

function Join (table, props = EMPTY) {
  this.table = table;
  this.on = this.setOn(props.on);
  this.left = props.left;
  this.right = props.right;
  this.outer = props.outer;
  this.straight = props.straight;
}
Join.prototype.setOn = function (onMap) {
  let result;
  if (onMap instanceof Condition) {
    result = onMap.sql;
  } else {
    result = '';
    for (let col in onMap) {
      if (this.table.columns[col]) {
        result += (result ? ' AND `' : '`') + this.table.name + '`.`' + col + '`' + ' = ' + onMap[col];
      }
    }
  }

  return result;
}
Join.prototype.toString = function () {
  let sql;
  if (this.straight) {
    sql = 'STRAIGHT_JOIN ';
  } else {
    if (this.left) {
      sql = 'LEFT ';
    } else if (this.right) {
      sql = 'RIGHT ';
    } else {
      sql = '';
    }
    (this.outer && sql) && (sql += 'OUTER ');
    sql += 'JOIN ';
  }

  sql += this.table.toString();
  (this.on) && (sql += ' ON ' + this.on);

  return sql;
}

module.exports = Join;
