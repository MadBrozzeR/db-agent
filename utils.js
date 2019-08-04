module.exports.spread = function spread () {
  let object;
  for (let arg in arguments) {
    if (object) {
      for (let prop in arguments[arg]) {
        object[prop] = arguments[arg][prop];
      }
    } else {
      object = arguments[arg];
    }
  }
  return object;
}

module.exports.iterate = function iterate (object, callback) {
  for (let key in object) {
    callback(object[key], key);
  }
}

module.exports.logError = function logError (error) {
  console.log(
    'SQL: ' + error.sql +
    (error.params ? ('\nparams: ' + JSON.stringify(error.params)) : '') +
    '\nmessage: ' + error.message
  );
}

module.exports.handleResponce = function handleResponce (props) {
  return props && {
    error: function (error) {
      logError(error);
      props.onError && props.onError(error);
    },
    success: function (packet) {
      props.onSuccess && props.onSuccess(packet);
    }
  }
}

module.exports.executeQuery = function executeQuery (sql, props) {
  const connection = props.connection;
  if (props.sqlOnly) {
    conosle.log(sql);
  } else if (connection) {
    connection.query(sql).on(handleResponce(props));
  } else {
    logError({
      sql: sql,
      message: 'Connection has not established yet'
    });
  }
}
