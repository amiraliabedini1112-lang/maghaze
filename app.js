function login() {
const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value;
const error = document.getElementById("error");

```
if (username === "amirali" && password === "sstttat") {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    error.textContent = "";
} else {
    error.textContent = "نام کاربری یا رمز عبور اشتباه است.";
}
```

}

function logout() {
document.getElementById("app").style.display = "none";
document.getElementById("login").style.display = "block";
}
