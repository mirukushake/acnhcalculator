<template>
  <div id="app">
    <Row type="flex" justify="center">
      <Col :xs="22" :lg="12">
        <h2 style="text-align: center;">ACNH DIY Calculator</h2>
      </Col>
    </Row>
    <Row type="flex" justify="center">
      <Col :xs="22" :lg="12">
        <Card dis-hover shadow>
                <p slot="title">Recipe list</p>
                <div
                v-for="(recipe, index) in selectedRecipes"
                :key="recipe.name"
                style="margin-bottom: 5px; padding: 5px 0px;">
                  <Row type="flex" justify="start" align="middle">
                    <Col span="4">
                    <InputNumber :min="1" v-model="recipe.qty" size="small"></InputNumber>
                    </Col>
                    <Col span="3">
                    <img :src="recipe.image_url" width="50px" height="50px"/>
                    </Col>
                    <Col span="15" justify="start">
                    <strong>{{ recipe.name }}</strong>
                    </Col>

                    <Col span="2">
                    <Button size="small" @click="removeRecipe(index)">-</Button>
                    </Col>
                  </Row>


                </div>
                <div style="margin-top: 10px; text-align: center;">
                <Button @click="recipeModal = !recipeModal">Add an item</Button>&nbsp;
                <Button
                :disabled="clearDisabled"
                @click="clearRecipes">Clear</Button></div>
            </Card>
      </Col>
    </Row>
    <Row type="flex" justify="center">
      <Col :xs="20" :lg="10">
      <Button
      @click="calculateMats"
      long
      :loading="calculateLoading"
      :disabled="calculatedDisabled"
      type="primary"
      style="margin: 10px;">Calculate!</Button>
      </Col>
    </Row>
    <Row type="flex" justify="center" v-if="basicMats.length > 0">
      <Col :xs="22" :lg="12">
        <Card dis-hover shadow>
                <p slot="title">Materials needed</p>
                <Row
                v-for="(mat, i) in basicMats"
                :key="i"
                type="flex"
                style="margin-bottom: 20px;"
                justify="start" align="middle">
                  <Col span="1">
                    <div>
                      <strong>{{ mat.qty }}</strong>
                      </div>
                  </Col>
                  <Col span="2"
                  >
                    <img :src="mat.image_url"
                    width="50px"
                    height="50px"

                     />
                  </Col>
                  <Col span="20" style="padding-left: 10px;">
                  {{ mat.name }}
                  </Col>
                </Row>
            </Card>
      </Col>
    </Row>
    <Row type="flex" justify="center" v-if="preCrafts.length > 0">
      <Col :xs="22" :lg="12">
        <Card dis-hover shadow>
                <p slot="title">Pre-requisite crafts</p>
                <div v-if="prePreCrafts.length > 0">
                <Divider>Tier 1 crafts</Divider>
                <Row v-for="(mat, i) in prePreCrafts"
                type="flex"
                :key="i"
                justify="start" align="middle">
                  <Col span="1">
                    <strong>{{ mat.qty }}</strong>
                  </Col>
                  <Col span="2">
                    <img :src="mat.image_url" width="50px" height="50px"/>
                  </Col>
                  <Col span="20"  style="padding-left: 10px;">
                    {{ mat.name }}
                  </Col>
                </Row>
                </div>
                <Divider v-if="prePreCrafts.length > 0">Tier 2 crafts</Divider>
                <Row v-for="(mat, i) in preCrafts"
                type="flex"
                :key="i"
                justify="start" align="middle">
                  <Col span="1">
                    <strong>{{ mat.qty }}</strong>
                  </Col>
                  <Col span="2">
                    <img :src="mat.image_url" width="50px" height="50px"/>
                  </Col>
                  <Col span="20"  style="padding-left: 10px;">
                    {{ mat.name }}
                  </Col>
                </Row>
            </Card>
      </Col>
    </Row>
    <Modal
        v-model="recipeModal"
        title="Add recipes"
        scrollable
        footer-hide
        width="800">
        <Row>
          <Col>
            <Input prefix="ios-search" v-model="filter" placeholder="Filter items" clearable />
          </Col>
        </Row>
        <Row type="flex" justify="start">
        <Col v-for="recipe in paginatedData" span="6" :key="recipe.name">
        <template v-if="paginatedData.length > 0 || paginatedData !== undefined">
          <Card style="margin: 10px; min-height: 200px;">
            <div style="text-align:center">
              <img :src="recipe.image_url" width="100px" height="100px"/>
              <div style="font-size: 8px">{{ recipe.image_url }}</div>
              {{ recipe.name }}
              <div>
                <Button
                :disabled="selectedRecipes
                .find(e => e.name === recipe.name) ? true : false"
                  @click="addRecipe(recipe)">
                  <Icon :type="selectedRecipes
                .find(e => e.name === recipe.name) ? 'md-checkmark' : 'md-add'">
                </Icon>
                  </Button>
              </div>
            </div>
          </Card>
          </template>
          <template v-else>
            <div>No results found.</div>
          </template>
        </Col>
    </Row>
    <Row type="flex" justify="center">
          <Col>
          <Page :total="total"
          :current="page"
          :page-size="pageSize"
          @on-change="changePage"
          small></Page>
          </Col>
        </Row>
    </Modal>
    <BackTop></BackTop>
  </div>
</template>

<script>
import {
  flatten, map, groupBy, sumBy, orderBy,
} from 'lodash';
import recipes from './assets/recipesimages.json';

export default {
  name: 'app',
  // components: {
  //   HelloWorld,
  // },
  data() {
    return {
      recipeList: recipes.map((item) => ({ qty: 1, ...item })),
      filter: '',
      recipeModal: false,
      page: 1,
      pageSize: 16,
      testing: [],
      calculateLoading: false,
    };
  },
  computed: {
    selectedRecipes() {
      return this.$store.state.selectedRecipes;
    },
    calculated() {
      return this.$store.state.calculated;
    },
    preCrafts() {
      return this.$store.state.preCrafts;
    },
    prePreCrafts() {
      return this.$store.state.prePreCrafts;
    },
    basicMats() {
      return this.$store.state.basicMats;
    },
    clearDisabled() {
      if (this.selectedRecipes.length < 1) {
        return true;
      }
      return false;
    },
    calculatedDisabled() {
      if (this.calculated === true || this.selectedRecipes.length === 0) {
        return true;
      }
      return false;
    },
    newData() {
      const data = orderBy(this.recipeList
        .filter((recipe) => recipe.name.toLowerCase().includes(this.filter.toLowerCase())), [(name) => name.name.toLowerCase()], ['asc']);

      return data;
    },
    paginatedData() {
      return this.newData.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    },
    total() {
      return this.newData.length;
    },
  },
  watch: {
    selectedRecipes: {
      deep: true,
      async handler() {
        if (this.calculated === true) {
          this.$Message.warning('Your recipe list has changed! Please recalculate.');
          await this.$store.dispatch('changeCalculated', false);
        }
        if (this.selectedRecipes.length === 0) {
          await this.$store.dispatch('clearCrafts');
        }
      },
    },
  },
  methods: {
    async addRecipe(obj) {
      await this.$store.dispatch('addRecipe', obj);
    },
    async removeRecipe(index) {
      await this.$store.dispatch('removeRecipe', index);
    },
    async clearRecipes() {
      await this.$store.dispatch('clearAll');
    },
    changePage(p) {
      this.page = p;
    },
    async calculateMats() {
      this.calculateLoading = true;
      const recipeQty = this.selectedRecipes.map((x) => ({
        name: x.name,
        image_url: x.image_url,
        mats: x.mats.map((y) => ({
          mat: y.mat,
          is_recipe: y.is_recipe,
          qty: (y.qty * x.qty),
          image_url: y.image_url,
        })),
      }));
      const allMats = flatten(map(recipeQty, 'mats'));
      const basicMats = allMats.filter((x) => x.is_recipe === false);
      const preCrafts = allMats.filter((x) => x.is_recipe === true);
      const moreMats = preCrafts.map((r) => ({
        name: r.mat,
        qty: r.qty,
        image_url: r.image_url,
        mats: this.recipeList.find((e) => e.name === r.mat).mats.map((y) => ({
          mat: y.mat,
          image_url: y.image_url,
          is_recipe: y.is_recipe,
          qty: (y.qty * r.qty),
        })),
      }));
      const stepTwoMats = flatten(map(moreMats, 'mats'));
      const twoBasic = stepTwoMats.filter((x) => x.is_recipe === false);
      const twoCrafts = stepTwoMats.filter((x) => x.is_recipe === true);
      const getAll = basicMats.concat(twoBasic);
      const stepThreeMats = twoCrafts.map((r) => ({
        name: r.mat,
        qty: r.qty,
        image_url: r.image_url,
        mats: this.recipeList.find((e) => e.name === r.mat).mats.map((y) => ({
          mat: y.mat,
          image_url: y.image_url,
          is_recipe: y.is_recipe,
          qty: (y.qty * r.qty),
        })),
      }));
      const basicThree = flatten(map(stepThreeMats, 'mats'));
      const definitelyAll = getAll.concat(basicThree);

      if (twoCrafts.length > 0) {
        await this.$store.dispatch('changePrePreCrafts', orderBy(map(groupBy(twoCrafts, 'mat'), (obj, key) => ({
          name: key,
          image_url: obj[0].image_url,
          qty: sumBy(obj, 'qty'),

        })), [(name) => name.name.toLowerCase()], ['asc']));
      } else {
        await this.$store.dispatch('changePrePreCrafts', orderBy(twoCrafts, [(name) => name.mat.toLowerCase()], ['asc']));
      }
      if (preCrafts.length > 0) {
        await this.$store.dispatch('changePreCrafts', orderBy(map(groupBy(preCrafts, 'mat'), (obj, key) => ({
          name: key,
          image_url: obj[0].image_url,
          qty: sumBy(obj, 'qty'),

        })), [(name) => name.name.toLowerCase()], ['asc']));
      } else {
        await this.$store.dispatch('changePrePreCrafts', orderBy(preCrafts, [(name) => name.mat.toLowerCase()], ['asc']));
      }

      await this.$store.dispatch('changeBasicMats', orderBy(map(groupBy(definitelyAll, 'mat'), (obj, key) => ({
        name: key,
        image_url: obj[0].image_url,
        qty: sumBy(obj, 'qty'),

      })), [(name) => name.name.toLowerCase()], ['asc']));

      await this.$store.dispatch('changeCalculated', true);
      this.calculateLoading = false;
    },
  },
  metaInfo: {
    title: 'ACNH DIY Materials Calculator',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },
};
</script>

<style>
html, body, #app {
  background-color: #AAE2C3;
}

.ivu-row-flex {
  margin-bottom: 10px;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 5% 0;
}
</style>
