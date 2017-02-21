/**
 * Created by zhangyuxi on 2017/2/16.
 */
(function(){
    var userdata=[];
    var messageData=[];
    var xhttp=new XMLHttpRequest();
    var xhttp2=new XMLHttpRequest();
    if(localStorage.getItem("userdata")===null){
        xhttp.onreadystatechange=function(){
            if(xhttp.readyState==4&&xhttp.status==200){
                var userdataString=xhttp.responseText;
                localStorage.setItem("userdata",userdataString);
                userdata=JSON.parse(userdataString);
            }
        };
        xhttp.open("GET","userdata.json",true);
        xhttp.send();
    }else{
        var userdataString=localStorage.getItem("userdata");
        userdata=JSON.parse(userdataString);
    }
    if(localStorage.getItem("messageData")===null){
        xhttp2.onreadystatechange=function(){
            if(xhttp2.readyState==4&&xhttp2.status==200){
                var userdataString2=xhttp2.responseText;
                localStorage.setItem("messageData",userdataString2);
                messageData=JSON.parse(userdataString2);
            }
        };
        xhttp2.open("GET","allMsg.json",true);
        xhttp2.send();
    }else{
        var userdataString2=localStorage.getItem("messageData");
        messageData=JSON.parse(userdataString2);
    }
    mainControl();
    function mainControl(){
        var app=angular.module("loginApp",["ngRoute"]);
        app.config(function($routeProvider){
            $routeProvider.when("/",{
                templateUrl:"../views/login.html",
                controller:"loginController"
            })
                .when("/profile/:id",{
                    templateUrl:"../views/profile.html",
                    controller:"profileController"
                })
                .when("/inbox/:id",{
                    templateUrl:"../views/messageInbox.html",
                    controller:"messageController"
                })
                .when("/sentmail/:id",{
                    templateUrl:"../views/messageSentMail.html",
                    controller:"messageController"
                })
                .when("/compose/:id",{
                    templateUrl:"../views/messageCompose.html",
                    controller:"messageController"
                })
                .otherwise({
                    redirectTo:"/"
                })
        });
        app.factory("userData",function(){
            return{
                userInfo:userdata,
                messageData:messageData
            }
        });
        app.controller("loginController",loginController);
        app.controller("profileController",profileController);
        app.controller("messageController",messageController);

        function loginController($scope,$location,userData) {
            $scope.matchornot=true;
            $scope.loginValication=function(username,password){
                if(username===""||username===undefined||password===""||password===undefined){
                    alert(1);
                }else{
                    var thisUser;
                    var allUserData=userData.userInfo;
                    for(var i=0;i<allUserData.length;i++){
                        if(allUserData[i].username===username&&allUserData[i].password===password){
                            thisUser=allUserData[i];
                        }
                    }
                    if(thisUser===undefined){
                        $scope.matchornot=false;
                    }else{
                        $scope.matchornot=true;
                        $location.url("/profile/"+thisUser.userid);
                    }
                }
            };
        }
        function profileController($scope,userData,$routeParams){
            var userInfo=userData.userInfo;
            var thisUserId=$routeParams.id;
            $scope.userid=thisUserId;
            $scope.userInfo=findUserById(thisUserId,userInfo);
            $scope.copy=angular.copy($scope.userInfo);

            $scope.showEditBtn=false;
            $scope.editInfoSuccess=false;
            $scope.userdataEdit=function(){
                var inputFiled=document.getElementsByClassName("input-field");
                for(var i=0;i<inputFiled.length;i++){
                    inputFiled[i].removeAttribute("disabled");
                }
                $scope.showEditBtn=true;
            };
            $scope.submitEdit=function(username,password,name,email,phone,location){
                var inputFiled=document.getElementsByClassName("input-field");
                for(var i=0;i<inputFiled.length;i++){
                    inputFiled[i].setAttribute("disabled","true");
                }
                var editedThisUserData={
                    "userid":thisUserId,
                    "username":username,
                    "password":password,
                    "name":name,
                    "email":email,
                    "phone":phone,
                    "location":location
                };
                userData.userInfo.splice(thisUserId-1,1,editedThisUserData);
                var userDataObj=userData.userInfo;
                var userDataStr=JSON.stringify(userDataObj);
                localStorage.removeItem("userdata");
                localStorage.setItem("userdata",userDataStr);

                for(var j=0;j<userData.messageData.length;j++){
                    if(userData.messageData[j].senderid===thisUserId){
                        userData.messageData[j].sender=username;
                    }
                    if(userData.messageData[j].recieverid===thisUserId){
                        userData.messageData[j].reciever=username;
                    }
                    userData.messageData.splice(j,1,userData.messageData[j]);
                }
                var messageDataObj=userData.messageData;
                var messageDataStr=JSON.stringify(messageDataObj);
                localStorage.removeItem("messageData");
                localStorage.setItem("messageData",messageDataStr);

                $scope.showEditBtn=false;
                $scope.editInfoSuccess=true;
                $(".editInfoSuccess").removeClass("ng-hide");
            };
            $scope.cancelEdit=function(){
                $scope.userInfo=$scope.copy;
            };
            $(document).on("click","#deletePopup",function(){
                $(".editInfoSuccess").addClass("ng-hide");
            })
        }
        function messageController($scope,userData,$routeParams){
            $scope.showMsgDetail=false;
            var messageData=userData.messageData;
            var thisUserId=$routeParams.id;
            var thisUserMsgs=[];
            var thisUserSent=[];
            $scope.userid=thisUserId;
            for(var i=0;i<messageData.length;i++){
                if(messageData[i].recieverid===thisUserId){
                    thisUserMsgs.push(messageData[i]);
                }
                if(messageData[i].senderid===thisUserId){
                    thisUserSent.push(messageData[i]);
                }
            }
            $scope.thisUserMsgs=thisUserMsgs;
            $scope.thisUserSent=thisUserSent;

            $scope.viewMsg=function (trIndex) {
                $scope.showMsgDetail=true;
                $("#msgPopup").removeClass("ng-hide");
                $scope.msgDetails=thisUserMsgs[trIndex];
            }
            $scope.viewSent=function (trIndex) {
                $scope.showMsgDetail=true;
                $("#msgPopup").removeClass("ng-hide");
                $scope.msgDetails=thisUserSent[trIndex];
            }
            $scope.closeViewMsg=function(){
                $("#msgPopup").addClass("ng-hide");
            }
            $scope.deleteMsg=function(trIndex){
                for(var i=0;i<messageData.length;i++){
                    if(messageData[i].msgid===thisUserMsgs[trIndex].msgid){
                        messageData.splice(i,1);
                    }
                }
                thisUserMsgs.splice(trIndex,1);
                var messageDataStr=JSON.stringify(messageData);
                localStorage.removeItem("messageData");
                localStorage.setItem("messageData",messageDataStr);
            }
            $scope.deleteSent=function(trIndex){
                for(var i=0;i<messageData.length;i++){
                    if(messageData[i].msgid===thisUserSent[trIndex].msgid){
                        messageData.splice(i,1);
                    }
                }
                thisUserSent.splice(trIndex,1);
                var messageDataStr=JSON.stringify(messageData);
                localStorage.removeItem("messageData");
                localStorage.setItem("messageData",messageDataStr);
            };
            $scope.starMsg=function(trIndex){
                var mstStarted=$("#msgStarted"+trIndex);
                if(mstStarted.css("display")==="none"){
                    mstStarted.css("display","inline-block");
                }else if(mstStarted.css("display")==="inline-block"){
                    mstStarted.css("display","none");
                }
            }
            $scope.starSent=function(trIndex){
                var sentStarted=$("#sentStarted"+trIndex);
                if(sentStarted.css("display")==="none"){
                    sentStarted.css("display","inline-block");
                }else if(sentStarted.css("display")==="inline-block"){
                    sentStarted.css("display","none");
                }
            }
        }
        function findUserById(userid,userData){
            for(var i=0;i<userData.length;i++){
                if(userData[i].userid===userid){
                    return userData[i];
                }
            }
        }
    }
})();



