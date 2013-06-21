(function(angular) {
	var slice = [].slice;//for convenience
	angular.module('mvd.tunnels', [])
		.factory('mvdTunnelMap', function () {
			var map = {};

			var mergeMessageMaps = function (tunnel, callbacks) {
				var tMap;
				if (!(tMap = map[tunnel])) {
					tMap = map[tunnel] = {};
				};
				for (var m in callbacks) {
					if (!callbacks.hasOwnProperty(m)) {
						continue;
					};
					var cbs = callbacks[m];
					if (!tMap[m]) {
						//First callback we're registering for this message within this namespace
						//Just pass in the callbacks (ensuring they're in an array)
						tMap[m] = angular.isArray(cbs) ? cbs : [cbs];
					} else {
						//Already have some callbacks registered for this message, need to merge them
						if (!angular.isArray(cbs)) {
							tMap[m].push(cbs);
						} else {
							for (var i = 0, ii = cbs.length; i < ii; i++) {
								tMap[m].push(cbs[i]);
							}
						}
					}
				}
			}

			var methods = {
				listen : function (tunnel, message, cb) {
					if (angular.isObject(message)) {
						return mergeMessageMaps(tunnel, message);
					} else {
						if (!map[tunnel]) {
							map[tunnel] = {};
						};
						if (!map[tunnel][message]) {
							map[tunnel][message] = [];
						};
						map[tunnel][message].push(cb);
					}
				},
				send : function (tunnel, message /*, args...*/) {
					var cbs = (map[tunnel] && map[tunnel][message]) || false;
					if (!cbs) {
						//Nothing registered for that namespace and message
						return;
					};
					var e = {
						tunnel : tunnel,
						message : message
					};

					//Prep method arguments, based upon $scope.$emit method
					var args = [e].concat(slice.call(arguments, 2));

					for (var i = 0, ii = cbs.length; i < ii; i++) {
						cbs[i].apply(null, args);
					}
				}
			}

			return methods;
		})
		.directive('mvdTunnel', function (mvdTunnelMap) {
			return {
				controller : function ($scope, $element, $attrs) {
					//Default to global namespace if none specified
					var namespace = $attrs.mvdTunnel || '*';

					var ctrl = this;

					//Set a new namespace
					//Recommended you do this before adding any methods
					//if not specifying via attribute, as old methods won't be converted
					ctrl.setNamespace = function (ns) {
						namespace = ns;
					};

					//Register callback(s) to message(s)
					//@param message - Event/Message name to register to, or object hash of messages to callbacks
					//@param callback - Callback if only registering for a single message
					ctrl.listen = function (message, cb) {
						mvdTunnelMap.listen(namespace, message, cb);
					}

					//Alias for ctrl.listen
					ctrl.on = function (message, cb) {
						ctrl.listen(message, cb);
					}

					//Send a message
					ctrl.send = function (message /*, args... */) {
						var args = [namespace].concat(slice.call(arguments,0));
						mvdTunnelMap.send.apply(null, args);
					}
				}
			}
		});
})(angular)