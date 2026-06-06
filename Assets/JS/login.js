const loginExist = document.getElementById("loginForm");


loginExist.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("contrasena").value;
    loginExist.reset();

    fetch('/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        window.location.href = data.redirect;
    })
    .catch(err => {
        alert(err.message);
    });

});