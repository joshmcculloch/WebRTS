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
    type: "call_remote",
    engine_id: gameObject.engine_id,
    method: "from_descriptor",
    parameters: [gameObject.to_descriptor()]
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

exports.call_remote= function(engine_id, method, parameters) {
  /* SERVER <--> CLIENT
  */
  return {
    target: "object_manager",
    type: "call_remote",
    engine_id: engine_id,
    method: method,
    parameters: parameters
  }
}
