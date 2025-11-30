function popup_funciona() {

    const popup_abrir = document.getElementById('bttdefinicoes');
    const popup = document.getElementById('settings');
    const popup_close = document.getElementById('closeSettings');
    const play = document.getElementById('bttplay');

    play.addEventListener("click", function () {
        window.location.href = "principal.html";
    });

    popup_abrir.addEventListener("click", function () {
        popup.classList.add("show");
    });

    popup_close.addEventListener("click", function () {
        popup.classList.remove("show");
    });
 }

 popup_funciona(); 