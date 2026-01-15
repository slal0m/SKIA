
/**********************
 * Configurações
 **********************/
const GROUP_SCALE_ENABLED = true; // true: pinça num item do grupo escala todo o grupo

/**********************
 * Estado global
 **********************/
const groups = new Map();         // Map<groupId, Set<Element>>
const selected = new Set();       // Set<Element>

/**********************
 * 🔗 Integração com o painel existente
 * Ajusta os IDs conforme o teu HTML:
 *   - actionPanel: container flutuante que já tens
 *   - btnGroup: botão "Agrupar"
 *   - btnUngroup: botão "Desagrupar"
 **********************/
const actionPanel = document.getElementById('actionPanel');
const btnGroup    = document.getElementById('btnGroup');
const btnUngroup  = document.getElementById('btnUngroup');

function showActionPanel() {
  if (!actionPanel) return;
  actionPanel.classList.add('visible');
  positionActionPanelNearSelection();
}
function hideActionPanel() {
  if (!actionPanel) return;
  actionPanel.classList.remove('visible');
}
function positionActionPanelNearSelection() {
  if (!actionPanel || selected.size === 0) return;

  // Calcula o bounding box de todos os itens selecionados
  const rects = [...selected].map(el => el.getBoundingClientRect());
  const left = Math.min(...rects.map(r => r.left));
  const top = Math.min(...rects.map(r => r.top));
  const right = Math.max(...rects.map(r => r.right));
  const topCenter = (left + right) / 2;

  // Posiciona o painel acima dos selecionados (ajusta conforme layout)
  actionPanel.style.position = 'fixed';
  actionPanel.style.left = `${Math.max(8, topCenter - actionPanel.offsetWidth / 2)}px`;
  actionPanel.style.top  = `${Math.max(8, top - actionPanel.offsetHeight - 12)}px`;
}
function updatePanelButtons() {
  if (!btnGroup || !btnUngroup) return;
  const sel = [...selected];
  const canGroup = sel.length >= 2 && sel.some(el => !el.dataset.groupId);
  const canUngroup = sel.some(el => !!el.dataset.groupId);
  btnGroup.disabled = !canGroup;
  btnUngroup.disabled = !canUngroup;
}

/**********************
 * Utils
 **********************/
function getPointerCoordinates(event) {
  const touches = event.touches;
  if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
    return { x: event.clientX, y: event.clientY };
  }
  if (typeof event.pageX === 'number' && typeof event.pageY === 'number') {
    return { x: event.pageX, y: event.pageY };
  }
  if (touches && touches[0]) {
    return { x: touches[0].clientX, y: touches[0].clientY };
  }
  return { x: 0, y: 0 };
}

function clearSelection() {
  [...selected].forEach(el => el.classList.remove('selected'));
  selected.clear();
  hideActionPanel();
  document.dispatchEvent(new CustomEvent('selection:change', { detail: { count: 0 } }));
}

function toggleSelect(el) {
  if (!el) return;
  if (selected.has(el)) {
    el.classList.remove('selected');
    selected.delete(el);
  } else {
    el.classList.add('selected');
    selected.add(el);
  }

  if (selected.size > 0) {
    showActionPanel();
    updatePanelButtons();
  } else {
    hideActionPanel();
  }

  document.dispatchEvent(new CustomEvent('selection:change', {
    detail: {
      count: selected.size,
      canGroup: selected.size >= 2,
      canUngroup: [...selected].some(e => !!e.dataset.groupId)
    }
  }));
}

function newGroupId() {
  return `grp_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
}

function createGroupFromSelection() {
  const items = [...selected];
  const ungrouped = items.filter(el => !el.dataset.groupId);
  if (ungrouped.length < 2) return;

  const gid = newGroupId();
  groups.set(gid, new Set());
  items.forEach(el => {
    el.dataset.groupId = gid;
    groups.get(gid).add(el);
  });
  updatePanelButtons();
}

function ungroupSelection() {
  const items = [...selected];
  const touchedGroups = new Set(items.filter(el => el.dataset.groupId).map(el => el.dataset.groupId));
  items.forEach(el => {
    if (el.dataset.groupId) {
      const gid = el.dataset.groupId;
      const set = groups.get(gid);
      if (set) set.delete(el);
      delete el.dataset.groupId;
    }
  });
  // Remove grupos vazios
  touchedGroups.forEach(gid => {
    const set = groups.get(gid);
    if (set && set.size === 0) groups.delete(gid);
  });
  updatePanelButtons();
}

/**********************
 * Seleção por toque simples
 * - Tocar num .draggable-item: alterna seleção
 * - Tocar na área vazia da dropzone: limpa seleção
 **********************/
const dropzoneEl = document.querySelector('.dropzone');

// Tap leve: usamos pointerdown/up com threshold para não conflitar com drag
let tapInfo = { id: null, x: 0, y: 0, moved: false, target: null, time: 0 };

function onPointerDown(e) {
  if (e.pointerType !== 'touch') return; // multitouch only (ignora mouse)
  const item = e.target.closest('.draggable-item');
  tapInfo = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    moved: false,
    target: item,
    time: performance.now()
  };
}
function onPointerMove(e) {
  if (e.pointerType !== 'touch') return;
  if (tapInfo.id !== e.pointerId) return;
  const dx = Math.abs(e.clientX - tapInfo.x);
  const dy = Math.abs(e.clientY - tapInfo.y);
  if (dx > 8 || dy > 8) tapInfo.moved = true; // arrasto, não é tap
}
function onPointerUp(e) {
  if (e.pointerType !== 'touch') return;
  if (tapInfo.id !== e.pointerId) return;
  const duration = performance.now() - tapInfo.time;
  const isTap = !tapInfo.moved && duration < 400;
  if (isTap) {
    if (tapInfo.target) {
      // Alterna seleção do item tocado
      toggleSelect(tapInfo.target);
    } else {
      // Tap fora de item: limpa seleção
      clearSelection();
    }
  }
  tapInfo = { id: null, x: 0, y: 0, moved: false, target: null, time: 0 };
}

// Delegação na dropzone e no documento (para taps fora)
if (dropzoneEl) {
  dropzoneEl.addEventListener('pointerdown', onPointerDown, { passive: true });
  dropzoneEl.addEventListener('pointermove', onPointerMove, { passive: true });
  dropzoneEl.addEventListener('pointerup',   onPointerUp,   { passive: true });
}
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch') return;
  if (!dropzoneEl) return;
  if (!dropzoneEl.contains(e.target)) {
    // Tap fora da dropzone → limpa seleção
    clearSelection();
  }
}, { passive: true });

/**********************
 * Interact.js — Drag a partir da biblioteca (criando clones)
 **********************/
interact('.library-item').draggable({
  listeners: {
    start(event) {
      const original = event.target;
      const clone = original.cloneNode(true);
      clone.classList.remove('library-item');
      clone.classList.add('draggable-item'); // já nasce como draggable
      clone.style.position = 'absolute';
      clone.style.pointerEvents = 'none';
      clone.style.zIndex = 9999;

      // estado inicial
      // Personagens e objetos têm escala 1.5x, outros itens têm escala 1x
      const scale = (original.classList.contains('personagens') || original.classList.contains('objetos')) ? 1.5 : 1;
      clone.dataset.scale = clone.dataset.scale ?? scale;
      clone.dataset.scaleX = clone.dataset.scaleX ?? 1;
      clone.dataset.x = 0;
      clone.dataset.y = 0;

      document.body.appendChild(clone);
      event.interaction.clonedElement = clone;
    },

    move(event) {
      const clone = event.interaction.clonedElement;
      clone.style.left = (event.pageX - clone.offsetWidth / 2) + 'px';
      clone.style.top  = (event.pageY - clone.offsetHeight / 2) + 'px';
    },

    end(event) {
      const clone = event.interaction.clonedElement;
      const { x, y } = getPointerCoordinates(event);
      const elements = document.elementsFromPoint(x, y);
      const dropzone = elements.find(el => el !== clone && el.classList && el.classList.contains('dropzone'));

      if (dropzone) {
        clone.style.pointerEvents = 'auto';
        clone.style.zIndex = 1002;

        const dzRect = dropzone.getBoundingClientRect();
        const x_rel = x - dzRect.left - (clone.offsetWidth / 2);
        const y_rel = y - dzRect.top  - (clone.offsetHeight / 2);

        clone.dataset.x = x_rel;
        clone.dataset.y = y_rel;

        const scale  = parseFloat(clone.dataset.scale)  || 1;
        const scaleX = parseFloat(clone.dataset.scaleX) || 1;

        clone.style.left = '0px';
        clone.style.top  = '0px';
        clone.style.transform = `translate(${x_rel}px, ${y_rel}px) scale(${scale * scaleX}, ${scale})`;

        // IMPORTANTE: se na tua app os itens entram num wrapper da dropzone, usa dropzone.parentElement
        dropzone.appendChild(clone);

        // Opcional: selecionar automaticamente o novo item
        toggleSelect(clone);
        
        // Atualizar menu de personagens se existir
        if (typeof atualizarMenuPersonagens === 'function') {
          atualizarMenuPersonagens();
        }
        
        // Se é um personagem, abrir o menu de bibliotecas
        if (clone.classList.contains('personagens') && typeof abrirMenuAcessoriosPersonagem === 'function') {
          // Extrair número do personagem da imagem src (p1, p2, etc)
          const srcMatch = clone.src.match(/p(\d+)/);
          if (srcMatch) {
            const numPersonagem = parseInt(srcMatch[1]);
            abrirMenuAcessoriosPersonagem(numPersonagem, clone);
          }
        }
      } else {
        clone.remove();
      }
    }
  }
});

/**********************
 * Interact.js — Drag + Gestos nos itens
 **********************/
interact('.draggable-item')
  .draggable({
    listeners: {
      start(event) {
        // Trazer ao topo o item sob manipulação
        event.target.style.zIndex = 9999;
      },

      move(event) {
        const target = event.target;

        let x = (parseFloat(target.dataset.x) || 0) + event.dx;
        let y = (parseFloat(target.dataset.y) || 0) + event.dy;

        target.dataset.x = x;
        target.dataset.y = y;

        const s  = parseFloat(target.dataset.scale)  || 1;
        const sx = parseFloat(target.dataset.scaleX) || 1;
        target.style.transform = `translate(${x}px, ${y}px) scale(${s * sx}, ${s})`;

        // Se está em grupo, mover os demais com mesmo delta
        if (target.dataset.groupId) {
          const set = groups.get(target.dataset.groupId);
          if (set) {
            set.forEach(el => {
              if (el === target) return;
              let gx = (parseFloat(el.dataset.x) || 0) + event.dx;
              let gy = (parseFloat(el.dataset.y) || 0) + event.dy;
              el.dataset.x = gx;
              el.dataset.y = gy;
              const gs  = parseFloat(el.dataset.scale)  || 1;
              const gsx = parseFloat(el.dataset.scaleX) || 1;
              el.style.transform = `translate(${gx}px, ${gy}px) scale(${gs * gsx}, ${gs})`;
            });
          }
        }

        // Reposiciona painel enquanto move
        if (selected.size > 0) positionActionPanelNearSelection();
      },

      end(event) {
        const target = event.target;
        const { x, y } = getPointerCoordinates(event);

        const elements = document.elementsFromPoint(x, y);
        const deletezone = elements.find(el => el !== target && el.classList && el.classList.contains('deletezone'));
        if (deletezone) {
          // Se remover item que está em grupo: atualiza o grupo
          if (target.dataset.groupId) {
            const gid = target.dataset.groupId;
            const set = groups.get(gid);
            if (set) {
              set.delete(target);
              if (set.size === 0) groups.delete(gid);
            }
          }
          // Atualiza seleção se necessário
          if (selected.has(target)) {
            selected.delete(target);
            target.classList.remove('selected');
            if (selected.size === 0) hideActionPanel();
          }
          target.remove();
          
          // Atualizar menu de personagens se existir
          if (typeof atualizarMenuPersonagens === 'function') {
            atualizarMenuPersonagens();
          }
        }
      }
    }
  })
  .gesturable({
    listeners: {
      start(event) {
        const t = event.target;
        if (!t.dataset.scale)  t.dataset.scale  = 1;
        if (!t.dataset.scaleX) t.dataset.scaleX = 1;
        t.dataset.startScale = t.dataset.scale;

        // Se for escala de grupo, guardamos o "startScale" de cada item
        if (GROUP_SCALE_ENABLED && t.dataset.groupId) {
          const set = groups.get(t.dataset.groupId);
          if (set) {
            set.forEach(el => {
              if (!el.dataset.scale)  el.dataset.scale  = 1;
              if (!el.dataset.scaleX) el.dataset.scaleX = 1;
              el.dataset._startScale = el.dataset.scale;
            });
          }
        }
      },

      move(event) {
        const t = event.target;
        const startScale = parseFloat(t.dataset.startScale || t.dataset._startScale || 1);
        const newScale = startScale * event.scale;

        if (GROUP_SCALE_ENABLED && t.dataset.groupId) {
          // Escala todos do grupo mantendo suas posições (sem reposicionar centro)
          const set = groups.get(t.dataset.groupId);
          if (set) {
            set.forEach(el => {
              const sx = parseFloat(el.dataset.scaleX) || 1;
              const x  = parseFloat(el.dataset.x) || 0;
              const y  = parseFloat(el.dataset.y) || 0;
              const s0 = parseFloat(el.dataset._startScale || el.dataset.scale || 1);
              const sN = s0 * event.scale;
              el.dataset.scale = sN;
              el.style.transform = `translate(${x}px, ${y}px) scale(${sN * sx}, ${sN})`;
            });
          }
        } else {
          // Escala somente o alvo
          t.dataset.scale = newScale;
          const x  = parseFloat(t.dataset.x) || 0;
          const y  = parseFloat(t.dataset.y) || 0;
          const sx = parseFloat(t.dataset.scaleX) || 1;
          t.style.transform = `translate(${x}px, ${y}px) scale(${newScale * sx}, ${newScale})`;
        }

        if (selected.size > 0) positionActionPanelNearSelection();
      }
    }
  });

/**********************
 * Botões do painel — Agrupar / Desagrupar
 **********************/
if (btnGroup) {
  btnGroup.addEventListener('click', (e) => {
    e.preventDefault();
    createGroupFromSelection();
  });
}
if (btnUngroup) {
  btnUngroup.addEventListener('click', (e) => {
    e.preventDefault();
    ungroupSelection();
  });
}

/**********************
 * Multitouch: bloquear scroll ao tocar em itens
 **********************/
document.body.addEventListener('touchmove', (e) => {
  if (e.target.closest('.draggable-item') || e.target.closest('.library-item')) {
    e.preventDefault();
  }
}, { passive: false });

/**********************
 * Estilo de seleção (opcional, caso já tenhas no CSS)
 **********************/
// Adiciona visual se não tiveres uma classe .selected estilizada
(function ensureSelectedStyle() {
  const hasStyle = [...document.styleSheets].some(ss => {
    try {
      return [...ss.cssRules].some(r => r.selectorText === '.selected');
    } catch (_) { return false; }
  });
  if (!hasStyle) {
    const s = document.createElement('style');
    s.textContent = `.selected { outline: 3px solid #2d7ef7; outline-offset: -2px; }`;
    document.head.appendChild(s);
  }
})();
