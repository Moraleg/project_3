angular.module('MyApp').controller('loginFormCtrl', ['$http', '$scope', function($http,$scope){
  var ctrl = this;
  this.username = '';
  this.password = '';
  this.showMsg = false;
  this.msgContent= '';

  this.submitLogin = function(){
    this.showMsg = false;
    this.msgContent= '';

    $http({
      method: 'POST',
      url: '/sessions',
      data: {
        username: this.username,
        password: this.password
      }
    }).then(function(response){
      console.log(response);
      if (response.data.success === true) {
        $scope.viewCtrl.getSession();
        $('#login-modal').hide();
        console.log('Hooray! You\'re logged in!');
      } else if (response.data.success === false) {
        ctrl.msgContent = 'Sorry the password or username you entered did not match our records.';
        ctrl.showMsg = true;
      }
      ctrl.username = '';
      ctrl.password = '';
    }, function(error) {
      console.log(error);
      ctrl.msgContent = 'Sorry, something went wrong. Please try again.';
      ctrl.showMsg = true;
      this.username = '';
      this.password = '';
    });
  };//End submitLogin()

  //Event listener to close modal
  $('.close').on('click', function() {
    $('#login-modal').css('display', 'none');
  });
}]); //End Controller
