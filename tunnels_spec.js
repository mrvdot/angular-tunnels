describe('Tunnels', function () {
  var timeoutMock, spyOne, spyTwo, tunnelMap;

  beforeEach(function () {
    module('mvd.tunnels');
    
    timeoutMock = jasmine.createSpy('timeout');
    
    // Make our timeout fn synchronous for testing
    module(function($provide) {
      $provide.decorator('$timeout',function () {
        return function (fn) {
          fn()
        }
      });
    });

    inject(function(_mvdTunnelMap_) {
      tunnelMap = _mvdTunnelMap_;
    });

    spyOne = jasmine.createSpy('spyOne');
    spyTwo = jasmine.createSpy('spyTwo');
  })

  describe('namespaced callbacks', function () {
    it('should trigger namespaced messages', function () {
      tunnelMap.listen('namespaced', 'myTestEvent', spyOne);
      tunnelMap.listen('namespaced', 'myTestEvent', spyTwo);
      tunnelMap.send('namespaced', 'myTestEvent');
      expect(spyOne).toHaveBeenCalled();
      expect(spyTwo).toHaveBeenCalled();
    });

    it('should pass arguments through to callbacks', function () {
      tunnelMap.listen('namespaced', 'myTestEvent', spyOne);
      tunnelMap.send('namespaced', 'myTestEvent', 'arg1', { arg : "two" });
      // Initial argument is event object
      expect(spyOne).toHaveBeenCalledWith(jasmine.any(Object), 'arg1', { arg : "two" });
    });
  });
});