// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see a blank space instead of the map, this
// is probably because you have denied permission for location sharing.


                        //setInterval(function(){alert("Hello")},3000);

$(document).ready(function() {
    

  var map;
  var myLat;
  var myLon;
  var theTime;
  var myUserId; //= "5";
  var otherUserName = "unknown";
  var otherUserId = "6";
  var otherUserLat=0;
  var otherUserLon=0;
  // var otherUserLat = "37.765120";
  // var otherUserLon = "-122.409350";

// LOGIC FOR THE LOGIN BUTTON (login-page)
  $("#btnLogin").on("click", function(){
    var user = $("#username").val();
    var pass = $("#passwrd").val();

    /****Authenticate a User****/
    $.ajax({
       url: "http://54.187.144.176/user/auth",
       type: "POST",
       data: {
         username:user,
         password:pass
       },
       success: function(data) {
         //console.log(data.username + " " + data.password);
          myUserId = data.id;
          alert("myUserId = " + myUserId);
         console.log(data.id);
         if(data != "none"){
          $.mobile.changePage("#map-page");
         }else{
          alert("User not authorized");
         }
       },
       error: function() {
         alert("Something went wrong in the authentication");
       }
    });
  });

// LOGIC FOR THE NEW USER BUTTON (login-page)
  $("#btnNewUser").on("click", function(){
    $.mobile.changePage("#new-user-page");
  });

// LOGIC FOR THE REGISTER BUTTON (new-user-page)
 $("#btnRegister").on("click", function(){
     var user_nup = $("#username-nup").val();
     var pass1_nup = $("#passwrd-nup").val();
     var pass2_nup = $("#re-passwrd-nup").val();
     if(pass1_nup === pass2_nup){
      // CHECK IF THE USERNAME IS ALREADY IN USE
      // We will need to change the API to return all the user names

      // CREATE A NEW USER
       $.ajax({
          url: "http://54.187.144.176/user",
          type: "POST",
          data: {
            username:user_nup,
            password:pass1_nup
          },
          success: function(data) {
            //console.log(data.username + " " + data.password);
            console.log(data);
            alert("You account has been created \n" +
                   "Please login with your new information \n" + 
                   "username = " + user_nup + 
                   "\npassword = " + pass1_nup);
            myUserId = data.id;
            alert("myUserId = " + myUserId);
            $.mobile.changePage("#login-page");
          },
          error: function() {
            alert("Something went wrong");
          }
        });



     }else{
      alert("The password is not matching");
     }
     
       
  });


// LOGIC FOR THE BACK BUTTON (new-user-page)
  $("#btnBack").on("click", function(){
    $.mobile.changePage("#login-page");
  });

// LOGIC TO CHECK THE PASSWORD AND REPASSWORD ARE THE SAME (new-user-page)
  //$()


  function initialize() {
    var mapOptions = {
      zoom: 11
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

   
    // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {

        myLat = position.coords.latitude;
        myLon = position.coords.longitude;
        var pos = new google.maps.LatLng(myLat, myLon);
        map.setCenter(pos);



      }, function() {
        handleNoGeolocation(true);
      }, {enableHighAccuracy: true });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng(36.395903, -6.171651),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }

 // google.maps.event.addDomListener(window, 'load', initialize);

  $(document).on("pageshow", "#map-page", initialize);

// POST BUTTON (map-page)
  $("#post").on("click", function(){
      //postButton();
      alert("lat= "+myLat+"\nlon="+myLon);
      postMyLocation(myLat, myLon, myUserId);
  });
// GET BUTTON (map-page)
  $("#get").on("click", function(){
      //getButton();
      $.ajax({
         url: "http://54.187.144.176/all",
         type: "GET",
         success: function(data) {
             console.log(data.length);
             for(var i = 0; i<data.length; i++){
               console.log("lat: "+data[i].latitude);
               console.log("lon: "+data[i].longitude);
               console.log("time: "+data[i].formatted_time);
               console.log("user_id: "+data[i].user_id);
               console.log("user_name: "+data[i].username);
               getLocation(data[i].user_id);
             }
         },
         error: function() {
               alert("There was an error searching for a location");
         }
      });
      //getLocation(otherUserId);
  });

  function setMarker(user_name, lat, lon, theTime){
        
        var myLatlng = new google.maps.LatLng(lat,lon);
         var marker = new google.maps.Marker({
             position: myLatlng,
             map: map,
            // title: 'Hello World!'
        });

         var infowindow = new google.maps.InfoWindow(
         {
        //   map: map,
        //   position: pos,
           content: user_name + "<br> " + theTime
         }
        );

       google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
       });
       infowindow.open(map, marker);
  }

  function postMyLocation(myLat, myLon, myUserId){
      /***POST request to Create a New Location***/

      $.ajax({
       url: "http://54.187.144.176/location",
       type: "POST",
       data: {
           latitude:myLat,
           longitude:myLon,
           user_id:myUserId   
       },
       success: function(data) {
           //console.log(data.username + " " + data.password);
           // console.log(data);
          //setMarker(myUserId, myLat, myLon);
          getLocation(myUserId);
       },
       error: function() {
           alert("There was an error updating my location");
       }
      });
  }

  function getLocation(userId){

      $.ajax({
          url: "http://54.187.144.176/search/"+userId,
          type: "GET",
          success: function(data) {
               otherUserLat = data.latitude;
               otherUserLon = data.longitude;
               otherUserName = data.username;
               theTime = data.formatted_time;

        // /**** set the marker***/
              setMarker(otherUserName, otherUserLat, otherUserLon, theTime);

          },
          error: function() {
              alert("There was an error getting the other users location");
          }
      });
  }




  // function postButton(){    
  //     /**** POST my location ****/
  //     postMyLocation(myLat, myLon, myUserId);


  // }      


  // function getButton(){
  //   /**** Get othe users location ****/
  //   getLocation(otherUserId);
  // }







});