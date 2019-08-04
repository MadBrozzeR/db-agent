const EMPTY = require('../constants.js').EMPTY;
const Table = require('./table.js');
const Statement = require('./statement.js');

function Database (name, props = EMPTY) {
  this.name = name;
  this.charset = props.charset;
  this.collate = props.collate;
}
Database.prototype.create = function (props = EMPTY) {
  let sql = 'CREATE DATABASE';
  props.ifNotExists && (sql += ' IF NOT EXISTS');
  sql += (' `' + this.name + '`');
  this.charset && (sql += ' CHARACTER SET ' + this.charset);
  this.collate && (sql += ' COLLATE ' + this.collate);

  return new Statement(sql);
};
Database.prototype.drop = function (props = EMPTY) {
  let sql = 'DROP DATABASE';
  props.ifExists && (sql += ' IF EXISTS');
  sql += ' `' + this.name + '`';

  return new Statement(sql);
};
Database.prototype.use = function () {
  const sql = 'USE ' + this.name;

  return new Statement(sql);
};
Database.prototype.Table = function (name, columns) {
  return new Table(this, name, columns);
};

module.exports = Database;
