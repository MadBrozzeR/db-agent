const EMPTY = require('../constants.js').EMPTY;
const Parameter = require('./parameter.js');
const and = require('../index.js').and;

function Column (table, name, props = EMPTY) {
  this.table = table;
  this.name = name;
  if (props instanceof Column) {
    this.ref = props;
  } else {
    this.type = props.type;
    this.primary = props.primaryKey;
    this.unique = props.unique;
    this.increment = props.autoIncrement;
    this.props = {
      length: props.length,
      unsigned: props.unsigned,
      notNull: props.notNull,
      default: props.default,
      comment: props.comment,
      zerofill: props.zerofill,
      charset: props.charset,
      collate: props.collate
    };
  }
}

module.exports = Column;

Column.prototype.toFullString = function () {
  const column = this.ref || this;
  let stack = [
    '`' + this.name + '`',
    column.type + (column.props.length ? ('(' + column.props.length + ')') : '')
  ];
  column.props.unsigned && stack.push('UNSIGNED');
  column.props.zerofill && stack.push('ZEROFILL');
  column.props.charset && stack.push('CHARACTER SET ' + column.charset);
  column.props.collate && stack.push('COLLATE ' + column.collate);
  column.props.notNull && stack.push('NOT NULL');
  column.props.default && stack.push('DEFAULT ' + column.props.default);
  column.props.comment && stack.push('COMMENT \'' + column.props.default + '\'');
  if (!this.ref) {
    column.unique && stack.push('UNIQUE');
    column.primary && stack.push('PRIMARY KEY');
    column.increment && stack.push('AUTO_INCREMENT');
  }

  return stack.join(' ');
};
Column.prototype.add = function (after) {
  let sql = 'ADD COLUMN ' + this.toFullString();
  after && (sql += ' AFTER ' + after.toString(true));

  return sql;
}
Column.prototype.change = function (oldName, props) {
  let sql = oldName ? 'CHANGE COLUMN `' + oldName + '` ' : 'MODIFY COLUMN ';
  sql += this.toFullString();

  return sql;
}
Column.prototype.drop = function () {
  return 'DROP COLUMN ' + this.toString(true);
}
Column.prototype.toString = function (short) {
  return (short ? '`' : ('`' + this.table.name + '`.`')) + this.name + '`';
};
Column.prototype.asc = function () {
  return this.toString() + ' ASC';
}
Column.prototype.desc = function () {
  return this.toString() + ' DESC';
}
Column.prototype.max = function () {
  return 'MAX(' + this.toString() + ')';
}
Column.prototype.min = function () {
  return 'MIN(' + this.toString() + ')';
}
