const personagens = [];
for (let i = 1; i <= 50; i++) {
    personagens.push(`images/personagens/p${i}.png`);
}

const cenarios = [];
for (let i = 1; i <= 30; i++) {
    cenarios.push(`images/cenarios/c${i}.jpeg`);
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
            });
            menu.appendChild(img);
        });
    }
}


let currentMenuOpen = null;

//const cenarios = document.getElementById()

// ... (rest of the file)

document.addEventListener('DOMContentLoaded', () => {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const menuContainer = document.querySelector('.menu-container'); 
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target'); // Ex: 'cenarios_menu'
            const menuType = target.replace('_menu', ''); // Ex: 'cenarios'
            
            // Lógica de Controlo de Abertura
            if (currentMenuOpen !== target) {
                // 1. ABRIR NOVO MENU
                
                // 🛑 CORRECTION HERE: Target all flyout menus using the correct class (.flyoutmenu_e)
                document.querySelectorAll('.flyoutmenu_e').forEach(menu => {
                    menu.innerHTML = '';
                    menu.classList.remove('active'); // Esconde o menu anterior
                });
                
                // Carregar as novas imagens
                if (imageLibraries[menuType]) {
                    loadImages(target, imageLibraries[menuType]);
                }
                
                // Ativar e mostrar o novo menu
                const newMenu = document.getElementById(target);
                if (newMenu) {
                    newMenu.classList.add('active');
                }
                
                // Manter o rastreio
                currentMenuOpen = target; 
                
            } else { 
                // 2. FECHAR MENU ATUAL (o botão foi clicado novamente)
                
                const currentMenu = document.getElementById(target);

                // Limpa o menu
                currentMenu.innerHTML = '';
                // Esconde o menu flutuante
                currentMenu.classList.remove('active');
                
                // Limpar o rastreio
                currentMenuOpen = null;
            } 
        });
    });
});