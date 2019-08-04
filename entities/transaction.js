const EMPTY = require('../constants.js').EMPTY;

const Statement = require('./statement.js');

function Transaction (connection, params = EMPTY) {
  this.connection = connection;
  this.params = params;
}
Transaction.begin = function () {
  return new Statement('BEGIN');
};
Transaction.commit = function () {
  return new Statement('COMMIT');
};
Transaction.rollback = function () {
  return new Statement('ROLLBACK');
};

Transaction.prototype.begin = function () {
  Transaction.begin().execute(this.connection, {
    onSuccess: this.params.onBegin,
    onError: this.params.onError
  });

  return this;
};
Transaction.prototype.commit = function () {
  Transaction.commit().execute(this.connection, {
    onSuccess: this.params.onSuccess,
    onError: this.params.onError
  });

  return this;
};
Transaction.prototype.rollback = function (reason) {
  const params = this.params;

  Transaction.rollback().execute(this.connection, {
    onSuccess: function () {
      params.onRollback && params.onRollback(reason);
    },
    onError: params.onError
  });

  return this;
}

module.exports = Transaction;
