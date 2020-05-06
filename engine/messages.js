exports.instantiate = function(gameObject) {
  /* SERVER -> CLIENT
  */
  return {
    target: "object_manager",
    type: "instantiate",
    descriptor: gameObject.to_descriptor()
  };
}

exports.sync = function(gameObject) {
  /* SERVER -> CLIENT
  */
  return {
    target: "object_manager",
    type: "sync",
    descriptor: gameObject.to_descriptor()
  };
}

exports.delete = function(gameObject) {
  /* SERVER -> CLIENT
  */
  return {
    target: "object_manager",
    type: "delete",
    descriptor: gameObject.to_descriptor()
  };
}

exports.call_remote= function(method, parameters) {
  /* SERVER <--> CLIENT
  */
  return {
    target: "object_manager",
    type: "call_remote",
    descriptor: gameObject.to_descriptor()
  };
}
