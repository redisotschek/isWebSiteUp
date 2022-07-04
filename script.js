let inputGroupCounter = 1;
const container = document.getElementById('container');
const addInputButton = document.getElementById('add-input-group');
const intervalsArray = [];

document.getElementById('add-input-group').addEventListener('click', () => {
    getInputGroup();
});

function createElement(type, id, classes, innerHTML) {
    const element = document.createElement(type);
    element.setAttribute('type', 'button');
    element.setAttribute('class', classes);
    if (id) {
        element.setAttribute('id', id);
    }
    element.innerHTML = innerHTML;

    return element;
}

function getDoneButton(id) {
    return createElement('span', `done-button${id}`, 'input-group-text', '<i class="bi bi-check-all"></i>');
}

function getRepeatButton(id) {
    const repeatButton = createElement('button', `repeat-button${id}`, 'btn', '<i class="bi bi-arrow-repeat"></i>');
    repeatButton.addEventListener('click', () => {
        repeatRequest(id);
    });
    return repeatButton;
}

function repeatRequest(id) {
    console.log(id)
}

function addListener(id) {
    document.getElementById(`input-group${id}`).setAttribute('disabled', true);
    addInputButton.classList.remove('d-none');
    const url = document.getElementById('url-input'+id).value;
    const http = new XMLHttpRequest();
    changeListenerStatus(id, 'waiting');
    const interval = setInterval(() => {
        http.onreadystatechange = function() {
            if (this.readyState == this.DONE) {
                if (this.status === 200) {
                    changeListenerStatus(id, 'success', url);
                    clearInterval(interval);
                }
            }
        };
        try {
            http.open('HEAD', url);
            http.send();
        } catch(e) {}
    }, 1000);
    intervalsArray.push(interval);
}

function getLoader(id) {
    const innerHTML =  
                        `<div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>`
    const loader = createElement('span', `loader${id}`, 'input-group-text', innerHTML);
    return loader;
}

function getCloseButton(id) {
    const closeButton = createElement('button', `remove-button${id}`, 'btn', 'Remove');
    closeButton.addEventListener('click', () => {
        removeInputGroup(id);
    });
    return closeButton;
}

function removeInputGroup(id) {
    removeElement(`input-group${id}`);
    const interval = intervalsArray.find((e) => e === id);
    clearInterval(interval);
}

function removeElement(elementId) {
    const el = document.getElementById(elementId);
    el.remove();
}

function getInputGroup() {
    const id = inputGroupCounter++;
    const innerHTML = `<input type="text" class="form-control" value="https://getbootstrap.com/docs/4.0/utilities/display/" placeholder="Host name" id="url-input${id}" aria-label="Host name" aria-describedby="add-listener-button${id}">`;
    const button = createElement('button', `add-listener-button${id}`, 'btn btn-success add-listener-button', 'Add');
    button.addEventListener('click', () => {
        addListener(id);
    });
    const element = createElement('div', `input-group${id}`, 'input-group mb-3', innerHTML);
    element.append(button);
    container.append(element);
}

function createNotification(options, callback) {
    chrome.notifications.create(
        null, 
        options,
        function callback() {
            if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            } else {
            // Tab exists
            }
        }
      )
}

function changeListenerStatus(id, status, url) {
    const input = document.getElementById(`input-group${id}`);
    if (status === 'waiting') {
        removeElement(`add-listener-button${id}`);
        input.prepend(getLoader(id));
        input.append(getCloseButton(id));
    } else if (status === 'success') {
        removeElement(`loader${id}`);
        input.prepend(getDoneButton(id));

        const notificationOptions = {
            type: "basic",
            iconUrl: "uptime.png",
            title: 'Requested web-site is back online!',
            message: `${url} is now back online`
        }

        chrome.storage.sync.set({notificationOptions});

        createNotification(notificationOptions)

    }
}

function init() {
    getInputGroup();
}

init();
