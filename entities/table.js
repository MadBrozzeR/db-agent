const EMPTY = require('../constants.js').EMPTY;
const Column = require('./column.js');
const Index = require('./index.js');
const Condition = require('./condition.js');
const Model = require('./model.js');
const Statement = require('./statement.js');
const Parameter = require('./parameter.js');
const iterate = require('../utils.js').iterate;

function Table (base, name, columns, props = EMPTY) {
  this.name = name;
  this.columns = {};
  if (props instanceof Table) {
    this.ref = props;
  } else {
    this.base = base;
    this.indexes = [];
    this.temporary = props.temporary;
  }
  for (let col in columns) {
    this.columns[col] = new Column(this, col, columns[col]);
  }
}
Table.prototype.toString = function () {
  let result;
  if (this.ref) {
    result = '`' + this.ref.base.name + '`.`' + this.ref.name + '` AS `' + this.name + '`';
  } else {
    result = '`' + this.base.name + '`.`' + this.name + '`';
  }
  return result;
}
Table.prototype.index = function (columns, props) {
  if (this.ref) {
    return null;
  }
  (columns instanceof Column) && (columns = [columns]);
  this.indexes.push(new Index(this, columns, props));
};
Table.prototype.create = function (props = EMPTY) {
  if (this.ref) {
    return null;
  }
  let sql = 'CREATE';
  let definitions = '';
  this.temporary && (sql += ' TEMPORARY');
  sql += ' TABLE';
  props.ifNotExists && (sql += ' IF NOT EXISTS');
  sql += (' ' + this.toString());

  for (let col in this.columns) {
    definitions += (definitions.length ? ' , ' : '') + this.columns[col].toFullString();
  }
  for (let index in this.indexes) {
    definitions += (definitions.length ? ' , ' : '') + this.indexes[index];
  }
  definitions && (sql += ' (' + definitions + ')');

  return new Statement(sql);
};
Table.prototype.insert = function (insertions, props = EMPTY) {
  const table = this.ref || this;
  if (!(insertions instanceof Array)) {
    insertions = [insertions];
  }

  let sql = 'INSERT';
  let keys = [];
  let questions = '';
  let statementArgs = [];

  for (let key in insertions[0]) {
    if (key in table.columns) {
      keys.push(key);
      questions += (questions.length ? ' , ' : '') + '?';
    }
  }

  if (props.lowPriority) {
    sql += ' LOW_PRIORITY';
  } else if (props.highPriority) {
    sql += ' HIGH_PRIORITY';
  } else if (props.delayed) {
    sql += ' DELAYED';
  }
  props.ignore && (sql += ' IGNORE');
  sql += ' INTO ' + table.toString() +
  ' (`' + keys.join('` , `') + '`) VALUES (' + questions + ')';

  iterate(insertions, function (insertion, index) {
    statementArgs[index] = [];
    for (let key in keys) {
      statementArgs[index].push(
        insertion[keys[key]] === undefined
          ? null
          : new Parameter(insertion[keys[key]], table.columns[keys[key]].type)
      );
    }
  });

  return new Statement(sql, statementArgs);
};
Table.prototype.update = function (definitionList, props = EMPTY) {
  const table = this.ref || this;
  let sql = 'UPDATE';
  let assignments = [];
  let statementArgs = [];
  let keys = [];
  for (let key in definitionList) {
    if (key in table.columns) {
      assignments.push(table.columns[key].eq(definitionList[key]));
      keys.push(key);
    }
  }
  if (assignments.length) {
    assignments = new Condition(assignments, {glue: ' , '});
    props.lowPriority && (sql += ' LOW PRIORITY');
    props.ignore && (sql += ' IGNORE');
    sql += ' ' + table.toString();
    sql += ' SET ' + assignments.sql;
    if (props.where instanceof Condition) {
      (sql += ' WHERE ' + props.where.sql);
    };
    props.orderBy && (sql += ' ORDER BY ' + props.orderBy.join(' , '));
    props.limit && (sql += ' LIMIT ' + props.limit);

    for (let key in keys) {
      statementArgs.push(definitionList[keys[key]] === undefined ? null : definitionList[keys[key]]);
    }
    if (props.where && props.where.params && props.where.params.length) {
      statementArgs.push.apply(statementArgs, props.where.params);
    }

    return new Statement(sql, [statementArgs]);
  }
}
Table.prototype.del = function (props = EMPTY) {
  params = [];

  if (props.where instanceof Condition) {
    const table = this.ref || this;
    let sql = 'DELETE';
    props.lowPriority && (sql += ' LOW PRIORITY');
    props.ignore && (sql += ' IGNORE');
    props.quick && (sql += ' QUICK');
    sql += ' FROM ' + table.toString();
    sql += ' WHERE ' + props.where.sql;
    params.push.apply(params, props.where.params);
    props.orderBy && (sql += ' ORDER BY ' + props.orderBy.join(' , '));
    if (props.limit) {
      if (props.offset) {
        sql += ' LIMIT ? , ?';
        params.push(new Parameter(props.offset), new Parameter(props.limit));
      } else {
        sql += ' LIMIT ?';
        params.push(new Parameter(props.limit));
      }
    }

    return new Statement(sql, [params]);
  }
}
Table.prototype.drop = function (props = EMPTY) {
  if (this.ref) {
    return null;
  }
  let sql = 'DROP';
  this.temporary && (sql += ' TEMPORARY');
  sql += ' TABLE';
  props.ifExists && (sql += ' IF EXISTS');
  sql += ' ' + this.toString();

  return new Statement(sql);
}
Table.prototype.alter = function (specs) {
  let sql = 'ALTER TABLE ' + this.toString();
  sql += ' ' + specs.join(' , ');

  return new Statement(sql);
}
Table.prototype.select = Model.prototype.select;
Table.prototype.as = function (alias) {
  return new Table(this.base, alias, this.columns, this);
}
Table.prototype.join = function (table, on) {
  let model = new Model(this);
  return model.join(table, on);
}
Table.prototype.leftJoin = function (table, on) {
  let model = new Model(this);
  return model.leftJoin(table, on);
}
Table.prototype.leftOuterJoin = function (table, on) {
  let model = new Model(this);
  return model.leftOuterJoin(table, on);
}
Table.prototype.rightJoin = function (table, on) {
  let model = new Model(this);
  return model.rightJoin(table, on);
}
Table.prototype.rightOuterJoin = function (table, on) {
  let model = new Model(this);
  return model.rightOuterJoin(table, on);
}
Table.prototype.straightJoin = function (table, on) {
  let model = new Model(this);
  return model.straightJoin(table, on);
}
/*
Table.prototype.updateStructure = function (props = EMPTY) {
  const table = this.ref || this;
  const sql = 'SELECT * FROM ' + table.toString() + ' WHERE 1=0';
  const listeners = {
    onSuccess: props.onSuccess,
    onError: props.onError
  };
  executeQuery(table.base.agent, sql, {
    onSuccess: function (packet) {
      let changed = false;
      let columns = {};
      let col;
      let specs = [];
      // Iterate through current columns in DB to find deprecated ones.
      for (col in packet.columns) {
        if (table.columns[packet.columns[col].name]) {
          columns[packet.columns[col].name] = true;
        } else {
          columns[columns[col].name] = null;
          changed || (changed = true);
        }
      }
      // Iterate through model columns to find new ones.
      for (col in table.columns) {
        if (!columns[col]) {
          columns[col] = table.columns[col];
          changed || (changed = true);
        }
      }

      if (changed) {
        for (col in columns) {
          if (columns[col] === null) {
            specs.push('DROP COLUMN `' + col + '`');
          } else if (columns[col] instanceof Column) {
            specs.push(columns[col].add());
          }
        }
        table.alter(specs, listeners);
      }
    },
    onError: function (error) {
      if (error.code === 1146) {
        table.create(listeners);
      }
    }
  });
}
*/

module.exports = Table;
