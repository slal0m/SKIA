const personagens = [];
for (let i = 1; i <= 6; i++) {
    personagens.push(`images/personagens/p${i}.png`);
}

const cenarios = [];
for (let i = 1; i <= 9; i++) {
    cenarios.push(`images/cenarios/c${i}.png`);
}

const objetos = []
for (let i = 1; i <= 3; i++) {
    objetos.push(`images/objetos/o${i}.png`);
}

const musica_icons = [] 
for (let i = 1; i <= 6; i++) {
    musica_icons.push(`images/audios/m${i}.png`); // Assumindo que você usa /musicas/m*.png para os ícones
}

const backgroundMusic = new Audio();
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

const imageLibraries = {
    cenarios,
    personagens,
    objetos,
    musica: musica_icons
}

let activeDraggableItem = null;
let currentLightValue = 100;

// ===== MENU DE PERSONAGENS ADICIONADOS =====
const personagensAdicionados = new Map(); // Map<elementId, {elemento, thumbnail, index}>

function atualizarMenuPersonagens() {
    const dropzones = document.querySelectorAll('.dropzone');
    const todosPersonagens = [];
    
    dropzones.forEach(dz => {
        const itens = dz.querySelectorAll('.draggable-item.personagens');
        itens.forEach(item => {
            todosPersonagens.push(item);
        });
    });

    // Atualizar Map
    personagensAdicionados.clear();
    todosPersonagens.forEach((item, index) => {
        const id = item.id || `personagem_${Date.now()}_${index}`;
        if (!item.id) item.id = id;
        
        // Extrair número do personagem do src (p1, p2, etc)
        const srcMatch = item.src.match(/p(\d+)/);
        const numPersonagem = srcMatch ? parseInt(srcMatch[1]) : (index + 1);
        
        personagensAdicionados.set(id, {
            elemento: item,
            thumbnail: item.src,
            index: index,
            numPersonagem: numPersonagem  // Guardar o número real do personagem (1-6)
        });
    });
}

// Observar mudanças na dropzone
function setupPersonagensObserver() {
    const dropzones = document.querySelectorAll('.dropzone');
    dropzones.forEach(dz => {
        const observer = new MutationObserver(() => {
            atualizarMenuPersonagens();
        });
        observer.observe(dz, { childList: true, subtree: true });
    });
}

// Botão fechar menu unificado
document.addEventListener('DOMContentLoaded', () => {
    const fecharBtn = document.getElementById('fechar-menu');
    const toggleBtn = document.getElementById('toggle-menu-btn');
    const menuUnificado = document.getElementById('menu-unificado');
    
    if (fecharBtn) {
        fecharBtn.addEventListener('click', () => {
            menuUnificado.classList.remove('active');
            if (toggleBtn) toggleBtn.classList.remove('hidden');
        });
    }
    
    // Botão flutuante para abrir menu
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            menuUnificado.classList.add('active');
            toggleBtn.classList.add('hidden');
        });
    }
});

// Chamar quando a página carregar
setTimeout(() => {
    setupPersonagensObserver();
    atualizarMenuPersonagens();
}, 500);

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

function flipActiveItem() {
    if (activeDraggableItem) {
        // 1. Obtém o estado atual da escala horizontal (padrão é 1)
        let currentScaleX = parseFloat(activeDraggableItem.dataset.scaleX) || 1;
        
        // 2. Alterna entre 1 (normal) e -1 (flip)
        let newScaleX = currentScaleX * -1; 
        
        // 3. Salva o novo valor nos dados do elemento
        activeDraggableItem.dataset.scaleX = newScaleX;

        // 4. Recupera as outras transformações (posição e escala geral)
        const x = parseFloat(activeDraggableItem.dataset.x) || 0;
        const y = parseFloat(activeDraggableItem.dataset.y) || 0;
        const scale = parseFloat(activeDraggableItem.dataset.scale) || 1; 

        // 5. Aplica a nova transformação
        // O flip é feito usando scale(scaleX * scale, scale)
        activeDraggableItem.style.transform = 
            `translate(${x}px, ${y}px) scale(${scale * newScaleX}, ${scale})`;
            
        console.log(`Item virado. Novo scaleX: ${newScaleX}`);
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
            else if(menuId === 'musica_menu') {
                img.classList.add('musicas');
                img.addEventListener('click', () => {
                    
                    const musicNumber = index + 1;
                    const audioPath = `audios/m${musicNumber}.wav`;
                    
                    const isSameTrackPlaying = (backgroundMusic.src.endsWith(audioPath) && !backgroundMusic.paused);
                    
                    document.querySelectorAll('.musica').forEach(el => el.classList.remove('active-track'));

                    if (isSameTrackPlaying) {
                        // 1. SE A MESMA MÚSICA ESTIVER A TOCAR, PARAR.
                        backgroundMusic.pause();
                        console.log(`Música ${musicNumber} parada.`);
                        
                    } else if (backgroundMusic.src.endsWith(audioPath)) {
                        // 2. SE A MESMA MÚSICA ESTIVER PAUSADA, CONTINUAR.
                        backgroundMusic.play().then(() => {
                            img.classList.add('active-track');
                            console.log(`Música ${musicNumber} retomada.`);
                        }).catch(error => console.error("Erro ao retomar:", error));

                    } else {
                        // 3. SE FOR UMA NOVA MÚSICA, MUDAR O SOURCE E TOCAR.
                        backgroundMusic.src = audioPath;
                        backgroundMusic.play().then(() => {
                            img.classList.add('active-track');
                            console.log(`A tocar: ${audioPath}`);
                        }).catch(error => {
                            console.error(`Erro ao tentar tocar a música ${audioPath}:`, error);
                            alert(`Não foi possível tocar o ficheiro de áudio ${audioPath}. Verifique o caminho.`);
                        });
                    }
                });
            }

            img.onerror = function() {
                this.style.display = 'none'; // esconde imagens que não existem
            };

            if (menuId === 'cenarios_menu' && mainStage) {
                img.addEventListener('click', () => { 
                    mainStage.style.backgroundImage = `url('${imageSrc}')`;
                    mainStage.style.backgroundSize = 'cover'; 
                    mainStage.style.backgroundPosition = 'center'; 
                });
            }

            img.addEventListener('click', () => {
                if (menuId === 'cenarios_menu' && mainStage) {
                    // Aplica a imagem de fundo ao contêiner .palco (camada abaixo)
                    mainStage.style.backgroundImage = `url('${imageSrc}')`;
                    mainStage.style.backgroundSize = 'cover'; 
                    mainStage.style.backgroundPosition = 'center'; 
                }
                else if (menuId === 'musica_menu') { // <--- NOVO: Adicione uma ação para a música
                    // Aqui pode adicionar a lógica para tocar a música
                    // Exemplo: playMusic(imageSrc);
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
    const palco = document.querySelector('.palco');
    const menu_acoes_element = document.getElementById('menu_acoes'); 
    // Captura o botão "Refletir"
    const flipButton = document.getElementById('refletir'); 

    // 1. Listener para o botão de Flip (Chama a função criada acima)
    if (flipButton) {
        flipButton.removeEventListener('click', flipActiveItem); 
        flipButton.addEventListener('click', flipActiveItem);
    }
    
    if (!palco) {
        console.error("Não foi possível encontrar o palco para anexar o listener.");
        return;
    }

    palco.addEventListener("click", function (event) {
        
        const clickedItem = event.target.closest('.draggable-item.personagens');
        const isActionClick = event.target.closest('#menu_acoes button'); 

        if (clickedItem) {
            // AQUI É O PONTO CHAVE: Salva o elemento clicado
            activeDraggableItem = clickedItem;

            if (menu_acoes_element) {
                // ... (Sua lógica de posicionamento do menu aqui)
                const rect = clickedItem.getBoundingClientRect();
                const menuX = rect.left + rect.width / 2;
                const menuY = rect.bottom + 10; 
                
                menu_acoes_element.style.top = `${menuY}px`;
                menu_acoes_element.style.left = `${menuX}px`;
                
                menu_acoes_element.classList.add("active");
                console.log("Menu de ações movido e mostrado.");
            }
        }
        else if (isActionClick) {
             // Deixa o menu de ações aberto se a ação clicada for dentro dele
             console.log("Ação do menu clicada.");
        }
        else {
            // Clicou noutro lugar, esconde o menu
            if (menu_acoes_element) {
                menu_acoes_element.classList.remove("active");
                console.log("Menu de ações escondido");
            }
            activeDraggableItem = null; // Limpa o item ativo
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

const recordButton = document.getElementById('gravar');
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

// ===== MENU ACESSÓRIOS/EXPRESSÕES/AÇÕES =====

let personagemSelecionado = null; // Número do personagem (1-6)
let elementoPersonagemSelecionado = null; // Referência ao elemento IMG do personagem
let expressaoSelecionada = 1; // Expressão atual para as ações (1-3)

function abrirMenuAcessoriosPersonagem(numPersonagem, elemento) {
    personagemSelecionado = numPersonagem;
    elementoPersonagemSelecionado = elemento; // Guardar referência ao elemento
    const container = document.getElementById('menu-unificado');
    const toggleBtn = document.getElementById('toggle-menu-btn');
    const nomeElement = document.getElementById('personagem-nome-selecionado');
    
    nomeElement.textContent = `PERSONAGEM ${numPersonagem}`;
    container.classList.add('active');
    if (toggleBtn) toggleBtn.classList.add('hidden');
    
    // Atualizar miniaturas
    atualizarMiniaturasSelecionadas(numPersonagem);
    
    // Carregar os conteúdos
    carregarExpressoes(numPersonagem);
    carregarAcoes(numPersonagem);
}

function atualizarMiniaturasSelecionadas(numPersonagem) {
    const container = document.getElementById('personagens-miniaturas');
    container.innerHTML = '';
    
    // Mostrar apenas as personagens que foram adicionadas ao palco
    for (const [numPerson, data] of personagensAdicionados) {
        const miniDiv = document.createElement('div');
        miniDiv.className = 'miniatura-personagem';
        if (data.numPersonagem === numPersonagem) miniDiv.classList.add('selecionado');
        
        const img = document.createElement('img');
        img.src = `images/personagens/p${data.numPersonagem}.png`;
        miniDiv.appendChild(img);
        
        miniDiv.addEventListener('click', () => {
            // Mudar para outro personagem usando o elemento armazenado
            abrirMenuAcessoriosPersonagem(data.numPersonagem, data.elemento);
        });
        
        container.appendChild(miniDiv);
    }
}

function carregarExpressoes(numPersonagem) {
    const grid = document.getElementById('grid-expressoes');
    grid.innerHTML = '';
    
    // As expressões são: p1_e1, p1_e2, p1_e3
    const expressoes = [];
    for (let e = 1; e <= 3; e++) {
        const filename = `p${numPersonagem}_e${e}.png`;
        const src = `images/expressoes/${filename}`;
        expressoes.push({
            src,
            label: `Expressão ${e}`,
            filename,
            numExpressao: e
        });
    }
    
    expressoes.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-biblioteca';
        
        const img = document.createElement('img');
        img.className = 'item-thumbnail';
        img.src = item.src;
        img.alt = item.label;
        
        img.onerror = function() {
            this.style.opacity = '0.3';
        };
        
        const label = document.createElement('span');
        label.className = 'item-label';
        label.textContent = item.label;
        
        itemDiv.appendChild(img);
        itemDiv.appendChild(label);
        
        // Click para atualizar o personagem
        itemDiv.addEventListener('click', () => {
            if (elementoPersonagemSelecionado) {
                elementoPersonagemSelecionado.src = item.src;
                
                // Remover seleção anterior
                document.querySelectorAll('#grid-expressoes .item-biblioteca.selecionado').forEach(el => {
                    el.classList.remove('selecionado');
                });
                
                // Adicionar seleção ao clicado
                itemDiv.classList.add('selecionado');
                
                // Atualizar expressão selecionada e recarregar ações
                expressaoSelecionada = item.numExpressao;
                carregarAcoes(personagemSelecionado);
                
                console.log(`Personagem ${personagemSelecionado} atualizado com expressão: ${item.label}`);
            }
        });
        
        grid.appendChild(itemDiv);
    });
}

function carregarAcoes(numPersonagem) {
    const grid = document.getElementById('grid-acoes');
    grid.innerHTML = '';
    
    // As ações mostram apenas os 3 frames da expressão selecionada
    // Estrutura: p1_e{expressao}_f1, p1_e{expressao}_f2, p1_e{expressao}_f3
    
    const acoes = [];
    for (let f = 1; f <= 3; f++) {
        const filename = `p${numPersonagem}_e${expressaoSelecionada}_f${f}.gif`;
        const src = `images/acoes/${filename}`;
        acoes.push({
            src,
            label: `Ação ${f}`,
            filename
        });
    }
    
    acoes.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-biblioteca';
        
        const img = document.createElement('img');
        img.className = 'item-thumbnail';
        img.src = item.src;
        img.alt = item.label;
        
        img.onerror = function() {
            this.style.opacity = '0.3';
        };
        
        const label = document.createElement('span');
        label.className = 'item-label';
        label.textContent = item.label;
        
        itemDiv.appendChild(img);
        itemDiv.appendChild(label);
        
        // Click para atualizar o personagem
        itemDiv.addEventListener('click', () => {
            if (elementoPersonagemSelecionado) {
                elementoPersonagemSelecionado.src = item.src;
                
                // Remover seleção anterior
                document.querySelectorAll('#grid-acoes .item-biblioteca.selecionado').forEach(el => {
                    el.classList.remove('selecionado');
                });
                
                // Adicionar seleção ao clicado
                itemDiv.classList.add('selecionado');
                
                console.log(`Personagem ${personagemSelecionado} atualizado com ação: ${item.label}`);
            }
        });
        
        grid.appendChild(itemDiv);
    });
}

// Setup das abas
document.addEventListener('DOMContentLoaded', () => {
    // Removido: abas não são mais necessárias no novo layout
});

