import { orders } from './data.js';

const dropzones = document.querySelectorAll('.dropzone');
const newZone = document.querySelector("[data-zone='новый']");
const readyZone = document.querySelector("[data-zone='заготовка']");
const finishedZone = document.querySelector("[data-zone='готов']");
const onthewayZone = document.querySelector("[data-zone='впути']");


orders.forEach((order) => {
  const draggable = document.createElement('div');
  draggable.setAttribute('data-id', `order${order.id}`);
  draggable.className = 'draggable';
  draggable.setAttribute('draggable', 'true');

  draggable.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', draggable.dataset.id);
  });

  const productsHTML = order.orders.map(product => `<p>${product}</p>`).join('');
  draggable.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:2px solid #e0e0e0;">
        <span>ID: ${order.id}</span>
        <span>${order.price} сум</span>
    </div>
    <div style="padding:10px">${productsHTML}</div>
    <span style="display:block; text-align:right">${order.time}</span>
    <div class="btns">
        <button class="cancel">Отменить</button>
        <button class="accept">Принять</button>
    </div>
  `;

  const btnCancel = draggable.querySelector('.cancel');
  const btnAccept = draggable.querySelector('.accept');
  const btns = draggable.querySelector('.btns');

  btnCancel?.addEventListener('click', (e) => {
    e.preventDefault();
    draggable.style.display = 'none';
  });

  btnAccept?.addEventListener('click', (e) => {
    e.preventDefault();
    readyZone.appendChild(draggable);
    updatePositionInLocalStorage(order.id, 'заготовка');
    btns.innerHTML = `<button class="ready">Готово</button>`;
    addReadyHandler();
  });

  function addReadyHandler() {
    const ready = draggable.querySelector('.ready');
    ready?.addEventListener('click', (e) => {
      e.preventDefault();
      finishedZone.appendChild(draggable);
      updatePositionInLocalStorage(order.id, 'готов');
      btns.innerHTML = `<button class="finish">Завершить</button>`;
      addFinishHandler();
    });
  }

  function addFinishHandler() {
    const finish = draggable.querySelector('.finish');
    finish?.addEventListener('click', (e) => {
      e.preventDefault();
      onthewayZone.appendChild(draggable);
      updatePositionInLocalStorage(order.id, 'впути');
      btns.innerHTML = '';
    });
  }

  function updatePositionInLocalStorage(orderId, zone) {
    const positions = JSON.parse(localStorage.getItem('positions')) || {};
    positions[`order${orderId}`] = zone;
    localStorage.setItem('positions', JSON.stringify(positions));
  }

  const positions = JSON.parse(localStorage.getItem('positions')) || {};
  const currentZoneName = positions[`order${order.id}`] || 'новый';
  const zoneToInsert = document.querySelector(`[data-zone='${currentZoneName}']`);
  zoneToInsert.appendChild(draggable);

  btns.innerHTML = '';

  if (currentZoneName === 'новый') {
    btns.innerHTML = `
      <button class='cancel'>Отменить</button>
      <button class='accept'>Принять</button>
    `;
    btns.querySelector('.cancel')?.addEventListener('click', (e) => {
      e.preventDefault();
      draggable.style.display = 'none';
    });
    btns.querySelector('.accept')?.addEventListener('click', (e) => {
      e.preventDefault();
      readyZone.appendChild(draggable);
      const positions = JSON.parse(localStorage.getItem('positions')) || {};
      positions[`order${order.id}`] = 'заготовка';
      localStorage.setItem('positions', JSON.stringify(positions));
      btns.innerHTML = `<button class='ready'>Готово</button>`;
      addReadyHandler();
    });

  } else if (currentZoneName === 'заготовка') {
    btns.innerHTML = `<button class='ready'>Готово</button>`;
    addReadyHandler();

  } else if (currentZoneName === 'готов') {
    btns.innerHTML = `<button class='finish'>Завершить</button>`;
    addFinishHandler();

  } else if (currentZoneName === 'впути') {
    btns.innerHTML = '';
  }
});

dropzones.forEach((zone) => {
  zone.addEventListener('dragover', (e) => e.preventDefault());
  
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedEl = document.querySelector(`[data-id='${draggedId}']`);
    zone.appendChild(draggedEl);

    const savedPositions = JSON.parse(localStorage.getItem('positions')) || {};
    const currentZone = zone.dataset.zone;
    savedPositions[draggedId] = currentZone;
    localStorage.setItem('positions', JSON.stringify(savedPositions));

    updateButtonsBasedOnZone(draggedEl, currentZone);
  });
});

function updateButtonsBasedOnZone(draggedEl, currentZone) {
  const btns = draggedEl.querySelector('.btns');
  if (!btns) return;

  btns.innerHTML = '';

  if (currentZone === 'новый') {
    btns.innerHTML = `
      <button class="cancel">Отменить</button>
      <button class="accept">Принять</button>
    `;
    setupCancelAndAcceptHandlers(draggedEl);
  } else if (currentZone === 'заготовка') {
    btns.innerHTML = `<button class="ready">Готово</button>`;
    addReadyHandler(draggedEl);
  } else if (currentZone === 'готов') {
    btns.innerHTML = `<button class="finish">Завершить</button>`;
    addFinishHandler(draggedEl);
  } else if (currentZone === 'впути') {
    btns.innerHTML = '';
  }
}

function setupCancelAndAcceptHandlers(draggedEl) {
  draggedEl.querySelector('.cancel')?.addEventListener('click', (e) => {
    e.preventDefault();
    draggedEl.style.display = 'none';
  });

  draggedEl.querySelector('.accept')?.addEventListener('click', (e) => {
    e.preventDefault();
    readyZone.appendChild(draggedEl);
    const savedPositions = JSON.parse(localStorage.getItem('positions')) || {};
    savedPositions[draggedEl.dataset.id] = 'заготовка';
    localStorage.setItem('positions', JSON.stringify(savedPositions));
    updateButtonsBasedOnZone(draggedEl, 'заготовка');
  });
}

function addReadyHandler(draggedEl) {
  const ready = draggedEl.querySelector('.ready');
  ready?.addEventListener('click', (e) => {
    e.preventDefault();
    finishedZone.appendChild(draggedEl);
    const savedPositions = JSON.parse(localStorage.getItem('positions')) || {};
    savedPositions[draggedEl.dataset.id] = 'готов';
    localStorage.setItem('positions', JSON.stringify(savedPositions));
    updateButtonsBasedOnZone(draggedEl, 'готов');
  });
}

function addFinishHandler(draggedEl) {
  const finish = draggedEl.querySelector('.finish');
  finish?.addEventListener('click', (e) => {
    e.preventDefault();
    onthewayZone.appendChild(draggedEl);
    const savedPositions = JSON.parse(localStorage.getItem('positions')) || {};
    savedPositions[draggedEl.dataset.id] = 'впути';
    localStorage.setItem('positions', JSON.stringify(savedPositions));
    updateButtonsBasedOnZone(draggedEl, 'впути');
  });
}

const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  document.querySelectorAll('.draggable').forEach((card) => {
    const idText = card.dataset.id.toLowerCase();

    if (idText.includes(query)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
});
