const EMPTY = require('../constants.js').EMPTY;
const CONST = require('../constants.js').CONST;
const Column = require('./column.js');
const Parameter = require('./parameter.js');

const REPLACEMENT = /\$S/g;

function Condition (args, params = EMPTY) {
  this.sql = CONST.EMPTY;
  this.params = [];
  const glue = params.glue;
  const wrapper = params.wrapper;

  let currentArg;
  if (typeof args === CONST.STRING) {
    this.sql = args;
  } else {
    for (let arg in args) {
      if (!args[arg]) {
        continue;
      }

      if (args[arg] instanceof Column) {
        currentArg = args[arg].toString();
      } else if (args[arg] instanceof Condition) {
        currentArg = args[arg].sql;
        this.params.push.apply(this.params, args[arg].params);
      } else {
        currentArg = '?';
        this.params.push(args[arg]);
      }
      wrapper && (currentArg = wrapper.replace(REPLACEMENT, currentArg));
      this.sql += (glue && this.sql ? glue : '') + currentArg;
      params.prefix && (this.sql = params.prefix + this.sql);
    }
  }
};

module.exports = Condition;

Column.prototype.eq = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' = '});
};
Column.prototype.lt = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' < '});
};
Column.prototype.lte = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' <= '});
};
Column.prototype.gt = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' > '});
};
Column.prototype.gte = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' >= '});
};
Column.prototype.ne = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' <> '});
};
Column.prototype.like = function (param) {
  return new Condition([this, new Parameter(param, this.type)], {glue: ' LIKE '});
};
Column.prototype.between = function (param1, param2) {
  return new Condition([
    this,
    and(
      new Parameter(param1, this.type),
      new Parameter(param2, this.type)
    )
  ], {glue: ' BETWEEN '});
}
Column.prototype.isNull = function () {
  return new Condition(this.toString() + ' IS NULL');
}
Column.prototype.isNotNull = function () {
  return new Condition(this.toString() + ' IS NOT NULL');
}
