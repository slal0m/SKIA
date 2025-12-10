//Helper function to get the current pointer coordinates (client/page/touch)
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

//DRAG FROM LIBRARY (Creating Clones)
interact('.library-item').draggable({
    listeners: {
        start(event) {
            const original = event.target;

            //Creates a clone for dragging
            const clone = original.cloneNode(true);
            clone.classList.remove('library-item');
            clone.classList.add('drag-clone'); 
            clone.style.position = 'absolute';
            clone.style.pointerEvents = 'none';
            clone.style.zIndex = 9999;

            document.body.appendChild(clone);
            event.interaction.clonedElement = clone;

            //Initialize scale state for the clone
            if (!clone.dataset.scale) clone.dataset.scale = 1; 
        },

        move(event) {
            const clone = event.interaction.clonedElement;
            //Uses pageX/Y to track the pointer position globally
            clone.style.left = (event.pageX - clone.offsetWidth / 2) + 'px';
            clone.style.top = (event.pageY - clone.offsetHeight / 2) + 'px';
        },

        end(event) {
            const clone = event.interaction.clonedElement;
            const { x, y } = getPointerCoordinates(event);

            const elements = document.elementsFromPoint(x, y);
            const dropzone = elements.find(el => el !== clone && el.classList.contains('dropzone'));

            if (dropzone) {
                clone.classList.remove('drag-clone');
                clone.classList.add('draggable-item');
                clone.style.pointerEvents = 'auto';
                clone.style.zIndex = 1002;

                //Get dropzone's bounding rectangle to calculate relative drop position
                const dropzoneRect = dropzone.getBoundingClientRect();
                
                //Calculate the position of the dropped item relative to the dropzone container
                const x_rel = x - dropzoneRect.left - (clone.offsetWidth / 2);
                const y_rel = y - dropzoneRect.top - (clone.offsetHeight / 2);

                //Set data attributes for translation state
                clone.dataset.x = x_rel;
                clone.dataset.y = y_rel;

                //Configure absolute positioning within the dropzone container
                clone.style.position = 'absolute'; 
                clone.style.left = '0px';
                clone.style.top = '0px';
                
                //Apply the initial relative translation and scale
                const scale = parseFloat(clone.dataset.scale);
                clone.style.transform = `translate(${x_rel}px, ${y_rel}px) scale(${scale})`;

                //Append the clone to the dropzone's parent (e.g., .inner-palco-top)
                dropzone.parentElement.appendChild(clone);
            } else {
                clone.remove();
            }
        }
    }
});

//Combines draggable and gesturable into one interact call
interact('.draggable-item')
    .draggable({
        listeners: {
            start(event) {
                event.target.style.zIndex = 9999;
            },

            move(event) {
                const target = event.target;
                let x = (parseFloat(target.dataset.x) || 0) + event.dx;
                let y = (parseFloat(target.dataset.y) || 0) + event.dy;
                const currentScale = parseFloat(target.dataset.scale) || 1;

                target.dataset.x = x;
                target.dataset.y = y;

                //Apply translate and preserve scale
                target.style.transform = `translate(${x}px, ${y}px) scale(${currentScale})`;
            },

            end(event) {
                const target = event.target;
                const { x, y } = getPointerCoordinates(event);

                const elements = document.elementsFromPoint(x, y);
                const deletezone = elements.find(el => el !== target && el.classList.contains('deletezone'));

                if (deletezone) {
                    target.remove();
                }
            }
        }
    })
    .gesturable({
        listeners: {
            start(event) {
                const target = event.target;
                //Ensures scale data attribute exists
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

                //Apply translate and the new scale
                target.style.transform = `translate(${x}px, ${y}px) scale(${newScale})`;
            }
        }
    });

//GLOBAL TOUCH GESTURE LOCK
//Prevents default browser actions (like scrolling) when interacting with draggable items
document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('.draggable-item') || e.target.closest('.library-item')) {
        e.preventDefault();
    }
}, { passive: false });