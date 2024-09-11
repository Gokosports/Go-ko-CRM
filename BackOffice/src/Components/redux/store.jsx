// store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    // Add other reducers here if needed
  },
});
