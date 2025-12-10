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

let currentLightValue = 100;

function loadRightMenuContent(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    // --- Configuração do Menu de LUZ (Luminosidade) ---
    if (menuId === 'luz_menu') {
        const lightSlider = document.getElementById('light-slider');
        const mainStage = document.querySelector('.palco');

        if (lightSlider && mainStage) {
            
            // Função de atualização (deve ser definida para ser referenciada)
            function updateBackgroundLight() { 
                const value = parseInt(this.value);
                
                // 1. ATUALIZA O VALOR GLOBAL ANTES DE MUDAR A COR
                currentLightValue = value; 
                
                const colorValue = Math.round((value / 100) * 255);
                const rgbColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                
                mainStage.style.backgroundColor = rgbColor;
                console.log(`Luz definida para: ${value}% (${rgbColor})`);
            }
            
            // Remove o listener anterior para evitar duplicação (boas práticas)
            lightSlider.removeEventListener('input', updateBackgroundLight); 
            
            // 2. APLICA O VALOR GLOBAL GUARDADO AO SLIDER
            lightSlider.value = currentLightValue; 

            // Adiciona o novo listener
            lightSlider.addEventListener('input', updateBackgroundLight);

            // 3. EXECUTA A FUNÇÃO UMA VEZ PARA APLICAR O VALOR GUARDADO AO PALCO
            updateBackgroundLight.call(lightSlider); 
        }
    }

    // --- Configuração do Menu de SOM (Volume) ---
    if (menuId === 'som_menu') {
        const volumeSlider = document.getElementById('volume-slider');
        
        if (volumeSlider) {
             // ... (Mantenha aqui a sua lógica existente para o volume) ...
             // (Garantir que updateBackgroundVolume também atualiza uma variável global se necessário)
             volumeSlider.removeEventListener('input', updateBackgroundVolume); 
            
            function updateBackgroundVolume() {
                 backgroundMusic.volume = parseFloat(this.value);
            }
            
            volumeSlider.addEventListener('input', updateBackgroundVolume);
            volumeSlider.value = backgroundMusic.volume; // Carrega o valor atual ao abrir
        }
    }
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

// VERSÃO CORRIGIDA (MAS NÃO RECOMENDADA)
function luzsom() {
    // 1. Definições de Elementos
    const luz_botao = document.getElementById('luz');
    const luz_menu = document.getElementById('luz_menu');
    const som_botao = document.getElementById('som');
    const som_menu = document.getElementById('som_menu');
    const menu_containter_direita = document.querySelector('.menu-container_direita');
    
    // Certifique-se de que o container existe
    if (!menu_containter_direita) {
        console.error("Container da direita não encontrado!");
        return;
    }

    // --- LÓGICA DO BOTÃO LUZ ---
    if (luz_botao && luz_menu) {
        luz_botao.addEventListener('click', () => {
            console.log('Toggle Luz');
            
            // 1. Fechar o menu oposto (Som) se estiver aberto
            if (som_menu && som_menu.classList.contains('active')) {
                som_menu.classList.remove('active');
                som_botao.classList.remove('active');
            }
            
            // 2. Abrir/Fechar o menu Luz
            luz_botao.classList.toggle('active');
            luz_menu.classList.toggle('active');

            // 3. Controlar o deslocamento do container principal
            // O container só deve ser shifted se algum menu estiver ativo
            if (luz_menu.classList.contains('active')) {
                menu_containter_direita.classList.add('shifted');
                loadRightMenuContent('luz_menu');
            } else {
                menu_containter_direita.classList.remove('shifted');
            }
        });
    }

    // --- LÓGICA DO BOTÃO SOM ---
    if (som_botao && som_menu) {
        som_botao.addEventListener('click', () => {
            console.log('Toggle Som');

            // 1. Fechar o menu oposto (Luz) se estiver aberto
            if (luz_menu && luz_menu.classList.contains('active')) {
                luz_menu.classList.remove('active');
                luz_botao.classList.remove('active');
            }

            // 2. Abrir/Fechar o menu Som
            som_botao.classList.toggle('active');
            som_menu.classList.toggle('active');
            
            // 3. Controlar o deslocamento do container principal
            // O container só deve ser shifted se algum menu estiver ativo
            if (som_menu.classList.contains('active')) {
                menu_containter_direita.classList.add('shifted');
            } else {
                menu_containter_direita.classList.remove('shifted');
            }
            
            // Chamamos a lógica de volume, se for o menu som
            if (som_menu.classList.contains('active') && typeof loadRightMenuContent === 'function') {
                loadRightMenuContent('som_menu');
            }
        });
    }
}

luzsom();



//RECORDING SCREEN

let mediaRecorder;
let recordedChunks = [];
let stream;

const recordButton = document.getElementById('record-btn');
const recordIcon = recordButton ? recordButton.querySelector('.icon') : null;


function startRecording() {
    // 1. Capturar o conteúdo da tela
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "always", // Opcional: para mostrar o cursor
        },
        audio: true // Opcional: para gravar áudio do sistema/microfone
    })
    .then(displayStream => {
        stream = displayStream;
        recordedChunks = [];

        // 2. Configurar o MediaRecorder
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });

        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = downloadRecording;

        // 3. Iniciar a gravação
        mediaRecorder.start();
        
        // Atualizar o UI
        if (recordIcon) {
            recordIcon.textContent = 'stop'; // Mudar o ícone para "Parar"
            recordButton.classList.add('recording');
        }

        console.log("Gravação iniciada...");
    })
    .catch(err => {
        console.error("Erro ao iniciar a captura de tela: ", err);
        alert("Não foi possível iniciar a gravação. Certifique-se de que deu permissão para a captura de tela.");
    });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        // Parar as tracks (o prompt do navegador para de mostrar a tela compartilhada)
        stream.getTracks().forEach(track => track.stop());

        // Atualizar o UI
        if (recordIcon) {
            recordIcon.textContent = 'videocam'; // Mudar o ícone de volta para "Gravar"
            recordButton.classList.remove('recording');
        }
        console.log("Gravação parada.");
    }
}

function downloadRecording() {
    if (recordedChunks.length === 0) {
        console.log("Nenhum dado gravado.");
        return;
    }
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    // Criar link de download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minha-cena-skia.webm';
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    window.URL.revokeObjectURL(url);
    a.remove();
    recordedChunks = []; // Limpa os chunks após o download
}

if (recordButton) {
    recordButton.addEventListener('click', () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            startRecording();
        } else if (mediaRecorder.state === 'recording') {
            stopRecording();
        }
    });
}

