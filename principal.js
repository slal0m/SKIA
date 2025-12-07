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
    const menuButtons = document.querySelectorAll('.menu-btn'); // NodeList (All buttons)
    const menuContainer = document.querySelector('.menu-container'); 
    const TRANSITION_DURATION = 500; // Assuming 0.5s for CSS transition

    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const menuType = target.replace('_menu', '');
            
            const clickedButton = this; // <--- The single button element being clicked

            // 1. Limpa timeouts pendentes
            document.querySelectorAll('.flyoutmenu_e').forEach(menu => {
                const timeoutId = menu.dataset.timeoutId;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    delete menu.dataset.timeoutId;
                }
            });
            
            if (currentMenuOpen !== target) {
                // ===================================
                // ABRIR NOVO MENU
                // ===================================
                
                // A. Fechar e limpar o menu anterior
                document.querySelectorAll('.flyoutmenu_e').forEach(menu => {
                    menu.classList.remove('active');
                    // Remove a classe ativa do botão anterior (procura pelo data-target)
                    document.querySelector(`[data-target="${menu.id}"]`).classList.remove('active'); 
                    
                    menu.style.display = 'none'; 
                    menu.innerHTML = ''; 
                });
                
                // B. Carregar as novas imagens
                if (imageLibraries[menuType]) {
                    loadImages(target, imageLibraries[menuType]);
                }
                
                const newMenu = document.getElementById(target);
                
                if (newMenu) {
                    // C. Set display imediatamente (para o fade-in)
                    newMenu.style.display = 'flex'; // Use 'grid' ou 'flex' conforme o seu CSS
                    
                    // D. Ativar menu (inicia o fade-in)
                    newMenu.classList.add('active');
                }
                
                // E. Mover o menu principal e marcar o botão ATUAL como ativo
                clickedButton.classList.add('active');         // <-- CORREÇÃO AQUI
                menuContainer.classList.add('shifted');
                
                currentMenuOpen = target; 
                
            } else { 
                // ===================================
                // FECHAR MENU ATUAL
                // ===================================
                
                const currentMenu = document.getElementById(target);
                
                // A. Remove a classe ativa (inicia o fade-out)
                currentMenu.classList.remove('active');
                
                // B. Desmover o menu principal e desmarcar o botão ATUAL
                menuContainer.classList.remove('shifted');
                clickedButton.classList.remove('active');     // <-- CORREÇÃO AQUI
                
                // C. Atrasar o display: none
                const timeoutId = setTimeout(() => {
                    currentMenu.style.display = 'none';
                    currentMenu.innerHTML = ''; 
                    delete currentMenu.dataset.timeoutId; 
                }, TRANSITION_DURATION); 
                
                currentMenu.dataset.timeoutId = timeoutId; 
                currentMenuOpen = null;
            } 
        });
    });
});