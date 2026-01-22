import { getDefaultBase, getAllBase, getAllScheme, loadScheme, runMatsim, addScheme, saveScheme, delScheme, copyScheme } from "@/api/database";

const DataBaseKey = "DataBaseKey";
export function getDataBase() {
  return sessionStorage.getItem(DataBaseKey);
}

const DataSourceKey = "DataSourceKey";
export function getDataSource() {
  return sessionStorage.getItem(DataSourceKey);
}

const datasource = {
  state: {
    dataBase: "",
    dataBaseList: [],
    dataBaseListLoading: false,

    dataSource: "",
    dataSourceList: [],
    dataSourceListLoading: false,
  },

  mutations: {
    SET_DATA_BASE(state, dataBase) {
      sessionStorage.setItem(DataBaseKey, dataBase);
      state.dataBase = dataBase;
    },
    SET_DATA_BASE_LIST(state, dataBaseList) {
      state.dataBaseList = dataBaseList;
    },
    SET_DATA_BASE_LIST_LOADING(state, dataBaseListLoading) {
      state.dataBaseListLoading = dataBaseListLoading;
    },

    SET_DATA_SOURCE(state, dataSource) {
      sessionStorage.setItem(DataSourceKey, dataSource);
      state.dataSource = dataSource;
    },
    SET_DATA_SOURCE_LIST(state, dataSourceList) {
      state.dataSourceList = dataSourceList;
    },
    SET_DATA_SOURCE_LIST_LOADING(state, dataSourceListLoading) {
      state.dataSourceListLoading = dataSourceListLoading;
    },

    SET_DATA_SOURCE_RUN_STATUS(state, { index, runStatus }) {
      state.dataSourceList[index].runStatus = runStatus;
    },
    SET_DATA_SOURCE_LOAD_STATUS(state, { index, loadStatus }) {
      state.dataSourceList[index].loadStatus = loadStatus;
    },
    DELETE_DATA_SOURCE(state, { index }) {
      state.dataSourceList.splice(index, 1);
    },
  },

  actions: {
    async initDataBase({ commit, dispatch }) {
      commit("SET_DATA_BASE", "");
      commit("SET_DATA_BASE_LIST", []);
      commit("SET_DATA_SOURCE", "");
      commit("SET_DATA_SOURCE_LIST", []);
      await dispatch("getDataBaseList");
    },

    setDataBase({ commit }, dataBase) {
      commit("SET_DATA_BASE", dataBase);
    },
    setDataSource({ commit }, dataSource) {
      commit("SET_DATA_SOURCE", dataSource);
    },

    async getDefaultBase({ commit, state, dispatch }) {
      try {
        const res = await getDefaultBase();
        const [database, datasource] = res.data.name.split("/");
        commit("SET_DATA_BASE", database);
        commit("SET_DATA_SOURCE", datasource);
        return res;
      } catch (error) {}
    },

    async getDataBaseList({ commit }) {
      try {
        commit("SET_DATA_BASE_LIST_LOADING", true);
        const res = await getAllBase();
        commit(
          "SET_DATA_BASE_LIST",
          res.data.map((v) => ({ name: v })),
        );
        commit("SET_DATA_BASE_LIST_LOADING", false);
      } catch (error) {
        commit("SET_DATA_BASE_LIST", []);
        commit("SET_DATA_SOURCE_LIST_LOADING", false);
      }
    },
    async getDataSourceList({ commit }, dataBase) {
      try {
        commit("SET_DATA_SOURCE_LIST_LOADING", true);
        const res = await getAllScheme({
          base: dataBase,
        });
        commit("SET_DATA_SOURCE_LIST", res.data);
        commit("SET_DATA_SOURCE_LIST_LOADING", false);
      } catch (error) {
        commit("SET_DATA_SOURCE_LIST", []);
        commit("SET_DATA_SOURCE_LIST_LOADING", false);
      }
    },

    async saveDataSource({ commit, state, dispatch }, { key }) {
      try {
        const res = await saveScheme({ key });
        return res;
      } catch (error) {
        return Promise.reject(error);
      } finally {
        dispatch("getDataSourceList", state.dataBase);
      }
    },
    async createDataSource({ commit, state, dispatch }, { base, key, detail }) {
      try {
        const res = await addScheme({ base, key, detail });
        return res;
      } catch (error) {
        return Promise.reject(error);
      } finally {
        dispatch("getDataSourceList", state.dataBase);
      }
    },
    async copyDataSource({ commit, state, dispatch }, { source, target, detail }) {
      try {
        const res = await copyScheme({ source, target, detail });
        return res;
      } catch (error) {
        return Promise.reject(error);
      } finally {
        dispatch("getDataSourceList", state.dataBase);
      }
    },
    async loadDataSource({ commit, state, dispatch }, { name }) {
      try {
        let index = state.dataSourceList.findIndex((v) => v.name === name);
        if (index > -1) {
          commit("SET_DATA_SOURCE_LOAD_STATUS", {
            index,
            loadStatus: "加载中",
          });
        }
        await loadScheme({
          key: name,
        });
      } finally {
        dispatch("getDataSourceList", state.dataBase);
      }
    },
    async deleteDataSource({ commit, state, dispatch }, { name }) {
      try {
        let index = state.dataSourceList.findIndex((v) => v.name === name);
        if (index > -1) {
          commit("DELETE_DATA_SOURCE", { index });
        }
        await delScheme({
          key: name,
        });
      } finally {
        dispatch("getDataSourceList", state.dataBase);
      }
    },
    async runDataSource({ commit, state, dispatch }, { key }) {
      try {
        let index = state.dataSourceList.findIndex((v) => v.name === key);
        if (index > -1) {
          commit("SET_DATA_SOURCE_RUN_STATUS", { index, runStatus: "运行中" });
        }
        await runMatsim({
          key: key,
        });
      } finally {
        dispatch("getDataSourceList", state.dataBase);
      }
    },
  },
  getters: {
    dataBase: (state) => state.dataBase,
    dataBaseList: (state) => state.dataBaseList,
    dataSource: (state) => state.dataSource,
    dataSourceList: (state) => state.dataSourceList,
  },
};

export default datasource;
