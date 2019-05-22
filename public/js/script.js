console.log("Connected!");
function login(event, formData){
    event.preventDefault();
    var email = formData.email.value;
    var password = formData.password.value;
    fetch("/admin/login",{
        method: "POST",
        body:JSON.stringify({ email: email, password:password })
    })
    .then(function(res){ 
        if(res.status == 200){
            return res.json();
        }else{
            window.location = "/login"
        }
     })
     .then(result => {
         $("#err").text(result.message)
     })
    return false;
}