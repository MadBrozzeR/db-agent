const EMPTY = require('../constants.js').EMPTY;
const CONST = require('../constants.js').CONST;
const Condition = require('./condition.js');
const Join = require('./join.js');
const Statement = require('./statement.js');
const Parameter = require('./parameter.js');

function Model (table) {
  this.table = table;
  this.joins = [];
};
Model.prototype.toString = function () {
  let sql = this.table.toString();
  for (let index in this.joins) {
    sql += ' ' + this.joins[index].toString();
  }
  return sql;
};
Model.prototype.select = function (selector, props = EMPTY) {
  let base = this.base || this.table.base;
  let sql = 'SELECT ';
  let selects = '';
  let params = [];
  for (let key in selector) {
    selects += (selects ? ' , ' : '') + selector[key].toString() + ' AS `' + key + '`';
  }
  sql += selects;
  sql += ' FROM ' + this.toString();
  if (props.where instanceof Condition) {
    sql += ' WHERE ' + props.where.sql;
    props.where.params && props.where.params.length && (params.push.apply(params, props.where.params));
  }
  if (props.groupBy) {
    sql += ' GROUP BY ' + (
      props.groupBy instanceof Array ?
        props.groupBy.join(' , ') :
        props.groupBy
    );
  }
  if (props.orderBy) {
    sql += ' ORDER BY ' + (
      props.orderBy instanceof Array ?
        props.orderBy.join(' , ') :
        props.orderBy
    );
  }
  if (typeof props.limit === CONST.NUMBER) {
    sql += ' LIMIT ';
    if (typeof props.offset === CONST.NUMBER) {
      sql += '? , ?';
      params.push(new Parameter(props.offset), new Parameter(props.limit));
    } else {
      sql += '?';
      params.push(new Parameter(props.limit));
    }
  }

  return new Statement(sql, params, true);
}
Model.prototype.join = function (table, on) {
  const newJoin = new Join(table, {on: on});
  this.joins.push(newJoin);

  return this;
};
Model.prototype.leftJoin = function (table, on) {
  const newJoin = new Join(table, {on: on, left: true});
  this.joins.push(newJoin);

  return this;
}
Model.prototype.leftOuterJoin = function (table, on) {
  const newJoin = new Join(table, {on: on, left: true, outer: true});
  this.joins.push(newJoin);

  return this;
}
Model.prototype.rightJoin = function (table, on) {
  const newJoin = new Join(table, {on: on, right: true});
  this.joins.push(newJoin);

  return this;
}
Model.prototype.rightOuterJoin = function (table, on) {
  const newJoin = new Join(table, {on: on, right: true, outer: true});
  this.joins.push(newJoin);

  return this;
}
Model.prototype.straightJoin = function (table, on) {
  const newJoin = new Join(table, {on: on, straight: true});
  this.joins.push(newJoin);

  return this;
}

module.exports = Model;
