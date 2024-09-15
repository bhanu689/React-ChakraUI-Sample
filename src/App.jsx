import React from 'react';
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import UserList from './Components/UserList';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserList />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;