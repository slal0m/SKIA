const personagens = [];
for (let i = 1; i <= 6; i++) {
    personagens.push(`images/personagens/p${i}.png`);
}

const cenarios = [];
for (let i = 1; i <= 3; i++) {
    cenarios.push(`images/cenarios/c${i}.png`);
}

const objetos = []
for (let i = 1; i <= 3; i++) {
    objetos.push(`images/objetos/o${i}.png`);
}

const musicas = []
for (let i = 1; i <= 6; i++) {
    musicas.push(`images/musicas/m${i}.png`);
}

const imageLibraries = {
    cenarios,
    personagens,
    objetos
}

const TRANSITION_DURATION = 500;

function loadImages(menuId, images) {
    const menu = document.getElementById(menuId);
    // Seleciona o contêiner principal: <div class="palco">
    const mainStage = document.querySelector('.palco');

    if (menu) {
        menu.innerHTML = '';
        images.forEach((imageSrc, index) => {

            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `Imagem ${index + 1}`;
            img.classList.add('menu-image');
            
            if(menuId === 'personagens_menu') {
                img.classList.add('library-item', 'personagens');
            }
            else if(menuId === 'objetos_menu') {
                img.classList.add('library-item', 'objetos');
            }
            else if(menuId === 'cenarios_menu') {
                img.classList.add('cenarios');
            }

            img.onerror = function() {
                this.style.display = 'none'; // esconde imagens que não existem
            };
            img.addEventListener('click', () => {
                if (menuId === 'cenarios_menu' && mainStage) {
                    // Aplica a imagem de fundo ao contêiner .palco (camada abaixo)
                    mainStage.style.backgroundImage = `url('${imageSrc}')`;
                    mainStage.style.backgroundSize = 'cover'; 
                    mainStage.style.backgroundPosition = 'center'; 
                }
                else {

                }
            });
            menu.appendChild(img);
        });
    }
}


let currentMenuOpen = null;

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

// Remova a sua função menu_acoes() e a chamada menu_acoes();
// Use esta abordagem de delegação (deve ser colocada no seu principal.js):

function setupPersonagemActions() {
    // É crucial que esta função seja chamada DENTRO do DOMContentLoaded
    
    const palco = document.querySelector('.palco');
    
    if (!palco) {
        console.error("Não foi possível encontrar o palco para anexar o listener.");
        return;
    }

    // Anexamos o listener ao elemento PALCO
    palco.addEventListener("click", function (event) {
        
        // 1. Procure o menu AQUI (mais seguro contra erros de inicialização)
        const menu_acoes_element = document.getElementById('menu_acoes'); 

        const clickedItem = event.target.closest('.draggable-item.personagens');

        if (clickedItem) {
            console.log("Personagem clicado"); 
            
            if (menu_acoes_element) {
                // Obter as coordenadas absolutas e dimensões do personagem
                const rect = clickedItem.getBoundingClientRect();
                
                // 2. Calcular a posição do menu
                // Queremos o centro horizontal do personagem (rect.left + rect.width / 2)
                // e logo abaixo da base do personagem (rect.bottom).
                
                const menuX = rect.left + rect.width / 2;
                // Coloca o menu 10px abaixo da base do personagem
                const menuY = rect.bottom + 10; 
                
                // 3. Aplicar a nova posição
                menu_acoes_element.style.top = `${menuY}px`;
                menu_acoes_element.style.left = `${menuX}px`;
                
                // 4. Ativar e mostrar o menu
                menu_acoes_element.classList.add("active");
                console.log("Menu de ações movido e mostrado.");
            } else {
                console.error("ERRO: Elemento #menu_acoes não foi encontrado no DOM.");
            }
        }
        else {
            // Clicou noutro lugar no palco
            if (menu_acoes_element) {
                menu_acoes_element.classList.remove("active");
                console.log("Menu de ações escondido");
            }
        }
    });
}

setupPersonagemActions();