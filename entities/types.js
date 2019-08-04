const spread = require('../utils.js').spread;

function Varchar (length, props) {
  return spread({
    type: Varchar.VALUE,
    length: length
  }, props);
};
Varchar.VALUE = 'VARCHAR';

function Int (props) {
  return spread({
    type: Int.VALUE
  }, props);
};
Int.VALUE = 'INT';

function SmallInt (props) {
  return spread({
    type: SmallInt.VALUE
  }, props);
};
SmallInt.VALUE = 'SMALLINT';

function Blob (props) {
  return spread({
    type: Blob.VALUE
  }, props);
};
Blob.VALUE = 'BLOB';

function TinyBlob (props) {
  return spread({
    type: TinyBlob.VALUE
  }, props);
};
TinyBlob.VALUE = 'TINYBLOB';

function MediumBlob (props) {
  return spread({
    type: MediumBlob.VALUE
  }, props);
};
MediumBlob.VALUE = 'MEDIUMBLOB';

function LongBlob (props) {
  return spread({
    type: LongBlob.VALUE
  }, props);
};
LongBlob.VALUE = 'LONGBLOB';

function Datetime (props) {
  return spread({
    type: Datetime.VALUE
  }, props);
};
Datetime.VALUE = 'DATETIME';

function TinyInt (props) {
  return spread({
    type: TinyInt.VALUE
  }, props);
};
TinyInt.VALUE = 'TINYINT';

function MediumInt (props) {
  return spread({
    type: MediumInt.VALUE
  }, props);
};
MediumInt.VALUE = 'MEDIUMINT';

function BigInt (props) {
  return spread({
    type: BigInt.VALUE
  }, props);
};
BigInt.VALUE = 'BIGINT';

function Float (length, decimals, props) {
  return spread({
    type: Float.VALUE,
    length: length + ((decimals !== undefined) ? (' , ' + decimals) : '')
  }, props);
};
Float.VALUE = 'FLOAT';

module.exports = {
  Varchar: Varchar,
  BigInt: BigInt,
  Int: Int,
  MediumInt: MediumInt,
  SmallInt: SmallInt,
  TinyInt: TinyInt,
  Float: Float,
  TinyBlob: TinyBlob,
  Blob: Blob,
  MediumBlob: MediumBlob,
  LongBlob: LongBlob,
  Datetime: Datetime
};
