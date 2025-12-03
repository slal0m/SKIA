const personagens = [];
for (let i = 1; i <= 50; i++) {
    personagens.push(`images/personagens/p${i}.jpeg`);
}

const cenarios = [];
for (let i = 1; i <= 30; i++) {
    cenarios.push(`images/cenarios/c${i}.jpeg`);
}

const objetos = []
for (let i = 1; i <= 35; i++) {
    objetos.push(`images/objetos/o${i}.jpeg`);
}

const imageLibraries = {
    cenarios,
    personagens,
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