/**
 * Created by zhangyuxi on 2017/2/16.
 */
(function(){
    var userdata=[];
    // var messageData=[];
    var xhttp=new XMLHttpRequest();
    // var xhttp2=new XMLHttpRequest();
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
    // if(localStorage.getItem("messageData")===null){
    //     xhttp2.onreadystatechange=function(){
    //         if(xhttp2.readyState==4&&xhttp2.status==200){
    //             var userdataString2=xhttp2.responseText;
    //             localStorage.setItem("messageData",userdataString2);
    //             messageData=JSON.parse(userdataString2);
    //         }
    //     };
    //     xhttp2.open("GET","allMsg.json",true);
    //     xhttp2.send();
    // }else{
    //     var userdataString2=localStorage.getItem("messageData");
    //     messageData=JSON.parse(userdataString2);
    // }
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
                userInfo:userdata
                // messageData:messageData
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
                // var userInbox=userData.userInfo[thisUserId-1].inbox;
                // var userSentmail=userData.userInfo[thisUserId-1].sentmail;
                // for(var i1=0;i1<userInbox.length;i1++){
                //     userInbox[i1].reciever=username;
                //
                // }
                // for(var i2=0;i2<userSentmail.length;i2++){
                //     userSentmail[i2].sender=username;
                // }
                for(var j=0;j<userData.userInfo.length;j++){
                    for(var j1=0;j1<userData.userInfo[j].inbox.length;j1++){
                        if(userData.userInfo[j].inbox[j1].senderid===thisUserId){
                            console.log(userData.userInfo[j].inbox[j1].sender);
                            userData.userInfo[j].inbox[j1].sender=username;
                        }
                        if(userData.userInfo[j].inbox[j1].recieverid===thisUserId){
                            userData.userInfo[j].inbox[j1].reciever=username;
                            console.log(userData.userInfo[j].inbox[j1].reciever);
                        }

                        // console.log(userData.userInfo[j].inbox[j1]);
                    }
                    for(var j2=0;j2<userData.userInfo[j].sentmail.length;j2++){
                        if(userData.userInfo[j].sentmail[j2].senderid===thisUserId){
                            userData.userInfo[j].sentmail[j2].sender=username;
                            console.log(userData.userInfo[j].sentmail[j2].sender);
                        }
                        if(userData.userInfo[j].sentmail[j2].recieverid===thisUserId){
                            userData.userInfo[j].sentmail[j2].reciever=username;
                            console.log(userData.userInfo[j].sentmail[j2].reciever);
                        }
                    }
                }
                editedThisUserData.inbox=userData.userInfo[thisUserId-1].inbox;
                editedThisUserData.sentmail=userData.userInfo[thisUserId-1].sentmail;
                userData.userInfo.splice(thisUserId-1,1,editedThisUserData);

                var userDataObj=userData.userInfo;
                var userDataStr=JSON.stringify(userDataObj);
                // console.log(userDataObj);
                localStorage.removeItem("userdata");
                localStorage.setItem("userdata",userDataStr);

                // for(var j=0;j<userData.messageData.length;j++){
                //     if(userData.messageData[j].senderid===thisUserId){
                //         userData.messageData[j].sender=username;
                //     }
                //     if(userData.messageData[j].recieverid===thisUserId){
                //         userData.messageData[j].reciever=username;
                //     }
                //     userData.messageData.splice(j,1,userData.messageData[j]);
                // }
                // var messageDataObj=userData.messageData;
                // var messageDataStr=JSON.stringify(messageDataObj);
                // localStorage.removeItem("messageData");
                // localStorage.setItem("messageData",messageDataStr);

                // var thisUserMsgs=userData.userInfo[thisUserId-1];
                // var thisUserSent=userData.userInfo[thisUserId-1].sentmail;
                // console.log(thisUserMsgs);
                // console.log(thisUserSent);
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
            var userInfo=userData.userInfo;
            var thisUserId=$routeParams.id;
            // console.log(findMailboxByUserid("inbox","S",userInfo,thisUserId));
            $scope.userid=thisUserId;
            var thisUserMsgs=userInfo[thisUserId-1].inbox;
            var thisUserSent=userInfo[thisUserId-1].sentmail;
            $scope.thisUserMsgs=thisUserMsgs;
            $scope.thisUserSent=thisUserSent;
            $(document).ready(function(){
                for(var aa=0;aa<thisUserMsgs.length;aa++){
                    if(thisUserMsgs[aa].star===true){
                        $("#stared"+aa).removeClass("notstared")
                            .addClass("stared");
                    }else if(thisUserMsgs[aa].star===false){
                        $("#stared"+aa).removeClass("stared")
                            .addClass("notstared");
                    }
                }
                for(var bb=0;bb<thisUserSent.length;bb++){
                    if(thisUserSent[bb].star===true){
                        $("#sentStared"+bb).removeClass("notstared")
                            .addClass("stared");
                    }else if(thisUserSent[bb].star===false){
                        $("#sentStared"+bb).removeClass("stared")
                            .addClass("notstared");
                    }
                }
            });

            $scope.viewMsg=function (trIndex) {
                $scope.showMsgDetail=true;
                $("#msgPopup").removeClass("ng-hide");
                $scope.msgDetails=thisUserMsgs[trIndex];
            };
            $scope.viewSent=function (trIndex) {
                $scope.showMsgDetail=true;
                $("#msgPopup").removeClass("ng-hide");
                $scope.msgDetails=thisUserSent[trIndex];
            };
            $scope.closeViewMsg=function(){
                $("#msgPopup").addClass("ng-hide");
            };
            $scope.deleteMsg=function(trIndex){
                thisUserMsgs.splice(trIndex,1);
                var userDataStr=JSON.stringify(userInfo);
                localStorage.removeItem("userdata");
                localStorage.setItem("userdata",userDataStr);
            };
            $scope.deleteSent=function(trIndex){
                thisUserSent.splice(trIndex,1);
                var userDataStr=JSON.stringify(userInfo);
                localStorage.removeItem("userdata");
                localStorage.setItem("userdata",userDataStr);
            };
            $scope.starMsg=function(trIndex){
                if(thisUserMsgs[trIndex].star===false){
                    $("#stared"+trIndex).removeClass("notstared")
                        .addClass("stared");
                    thisUserMsgs[trIndex].star=true;
                }else if(thisUserMsgs[trIndex].star===true){
                    $("#stared"+trIndex).removeClass("stared")
                        .addClass("notstared");
                    thisUserMsgs[trIndex].star=false;
                }
                var userDataStr=JSON.stringify(userInfo);
                localStorage.removeItem("userdata");
                localStorage.setItem("userdata",userDataStr);
            };
            $scope.starSent=function(trIndex){
                var sentStarted=$("#sentStarted"+trIndex);
                if(thisUserSent[trIndex].star===false){
                    $("#sentStared"+trIndex).removeClass("notstared")
                        .addClass("stared");
                    thisUserSent[trIndex].star=true;
                }else if(thisUserSent[trIndex].star===true){
                    $("#sentStared"+trIndex).removeClass("stared")
                        .addClass("notstared");
                    thisUserSent[trIndex].star=false;
                }
                var userDataStr=JSON.stringify(userInfo);
                localStorage.removeItem("userdata");
                localStorage.setItem("userdata",userDataStr);
            };
            // compose
            $scope.usernameNotFind=false;
            $scope.sendMail=function(mailReceiver,mailSubject,mailContent){
                var receiverInfo=findUserByUsername(mailReceiver,userInfo);
                var senderInfo=findUserById(thisUserId,userInfo);
                if(receiverInfo===undefined){
                    console.log(1);
                    $scope.usernameNotFind=true;
                }else{
                    var thisTime=Date.now();
                    var newMsg={
                        "msgid":"msg"+thisTime,
                        "recieverid":receiverInfo.userid,
                        "reciever":receiverInfo.username,
                        "senderid":thisUserId,
                        "sender":senderInfo.username,
                        "subject":mailSubject,
                        "content":mailContent,
                        "star":false
                    };
                    userInfo[thisUserId-1].sentmail.push(newMsg);
                    userInfo[receiverInfo.userid-1].inbox.push(newMsg);
                    updateLocalstorage(userInfo,"userdata");
                    // console.log(userInfo);
                }
                // console.log(mailReceiver+" "+mailSubject+" "+mailContent)
            }
            $scope.cancelSendMail=function () {
                $scope.usernameNotFind=false;
                $scope.mailReceiver=undefined;
                $scope.mailSubject=undefined;
                $scope.mailContent=undefined;
            }
        }
        function findUserById(userid,userData){
            for(var i=0;i<userData.length;i++){
                if(userData[i].userid===userid){
                    return userData[i];
                }
            }
        }
        function findUserByUsername(username,userData){
            for(var i=0;i<userData.length;i++){
                if(userData[i].username===username){
                    return userData[i];
                }
            }
        }
        function updateLocalstorage(dataObject,lsName){
            var dataStr=JSON.stringify(dataObject);
            localStorage.removeItem(lsName);
            localStorage.setItem(lsName,dataStr);
        }
        function findMailboxByUserid(whichBox,RorS,userData,userid){
            var mailbox=[];
            for(var i=0;i<userData.length;i++){
                // find the sendbox of the sender
                if(whichBox==="sentmail"&&RorS==="S"){
                    for(var j=0;j<userData[i].sentmail.length;j++){
                        if(userData[i].sentmail[j].senderid===userid){
                            mailbox.push(userData[i].sentmail[j]);
                        }
                    }
                }
                // find the receivebox which has the sender's message
                else if(whichBox==="inbox"&&RorS==="S"){
                    for(var j1=0;j1<userData[i].inbox.length;j1++){
                        if(userData[i].inbox[j1].senderid===userid){
                            mailbox.push(userData[i].inbox[j1]);
                        }
                    }
                }
                // find others sendbox which has the sender's mail
                else if(whichBox==="sentmail"&&RorS==="R"){
                    for(var j2=0;j2<userData[i].sentmail.length;j2++){
                        if(userData[i].sentmail[j2].recieverid===userid){
                            console.log(userData[i]);
                            mailbox.push(userData[i].sentmail[j2]);
                        }
                    }
                }
                // find the receivebox of the sender
                else if(whichBox==="inbox"&&RorS==="R"){
                    for(var j3=0;j3<userData[i].inbox.length;j3++){
                        if(userData[i].inbox[j3].recieverid===userid){
                            mailbox.push(userData[i].inbox[j3]);
                        }
                    }
                }
            }
            return mailbox;
        }
    }
})();




