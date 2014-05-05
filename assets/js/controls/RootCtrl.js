/**
 * The basic version over HTTP.
 * @param {[type]} $scope [description]
 */
// function RootCtrl($scope, $http) {
//   $http.get('/message').then(function onSuccess (res) {
//     $scope.messages = res.data;
//   }, function onerror (res) {
//     $scope.messages.error = res.data;
//   });
// }


/**
 * The realtime version over WebSockets.
 * @param {[type]} $scope [description]
 */
function RootCtrl($scope) {
  SCOPE = $scope;

  // Build anonymous user
  $scope.user = {
    name: 'Anonymous User #'+Math.floor(Math.random()*1000)
  };

  // Get messages, subscribe to them, and watch for more.
  io.socket.get('/message', function whenResponseSent (data, res) {
    if (res.statusCode >= 300) {
      $scope.messages.error = data;
    }
    else {
      $scope.messages = data;
    }
    $scope.$apply(); // (this is just "render" in angularspeak)
  });

  // Listen for incoming comets
  io.socket.on('message', function whenCometSent (ev) {
    //console.log('New comet from Sails =>', ev);

    // Coerce primary key value to integer if possible
    ev.id = (_.isNaN(+ev.id)) ? ev.id : +ev.id;

    // Lookup message
    var $message = _.find($scope.messages, {id: ev.id});

    switch (ev.verb) {
      case 'created': $scope.messages.push(ev.data); break;
      case 'updated': if($message) _.extend($message, ev.data); break;
      case 'destroyed': if($message) _.extend($message, ev.data); break;
      default: break;
    }
    $scope.$apply(); // (this is just "render" in angularspeak)

  });

  // Publish a new message
  $scope.publishMsg = function () {

    io.socket.post('/message', {
      author: $scope.user.name,
      body: $scope.messages.newMsgField
    }, function (data, res) {
      $scope.messages.newMsgField.loading = false;

      if (res.statusCode >= 300) {
        $scope.messages.newMsgField.error = data;
      }
      else {
        $scope.messages.push(data);
      }
      $scope.$apply();
    });

    $scope.messages.newMsgField.loading = true;
    $scope.messages.newMsgField.error = null;
    $scope.messages.newMsgField = '';
  };
}
