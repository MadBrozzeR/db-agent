const CONST = require('../constants.js').CONST;
const EMPTY = require('../constants.js').EMPTY;
const Table = require('./table.js');
const Database = require('./database.js');
const Statement = require('./statement.js');

const PRIVELEGES = {
  all: 'ALL',
  alter: 'ALTER',
  del: 'DELETE',
  select: 'SELECT',
  insert: 'INSERT',
  update: 'UPDATE'
};

function User (name, props = EMPTY) {
  this.name = name;
  this.host = props.host || CONST.LOCALHOST;
  this.password = props.pass || CONST.EMPTY;
  this.plugin = props.plugin;
};
User.prototype.create = function (props = EMPTY) {
  let sql = 'CREATE USER';
  props.ifNotExists && (sql += ' IF NOT EXISTS');
  sql += (' \'' + this.name + '\'@\'' + this.host + '\'');
  if (this.password || this.plugin) {
    sql += ' IDENTIFIED';
    this.plugin && (sql += ' WITH \'' + this.plugin + '\'');
    this.password && (sql += ' BY \'' + this.password + '\'');
  }

  return new Statement(sql);
};
User.prototype.grant = function (entity, props = EMPTY) {
  let sql = 'GRANT';
  let privileges = [];
  let baseName;
  let tableName;

  for (let priv in props) {
    if (props[priv] && PRIVELEGES[priv]) {
      privileges.push(PRIVELEGES[priv]);
    }
  }
  privileges.length && (sql += ' ' + privileges.join(' , '));
  if (entity instanceof Database) {
    baseName = '`' + entity.name + '`';
    tableName = '*';
  } else if (entity instanceof Table) {
    baseName = '`' + entity.base.name + '`';
    tableName = '`' + entity.name + '`';
  }
  sql += (' ON ' + baseName + '.' + tableName);
  sql += (' TO \'' + this.name + '\'@\'' + this.host + '\'');

  return new Statement(sql);
};
User.prototype.connect = function (mysql, props = EMPTY) {
  return mysql.connect({
    user: this.name,
    password: props.password || this.password,
    base: props.database && props.database.name,
    onSuccess: props.onSuccess,
    onError: props.onError,
    onClose: props.onClose
  });
};

module.exports = User;
