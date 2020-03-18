// import data from './input.js';

const stateModule = {
  state: {
    vassals: [],
    feodalId: 0,
    previousId: 0
  },

  subscribers: [],

  mutations: {
    openFeodal: (state, id) => {
      state.previousId = state.feodalId;
      state.feodalId = id;
    },
  },

  actions: {
    openFeodal: (context, id) => {
      context.commit('openFeodal', id);
    }
  },

  commit(mutation, payload) {
    this.mutations[mutation](this.state, payload);
    this.subscribers.forEach(subscriber => subscriber(this.state));
  },

  dispatch(action, payload) {
    this.actions[action]({
      state: this.state,
      commit: this.commit.bind(this)
    }, payload);
  },

  subscribe(...callbacks) {
    this.subscribers.push(...callbacks);
  }
};

const feodalContainer = document.querySelector('.feodal-container'),
  vassals = document.querySelector('.vassals');

const logo = document.createElement('img');
logo.alt = 'Logo';
logo.src = '/assets/logo.png';

const logoDefault = logo.cloneNode(false);
logoDefault.classList.add('main__logo-default');

const mainButton = document.createElement('button');
mainButton.append(logo.cloneNode(false));
mainButton.type = 'button';
mainButton.classList.add('logo', 'logo_mini', 'main__nav-btn');
mainButton.addEventListener('click', () => {
  stateModule.dispatch('openFeodal', 0);
});

const previousButton = document.createElement('div');
// previousButton.type = 'button';
previousButton.textContent = 'Back';
previousButton.classList.add('main__previous-button');
previousButton.addEventListener('click', () => {
  stateModule.dispatch('openFeodal', stateModule.state.previousId);
});
const previousButtonContainer = document.createElement('button');
previousButtonContainer.classList.add('main__nav-btn')
previousButtonContainer.append(previousButton);

const timeline = document.createElement('div');
timeline.classList.add('timeline');
timeline.innerHTML = `<img src="/assets/line.svg" alt="">`;

function render(state) {
  feodalContainer.innerHTML = '';
  vassals.innerHTML = '';

  if (state.feodalId === 0) return renderDefault();

  feodalContainer.append(previousButtonContainer);

  // RENDERING FEODALS

  const feodalObj = data.find(person => person.id === state.feodalId);
  const feodalElem = createPersonFeodal(feodalObj);

  feodalContainer.append(feodalElem);
  feodalContainer.append(mainButton);

  // RENDERING VASSALS

  const vassalsArr = data.filter(person => person.parent === state.feodalId),
    vassalsElemArr = [];

  vassalsArr.forEach(person => {
    let personElem = createPersonVassal(person);
    vassalsElemArr.push(personElem);
  });

  vassalsElemArr.forEach(person => vassals.append((person)));
}

function renderDefault() {
  
  feodalContainer.append(logoDefault);

  // RENDERING VASSALS
  const vassalsArr = data.filter(person => !person.parent);
  vassalsArr.forEach(personObj => {
    let personElem = createPersonVassal(personObj);
    vassals.append(personElem);
  });
}

function createPerson({
  name,
  image,
  id,
  post = false,
  parent = false
}) {
  let person = document.createElement('div');
  person.classList.add('person');

  person.innerHTML =
    `<div class='person__img-container'>
      <img class='person__img' src='img/${image}' alt='${name}'></img>
    </div> 

    <h2 class='person__title'>${name}</h2>`;

  // Vassals counter
  let numberOfVassals = countVassals(id);
  
  // Make counter only if parent exist – states haven't counter
  if (numberOfVassals && parent) {
    const countVassalsElem = document.createElement('div');
    countVassalsElem.classList.add('person__vassals-counter-container');
    countVassalsElem.innerHTML = `<div class='person__vassals-counter'>${numberOfVassals}</div>`;

    person.querySelector('.person__img-container').append(countVassalsElem);
  }

  person.dataset.vassals = numberOfVassals;

  if (post) {
    let postElem = document.createElement('h2');
    postElem.innerText = post;
    postElem.classList.add('person__post');
    person.append(postElem);
  }

  return person;
}

function countVassals(id) {
  let counter = 0;

  // Recursive travelsal
  data.forEach(person => {
    if (person.parent === id) {
      counter += countVassals(person.id) + 1;
    }
  });

  return counter;
}

function createPersonFeodal(personObj) {
  const feodalElem = createPerson(personObj);
  feodalElem.classList.add('person_size_m');
  feodalElem.querySelector('.person__img-container').append(...createArrows(personObj));
  return feodalElem;
}

function createPersonVassal(personObj) {
  const {id} = personObj;
  const vassalElem = createPerson(personObj);
  vassalElem.classList.add('vassals__vassal', 'person_size_s');

  // if (vassalElem.dataset.vassals > 0) {
    vassalElem.style.cursor = 'pointer';

    vassalElem.addEventListener('click', () => {
      stateModule.dispatch('openFeodal', id);
    });

  // }

  return vassalElem;
}

function createArrows({
  id,
  parent
}) {
  const back = document.createElement('div');
  back.classList.add('arrow-button', 'arrow-button_back');

  const forward = document.createElement('div');
  forward.className = 'arrow-button arrow-button_forward';

  // Persons with such parent for navigation
  let vassalsSingleLevel = data.filter(person => person.parent === parent);

  let index = vassalsSingleLevel.findIndex(item => item.id === id);

  // Back and forward persons with such parent
  let backId = (index === 0) ? vassalsSingleLevel[vassalsSingleLevel.length - 1].id : vassalsSingleLevel[index - 1].id;
  let forwardId = (index === vassalsSingleLevel.length - 1) ? vassalsSingleLevel[0].id : vassalsSingleLevel[index + 1].id;

  // For avoid "back" button looping
  if (backId === id) return [back, forward];

  back.addEventListener('click', (event) => {
    event.stopPropagation();
    stateModule.dispatch('openFeodal', backId);
  });
  forward.addEventListener('click', (event) => {
    event.stopPropagation();
    stateModule.dispatch('openFeodal', forwardId);
  });

  return [back, forward];
}

function toggleTimeline (state) {
  if (state.previousId === 0 || state.feodalId === 0) {
    document.querySelector('.main').classList.toggle('default');
  }
}

stateModule.subscribe(render, toggleTimeline);

stateModule.dispatch('openFeodal', 0);