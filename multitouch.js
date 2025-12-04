interact('.library-item').draggable({
    listeners: {
        start(event) {
            const original = event.target;

            //cria um clone para drag
            const clone = original.cloneNode(true);
            clone.classList.remove('library-item');
            clone.classList.add('drag-clone');
            clone.style.position = 'absolute';
            clone.style.pointerEvents = 'none';
            clone.style.zIndex = 9999;

            document.body.appendChild(clone);
            event.interaction.clonedElement = clone;
        },

        move(event) {
            const clone = event.interaction.clonedElement;
            clone.style.left = (event.pageX - clone.width / 2) + 'px';
            clone.style.top = (event.pageY - clone.height / 2) + 'px';
        },

        end(event) {
            const clone = event.interaction.clonedElement;
            const dropzone = document.elementFromPoint(event.pageX, event.pageY);

            if (dropzone) {
                clone.classList.remove('drag-clone');
                clone.classList.add('draggable-item');
                clone.style.pointerEvents = 'auto';
                clone.dataset.x = 0;
                clone.dataset.y = 0;

                document.body.appendChild(clone);
            } else {
                clone.remove();
            }
        }
    }
});

//faz os clones serem arrastáveis
interact('.draggable-item').draggable({
    listeners: {
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.dataset.x) || 0) + event.dx;
            const y = (parseFloat(target.dataset.y) || 0) + event.dy;

            target.dataset.x = x;
            target.dataset.y = y;

            target.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
});

//scale com multitouch
interact('.draggable-item').gesturable({
    listeners: {
        start(event) {
            const target = event.target;
            if (!target.dataset.scale) target.dataset.scale = 1;
            target.dataset.startScale = target.dataset.scale;
        },
        move(event) {
            const target = event.target;
            const startScale = parseFloat(target.dataset.startScale);
            const newScale = startScale * event.scale;

            target.dataset.scale = newScale;
            const x = parseFloat(target.dataset.x) || 0;
            const y = parseFloat(target.dataset.y) || 0;

            target.style.transform = `translate(${x}px, ${y}px) scale(${newScale})`;
        }
    }
});

//impede scroll ao arrastar os clones
document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('.draggable-item') || e.target.closest('.library-item')) {
        e.preventDefault();
    }
}, { passive: false });
