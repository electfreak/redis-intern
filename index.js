// import data from './input.js';

const stateModule = {
  state: {
    vassals: [],
    feodalId: 1,
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

  subscribe(callback) {
    this.subscribers.push(callback);
  }
};

const feodalContainer = document.querySelector('.main__feodal'),
  vassals = document.querySelector('.main__vassals');

const mainButton = document.createElement('button');
mainButton.innerHTML = `<img src='/assets/logo.png'></img>`;
mainButton.type = 'button';
mainButton.classList.add('logo', 'logo_mini', 'main__nav-btn');
mainButton.addEventListener('click', () => {
  stateModule.dispatch('openFeodal', 1);
});

const previousButton = document.createElement('button');
previousButton.type = 'button';
previousButton.textContent = 'Back';
previousButton.classList.add('main__previous-button');
previousButton.addEventListener('click', () => {
  stateModule.dispatch('openFeodal', stateModule.state.previousId);
});
const previousButtonContainer = document.createElement('div');
previousButtonContainer.classList.add('main__nav-btn')
previousButtonContainer.append(previousButton);

function render(state) {
  feodalContainer.innerHTML = '';
  vassals.innerHTML = '';

  feodalContainer.append(previousButtonContainer);

  // FEODAL'S RENDER

  const feodalObj = data.find(person => person.id === state.feodalId);
  const feodalElem = createPersonFeodal(feodalObj);
  feodalElem.classList.add('person_feodal');

  feodalContainer.append(feodalElem);
  feodalContainer.append(mainButton);

  // VASSAL'S RENDER 

  const vassalsArr = data.filter(person => person.parent === state.feodalId),
    vassalsElemArr = [];

  vassalsArr.forEach(person => {
    let personElem = createPersonVassal(person);
    vassalsElemArr.push(personElem);
  });

  vassalsElemArr.forEach(person => vassals.append((person)));
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

  // Vassal's counter
  let numberOfVassals;
  if (parent) numberOfVassals = countVassals(id);

  if (numberOfVassals) {
    const countVassalsElem = document.createElement('div');
    countVassalsElem.classList.add('person__vassals-counter-container');
    countVassalsElem.innerHTML = `<div class='person__vassals-counter'>${numberOfVassals}</div>`;

    person.querySelector('.person__img-container').append(countVassalsElem);
  }

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
  feodalElem.classList.add('person_feodal');
  feodalElem.querySelector('.person__img-container').append(...createArrows(personObj));
  return feodalElem;
}

function createPersonVassal(personObj) {
  const vassalElem = createPerson(personObj);
  vassalElem.classList.add('person_vassal')
  const countVassals = vassalElem.querySelector('.person__vassals-counter'),
    {
      id
    } = personObj;
  if (countVassals) {
    vassalElem.style.cursor = 'pointer';

    vassalElem.addEventListener('click', () => {
      stateModule.dispatch('openFeodal', id);
    });

  }

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

  let vassalsSingleLevel = data.filter(person => person.parent === parent);

  let index = vassalsSingleLevel.findIndex(item => item.id === id);

  let backId = (index === 0) ? vassalsSingleLevel[vassalsSingleLevel.length - 1].id : vassalsSingleLevel[index - 1].id;
  let forwardId = (index === vassalsSingleLevel.length - 1) ? vassalsSingleLevel[0].id : vassalsSingleLevel[index + 1].id;

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

stateModule.subscribe(render);

stateModule.dispatch('openFeodal', 1);