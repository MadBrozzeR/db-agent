const EMPTY = require('../constants.js').EMPTY;
const CONST = require('../constants.js').CONST;
const Column = require('./column.js');

const REPLACEMENT = /\$S/g;

module.exports = function Condition (args, params = EMPTY) {
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
