
const socket = io()
let ID; //my user id
let name; //my user name
let full_details;
let state=false;
let url;


function clickHandler(name,sid){
    console.log(name,sid)
}
socket.on('sending_user_details',({sid,randomName})=>{ // getting my socket id and name from server
    ID=sid;
    name=randomName
    
})



socket.on('all_users',(USER_DETAILS)=>{
  full_details=USER_DETAILS;
  if(state===false){
    createElement(USER_DETAILS);
    state=true;
  }
  else{
    // ui.remove();
    createElement(USER_DETAILS)
  }
  

 
})


function createElement(new_details)  // rendering elements into front page
{
  new_details.find((element,index)=>{
    if(element.sid=== ID){   // don't show its user id
      new_details.splice(index,1)
      return true
    }
  })
  const ul = document.createElement('ul');
  document.body.appendChild(ul);
  new_details.forEach((element,index) => {
        let  li = document.createElement('li');
        li.innerHTML=element.randomName;
        ul.appendChild(li);
    });
}

function myFunction(event) {
  
  x=event.target.innerHTML
  console.log(x)
  full_details.forEach((element)=>{
    if(x===element.randomName)
  {
    Swal.fire({
    title: "Send Video notification to " +x ,
    text: "Are you sure to continue?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6', 
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, confirm it!'
  }).then((result) => {
    if (result.isConfirmed) { 
      socket.emit("send-notification-to-perticular-user",x)

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Video call Send',
        showConfirmButton: false,
        timer: 1500
        }
      )
      

    }
    else{

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Video call Cancelled',
        showConfirmButton: false,
        timer: 1500
        }
      )
      
    }
    
  })


    



  }

  })
}

socket.on('notification-send',({sid,room_details})=>{
  let finduser=full_details.find((element)=>{
    return element.sid === sid
  })

  
  if(finduser){
    callalert(finduser.randomName,finduser.sid,'Notification of video call  send from ',url,room_details)
  }
})

function callalert(user,sid,heading,url,room_details){
  
  Swal.fire({
    title: heading +user ,
    text: "Are you sure to continue?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, confirm it!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Video call accepted',
        showConfirmButton: false,
        timer: 1500
        }
      )
      notification(true,sid)
      url=window.location.href+room_details
      window.location.href = url;
      // callback('notification is accepted');
      

    }
    else{
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Notification cancelled',
        showConfirmButton: false,
        timer: 1500
        })
      notification(false,sid)
      
    }
    
  })
}

const notification=(data,sid)=>{ // sending notification to server
  if(data===true)
  {
    socket.emit('accept-send',sid)
    console.log(sid)
    return true;

  }
  else{                     
    socket.emit('reject-send',sid)
    return false
  }

}

socket.on('accepted',()=>{ //accept notification from server
  setTimeout(()=>{
    window.location.href = url
  },2000)
  
 
})

socket.on('rejected',()=>{  // reject notification from server
  // swal.fire(
  //   'Rejected',
  //   'Your notification is cancelled !',
  //   'error'
  // )
  Swal.fire({
    position: 'center',
    icon: 'error',
    title: 'Your Notification is rejected',
    showConfirmButton: false,
    timer: 1500
    })
    url="";

})

socket.on('change_url',(data)=>{

  url=window.location.href+data;

})

