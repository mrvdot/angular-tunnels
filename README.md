# Angular Tunnels

Angular tunnels provides a way of creating a communication tunnel between two or more directives/controllers without requiring them to be part of the same DOM tree (like is needed for `$emit` and `$broadcast`);

## Installation
To install tunnels, you can either clone this repository directly, or use bower to install:

```sh
bower install angular-tunnels
```

Then include the `tunnels.js` file into your html and require `mvd.tunnels` in your module:

```javascript
angular.module('myApp', ['mvd.tunnels']);
```

## Usage
Tunnels works by registering events within a map that can be injected directly into controllers and directives. You can also use a directive controller for slightly more convenient usage.

**Directive usage** (Preferred method)

```html
<div id="dir1" my-awesome-directive mvd-tunnel="awesomeness"></div>
<div id="dir2" my-awesome-directive mvd-tunnel="awesomeness"></div>
```

```javascript
angular.module('myApp')
    .directive('myAwesomeDirective', function () {
        var count = 1;
        return {
            require : 'mvdTunnel',//Grab the tunnel controller
            link : function ($scope, $element, $attrs, tunnel) {
                count++;//Count how many instances of this directive we have initialized
                //Within directive, we're automatically namespaced to the tunnel attribute value,
                //or '*' global namespace if none is specified
                tunnel.listen('myMessage', function (message, params) {
                    console.log(message);
                    // output: { "tunnel" : "*", "message" : "myMessage" }
                    console.log(params);
                    // output: { "hello" : "tunnels", "count" : 2 }
                });
                
                if (count > 1) {
                    tunnel.send('myMessage', {
                        "hello" : "tunnels",
                        "count" : count
                    });
                }
            }
        }
    })
```

**Direct Map Usage**

```javascript
angular.module('myApp')
    .controller('MyCtrl', function (mvdTunnelMap) {    
        //'*' is the default global namespace, if using the map directly you must specify this
        mvdTunnelMap.listen('*', 'myMessage', function (message, myThought) {
            console.log(message);
            // output: { "tunnel" : "*", "message" : "myMessage" }
            console.log(myThought);
            // output: "Hello tunnels" (first argument passed to send below)
        });
    })
    .controllter('OtherCtrl', function (mvdTunnelMap) {
        mvdTunnelMap.send('*', 'myMessage', 'Hello tunnels');
    });
```
