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

            // get good coordinates (clientX preferred; fall back to pageX or touches)
            const x = (typeof event.clientX === 'number') ? event.clientX
                    : (typeof event.pageX === 'number') ? event.pageX
                    : (event.touches && event.touches[0] && event.touches[0].clientX) || 0;
            const y = (typeof event.clientY === 'number') ? event.clientY
                    : (typeof event.pageY === 'number') ? event.pageY
                    : (event.touches && event.touches[0] && event.touches[0].clientY) || 0;

            // get all elements under that point (topmost first)
            const elems = document.elementsFromPoint(x, y);

            const dropzone = elems.find(el => el !== clone && el.classList && el.classList.contains('dropzone'));

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
        },

        end(event) {
            const target = event.target;

            const x = (typeof event.clientX === 'number') ? event.clientX
                    : (typeof event.pageX === 'number') ? event.pageX
                    : (event.touches && event.touches[0] && event.touches[0].clientX) || 0;
            const y = (typeof event.clientY === 'number') ? event.clientY
                    : (typeof event.pageY === 'number') ? event.pageY
                    : (event.touches && event.touches[0] && event.touches[0].clientY) || 0;

            // get all elements under the pointer
            const elems = document.elementsFromPoint(x, y);

            // If the dragged element is topmost it will be first in elems — so find deletezone ignoring the dragged element
            const deletezone = elems.find(el => el !== target && el.classList && el.classList.contains('deletezone'));

            if (deletezone) {
                target.remove();
                return;
            }
        }

    }
});

//scale com multitouch
// interact('.draggable-item').gesturable({
//     listeners: {
//         start(event) {
//             const target = event.target;
//             if (!target.dataset.scale) target.dataset.scale = 1;
//             target.dataset.startScale = target.dataset.scale;
//         },
//         move(event) {
//             const target = event.target;
//             const startScale = parseFloat(target.dataset.startScale);
//             const newScale = startScale * event.scale;

//             target.dataset.scale = newScale;
//             const x = parseFloat(target.dataset.x) || 0;
//             const y = parseFloat(target.dataset.y) || 0;

//             target.style.transform = `translate(${x}px, ${y}px) scale(${newScale})`;
//         }
//     }
// });

//impede scroll ao arrastar os clones
document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('.draggable-item') || e.target.closest('.library-item')) {
        e.preventDefault();
    }
}, { passive: false });
