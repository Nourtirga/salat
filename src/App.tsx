import React, { useEffect, useReducer } from 'react';
import 'reset-css';
import './App.css';
import moment from 'moment';

import Spinner from './common/Spinner';
import Clock from './components/Clock';
import PrayerCard from './components/PrayerCard';
import SelectList from './components/SelectList';
import ChangeLanguage from './components/ChangeLanguage';

import {
  cleanLocalStorage,
  getFromLocalStorageOrApi
} from './utils/localStorage';

import AppReducer from './context/AppReducer';
import { AppContext, initialState } from './context/AppContext';
import {
  LOAD_CITIES,
  LOAD_PRAYERS,
  CHANGE_CITY,
  CHANGE_LANGUAGE,
  REFRESH_TIME
} from './context/types';

const API_URL = 'https://maroc-salat.herokuapp.com/';

const App = () => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  useEffect(() => {
    async function init() {
      const PRAYERS_KEY = `prayers_${moment().date()}_${moment().month() + 1}`;
      const URL = `${API_URL}prayer?month=${moment().month() +
        1}&day=${moment().date()}`;
      const initalCities = await getFromLocalStorageOrApi(
        `cities_${state.lang}`,
        `${API_URL}city?lang=${state.lang}`
      );
      dispatch({ type: LOAD_CITIES, payload: initalCities });
      const initialPrayers = await getFromLocalStorageOrApi(PRAYERS_KEY, URL);
      dispatch({ type: LOAD_PRAYERS, payload: initialPrayers });
      cleanLocalStorage('id', 'cities_ar', 'cities_fr', 'lang', PRAYERS_KEY);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lang]);

  useEffect(() => {
    const interval = setInterval(
      () => dispatch({ type: REFRESH_TIME, payload: moment() }),
      1000
    );
    return () => {
      clearInterval(interval);
    };
  });

  const changeCity = (e: any) =>
    dispatch({ payload: e.value, type: CHANGE_CITY });

  const changeLanguage = (e: any) =>
    dispatch({ payload: e.target.value, type: CHANGE_LANGUAGE });

  return (
    <AppContext.Provider value={state}>
      <div id="main">
        <ChangeLanguage onChange={changeLanguage} />

        {state.id && state.prayers ? (
          <>
            <Clock />
            <PrayerCard />
            <SelectList onChange={changeCity} />
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;