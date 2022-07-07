let inputGroupCounter = 1;
const container = document.getElementById('container');
const addInputButton = document.getElementById('add-input-group');
const intervalsArray = [];
const INTERVAL = 30000;

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

function getStatusButton(id, status) {
    const icons = {
        'failed': 'bi-cloud-minus',
        'success': 'bi-check-all'
    }
    return createElement('span', `done-button${id}`, 'input-group-text', `<i class="bi ${icons[status]}"></i>`);
}

function getRepeatButton(id) {
    const repeatButton = createElement('button', `repeat-button${id}`, 'btn', '<i class="bi bi-arrow-repeat"></i>');
    repeatButton.addEventListener('click', () => {
        repeatRequest(id);
    });
    return repeatButton;
}

function repeatRequest(id) {
    console.log(id);
}

function checkResource(url) {
    return fetch(url, {method: 'GET'}).then(r => r)
    .catch(e => e);
}

function addListener(id) {
    document.getElementById(`input-group${id}`).setAttribute('disabled', true);
    addInputButton.classList.remove('d-none');
    const url = document.getElementById('url-input'+id).value;
    if (!url) return;
    changeListenerStatus(id, 'waiting');
    const interval = setInterval(async () => {
        try {
            const response = await checkResource(url);
            if (response.status === 200) {
                if (!response.ok) {
                    changeListenerStatus(id, 'failed', url, interval);
                } else {
                    changeListenerStatus(id, 'success', url, interval);
                }
            }
        }
        catch(e) {
            if (e) {
                changeListenerStatus(id, 'failed', url, interval);
            }
        }
    }, INTERVAL);
    intervalsArray.push(interval);
}

function getLoader(id) {
    const innerHTML =  
                        `<div class="spinner-border spinner-border-sm" role="status">
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
    const innerHTML = `<input type="text" class="form-control" placeholder="Host name" id="url-input${id}" aria-label="Host name" aria-describedby="add-listener-button${id}">`;
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

function changeListenerStatus(id, status, url, interval) {
    const input = document.getElementById(`input-group${id}`);
    const responses = {
        failed: {
            title: "Can't get acces to resource because of CORS",
            message: `${url} is uncheckable`
        },
        success: {
            title: 'Requested web-site is back online!',
            message: `${url} is now back online`
        }
    }
    if (status === 'waiting') {
        removeElement(`add-listener-button${id}`);
        input.prepend(getLoader(id));
        input.append(getCloseButton(id));
    } else {
        clearInterval(interval);
        removeElement(`loader${id}`);
        input.prepend(getStatusButton(id, status));

        const basicNotificationOptions = {
            type: "basic",
            iconUrl: "uptime.png",
        }

        createNotification({...basicNotificationOptions, ...responses[status]})
    }
}

function init() {
    getInputGroup();
}

init();
