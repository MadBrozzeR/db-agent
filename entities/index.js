const EMPTY = require('../constants.js').EMPTY;

function Index (table, columns, props = EMPTY) {
  this.table = table;
  this.columns = columns;
  if (props.unique) {
    this.unique = true;
    this.name = props.name;
    this.type = props.type;
    this.constraint = props.constraint;
  } else if (props.primaryKey) {
    this.primary = true;
    this.constraint = props.constraint;
    this.type = props.type;
  } else if (props.foreignKey) {
    // TODO Understand and add `reference_definition`
    this.foreign = true;
    this.constraint = props.constraint;
  } else if (props.fulltext) {
    this.fulltext = true;
    this.name = props.name;
  } else if (props.spatial) {
    this.spatial = true;
    this.name = props.name;
  } else {
    this.name = props.name;
    this.type = props.type;
  }
}
Index.prototype.toString = function () {
  let stack = [];
  let columns = '';
  if (this.constraint !== undefined) {
    stack.push('CONSTRAINT');
    this.constraint && stack.push(this.constraint);
  };
  if (this.primary) stack.push('PRIMARY KEY');
  else if (this.unique) stack.push('UNIQUE INDEX');
  else if (this.foreign) stack.push('FOREIGN KEY');
  else if (this.spatial) stack.push('SPATIAL INDEX');
  else if (this.fulltext) stack.push('FULLTEXT INDEX');
  else stack.push('INDEX');
  this.name && stack.push(this.name);
  this.type && stack.push('USING ' + this.type);
  for (let col in this.columns) {
    columns += ((columns.length ? ' , ' : '') + ('`' + this.columns[col].name + '`'));
  }
  columns && stack.push('(' + columns + ')');

  return stack.join(' ');
}

module.exports = Index;
