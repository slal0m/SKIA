const personagens = [];
for (let i = 1; i <= 50; i++) {
    personagens.push(`images/personagens/p${i}.png`);
}

const cenarios = [];
for (let i = 1; i <= 30; i++) {
    cenarios.push(`images/cenarios/c${i}.jpg`);
}

const objetos = []
for (let i = 1; i <= 35; i++) {
    objetos.push(`images/objetos/o${i}.png`);
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
                placeOnStage(imageSrc);
            });
            menu.appendChild(img);
        });
    }
}

function placeOnStage(imageSrc) {
  const palco = document.querySelector('.palco');
  let stageImg = palco.querySelector('.stage-image');
  stageImg = document.createElement('img');
  stageImg.classList.add('stage-image');
  palco.appendChild(stageImg);
  stageImg.src = imageSrc;
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