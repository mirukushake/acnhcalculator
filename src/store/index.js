import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';

Vue.use(Vuex);

const vuexLocal = new VuexPersist({
  storage: window.localStorage,
});

export default new Vuex.Store({
  state: {
    selectedRecipes: [],
    basicMats: [],
    preCrafts: [],
    prePreCrafts: [],
    calculated: false,
  },
  mutations: {
    setAllClear(state) {
      state.selectedRecipes = [];
      state.basicMats = [];
      state.preCrafts = [];
      state.prePreCrafts = [];
    },
    setCraftClear(state) {
      state.basicMats = [];
      state.preCrafts = [];
      state.prePreCrafts = [];
    },
    setNewRecipe(state, payload) {
      const index = state.selectedRecipes.findIndex((e) => e.name === payload.name);
      if (index === -1) {
        state.selectedRecipes.push(payload);
      } else {
        state.selectedRecipes[index].qty += 1;
      }
    },
    setRemoveRecipe(state, payload) {
      if (payload > -1) {
        state.selectedRecipes.splice(payload, 1);
      }
    },
    setCalculated(state, payload) {
      state.calculated = payload;
    },
    setBasicMats(state, payload) {
      state.basicMats = payload;
    },
    setPreCrafts(state, payload) {
      state.preCrafts = payload;
    },
    setPrePreCrafts(state, payload) {
      state.prePreCrafts = payload;
    },
  },
  actions: {
    clearAll(context) {
      context.commit('setAllClear');
    },
    clearCrafts(context) {
      context.commit('setCraftClear');
    },
    addRecipe(context, payload) {
      context.commit('setNewRecipe', payload);
    },
    removeRecipe(context, payload) {
      context.commit('setRemoveRecipe', payload);
    },
    changeCalculated(context, payload) {
      context.commit('setCalculated', payload);
    },
    changeBasicMats(context, payload) {
      context.commit('setBasicMats', payload);
    },
    changePreCrafts(context, payload) {
      context.commit('setPreCrafts', payload);
    },
    changePrePreCrafts(context, payload) {
      context.commit('setPreCrafts', payload);
    },
  },
  plugins: [vuexLocal.plugin],
  modules: {
  },
});
