const personagens = [];
for (let i = 1; i <= 50; i++) {
    personagens.push(`images/personagens/p${i}.jpeg`);
}

const cenarios = [];
for (let i = 1; i <= 30; i++) {
    cenarios.push(`images/cenarios/c${i}.jpeg`);
}

const expressoes = []
for (let i = 1; i <= 40; i++) {
    expressoes.push(`images/expressoes/e${i}.jpeg`);
}

const objetos = []
for (let i = 1; i <= 35; i++) {
    objetos.push(`images/objetos/o${i}.jpeg`);
}

const imageLibraries = {
    cenarios,
    personagens,
    expressoes,
    objetos
}
function loadImages(menuId, images) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.innerHTML = '';
        images.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `Imagem ${index + 1}`;
            img.classList.add('menu-image');
            img.onerror = function() {
                this.style.display = 'none'; // esconde imagens que não existem
            };
            img.addEventListener('click', () => {
                //console.log('Imagem selecionada:', imageSrc);
                // aqui é para adicionar o que acontece quando selecioanamos uma imagem
            });
            menu.appendChild(img);
        });
    }
}


let currentMenuOpen = null;

document.addEventListener('DOMContentLoaded', () => {
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const menuType = target.replace('_menu', '');
            
            // dar update aos menus ao clicar noutros botões
            if (currentMenuOpen !== target) {
                document.querySelectorAll('.flyoutmenu_e').forEach(menu => {
                    menu.innerHTML = '';
                });
                currentMenuOpen = target;
            }
            
            if (imageLibraries[menuType]) {
                loadImages(target, imageLibraries[menuType]);
            }
        });
    });
});

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