const EMPTY = require('../constants.js').EMPTY;
const iterate = require('../utils.js').iterate;
const Parameter = require('./parameter.js');
const Types = require('./types.js');

const BLOB_TYPES = {
  [Types.TinyBlob.VALUE]: null,
  [Types.Blob.VALUE]: null,
  [Types.MediumBlob.VALUE]: null,
  [Types.LongBlob.VALUE]: null
};

function Statement (sql, params, oneResult) {
  this.sql = sql;
  this.params = params;
  this.oneResult = oneResult; // TODO Try to get rid of this nonsense
};
Statement.prototype.execute = function (connection, params = EMPTY) {
  if (this.params) {
    const statement = connection.prepare(this.sql, {
      onError: params.onError,
      onSuccess: function (result) {console.log(result)}
    });
    if (this.oneResult) {
      statement.execute(this.params, {
        onSuccess: params.onSuccess,
        onError: params.onError
      });
    } else {
      const count = this.params.length;
      const results = [];

      iterate(this.params, function (paramSet) {
        const statementParams = [];

        iterate(paramSet, function (param, index) {
          if (param instanceof Parameter) {
            if (param.type in BLOB_TYPES) {
              statement.sendLongData(index, param.value, {
                chunkSize: connection.options.maxPacketSize,
                onError: params.onError
              });
            } else {
              statementParams.push(param.value);
            }
          } else {
            statementParams.push(param);
            console.warn('parameter is not an instance of Parameter', param);
          }
        });
        statement.execute(statementParams, {
          onError: params.onError,
          onSuccess: function (packet) {
            results.push(packet);
            (results.length === count) && params.onSuccess && params.onSuccess(results);
          }
        });
      });
    }
  } else {
    connection.query(this.sql, {
      onSuccess: params.onSuccess,
      onError: params.onError
    });
  }
}
module.exports = Statement;
